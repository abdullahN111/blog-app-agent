import asyncio
import hashlib
import os
import time
from collections import deque
from datetime import datetime, timedelta, timezone
from typing import Annotated, List, Optional

from agents import Agent, OpenAIChatCompletionsModel, Runner
from fastapi import APIRouter, Depends, Header, HTTPException
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from utils import models
from utils.agent_config import MODEL, base_url, model as default_model
from utils.auth import get_current_user, get_optional_user

router = APIRouter()
db_dependency = Annotated[Session, Depends(models.get_db)]

# ---------------------------------------------------------------------------
# Free-Tier Rate-Limit, Concurrency & Prompt Cache Safeguards
# ---------------------------------------------------------------------------
GLOBAL_CONCURRENCY_SEMAPHORE = asyncio.Semaphore(2)
GLOBAL_RPM_LIMIT = int(os.getenv("GEMINI_RPM_LIMIT", "10"))
GLOBAL_WINDOW_SECONDS = 60
_request_timestamps: deque[float] = deque()

STANDARD_DAILY_QUOTA = int(os.getenv("USER_DAILY_AGENT_QUOTA", "5"))
ADMIN_DAILY_QUOTA = int(os.getenv("ADMIN_DAILY_AGENT_QUOTA", "50"))
ADMIN_EMAILS = {
    e.strip().lower()
    for e in [
        os.getenv("ADMIN_EMAIL", ""),
        os.getenv("MOD_EMAIL", ""),
        os.getenv("NEXT_PUBLIC_ADMIN_EMAIL", ""),
        os.getenv("NEXT_PUBLIC_MOD_EMAIL", ""),
    ]
    if e and e.strip()
}

CACHE_TTL_SECONDS = 900  # 15-minute idempotency & prompt cache
_prompt_cache: dict[str, tuple[float, dict]] = {}


def _is_admin_user(user: Optional[models.User]) -> bool:
    if not user or not user.email:
        return False
    return user.email.lower() in ADMIN_EMAILS


def _get_user_daily_limit(user: Optional[models.User]) -> int:
    return ADMIN_DAILY_QUOTA if _is_admin_user(user) else STANDARD_DAILY_QUOTA


def _get_user_24h_usage(db: Session, user_id: int) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    return (
        db.query(models.AgentUsageLog)
        .filter(
            models.AgentUsageLog.user_id == user_id,
            models.AgentUsageLog.created_at >= cutoff,
        )
        .count()
    )


async def _acquire_global_rate_slot():
    """Serializes bursts so free-tier gemini-2.5-flash RPM limits are respected."""
    now = time.monotonic()
    while _request_timestamps and now - _request_timestamps[0] >= GLOBAL_WINDOW_SECONDS:
        _request_timestamps.popleft()

    if len(_request_timestamps) >= GLOBAL_RPM_LIMIT:
        wait_for = GLOBAL_WINDOW_SECONDS - (now - _request_timestamps[0]) + 0.25
        if wait_for > 12:
            raise HTTPException(
                status_code=429,
                detail=f"Studio AI pool is at capacity ({GLOBAL_RPM_LIMIT} req/min free-tier cap). Please retry in {int(wait_for)}s or provide your own Gemini API key.",
            )
        await asyncio.sleep(max(0.1, wait_for))

    _request_timestamps.append(time.monotonic())


def _resolve_model(user_gemini_key: Optional[str] = None):
    if user_gemini_key and user_gemini_key.strip():
        custom_client = AsyncOpenAI(
            api_key=user_gemini_key.strip(),
            base_url=base_url,
        )
        return OpenAIChatCompletionsModel(model=MODEL, openai_client=custom_client)
    return default_model


# ---------------------------------------------------------------------------
# Built-in Editorial Personas
# ---------------------------------------------------------------------------
BUILTIN_PERSONAS = [
    {
        "id": "default-editorial",
        "name": "Managing Essayist",
        "role_description": "Balanced, authoritative long-form magazine essayist.",
        "tone": "Analytical & Editorial",
        "system_instructions": (
            "Write with the clarity, narrative pacing, and intellectual rigor of a senior magazine essayist. "
            "Open with a compelling thesis hook and build a structured, evidence-backed argument."
        ),
        "builtin": True,
    },
    {
        "id": "investigative-tech",
        "name": "Systems & Tech Investigator",
        "role_description": "Deep technical synthesis focused on architecture, trade-offs, and first principles.",
        "tone": "First-Principles & Technical",
        "system_instructions": (
            "Analyze the topic from first principles. Highlight concrete architectural trade-offs, "
            "second-order consequences, and real-world engineering or industry implications. Avoid hype."
        ),
        "builtin": True,
    },
    {
        "id": "contrarian-columnist",
        "name": "Contrarian Columnist",
        "role_description": "Sharp, thesis-driven cultural and industry commentary that challenges consensus.",
        "tone": "Incisive & Contrarian",
        "system_instructions": (
            "Challenge conventional wisdom directly. Contrast the popular narrative against the author's perspective, "
            "and steelman counter-arguments before delivering a decisive conclusion."
        ),
        "builtin": True,
    },
    {
        "id": "executive-briefer",
        "name": "Executive Briefer",
        "role_description": "High-signal, zero-fluff strategic synthesis for decision makers.",
        "tone": "Direct & High-Signal",
        "system_instructions": (
            "Prioritize density of insight per sentence. Eliminate throat-clearing introductions, "
            "focus on strategic levers, measurable outcomes, and actionable takeaways."
        ),
        "builtin": True,
    },
]


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class BlogOutput(BaseModel):
    title: str
    introContentHeading: str
    introContent: str
    contentHeading: str
    content: str
    headline_alternatives: List[str] = Field(default_factory=list)
    suggested_category: str = "Tech"
    seo_tags: List[str] = Field(default_factory=list)
    quality_score: int = 88
    editorial_notes: str = ""


class AssistOutput(BaseModel):
    revised_text: str
    editorial_summary: str
    headline_suggestions: List[str] = Field(default_factory=list)
    quality_score: int = 90


class AssistRequest(BaseModel):
    action: str = Field(..., description="sharpen | expand | condense | counter_argument | evaluate")
    text: str = Field(..., min_length=10, max_length=12000)
    context_title: Optional[str] = ""
    persona_id: Optional[str] = "default-editorial"


# ---------------------------------------------------------------------------
# Quota & Persona Endpoints
# ---------------------------------------------------------------------------
@router.get("/agent/quota")
async def get_agent_quota(
    db: db_dependency,
    user: Optional[models.User] = Depends(get_optional_user),
):
    now = time.monotonic()
    active_rpm = sum(1 for t in _request_timestamps if now - t < GLOBAL_WINDOW_SECONDS)

    if not user:
        return {
            "authenticated": False,
            "used_today": 0,
            "daily_limit": STANDARD_DAILY_QUOTA,
            "remaining": 0,
            "global_rpm_used": active_rpm,
            "global_rpm_limit": GLOBAL_RPM_LIMIT,
        }

    used = _get_user_24h_usage(db, user.id)
    limit = _get_user_daily_limit(user)
    return {
        "authenticated": True,
        "is_admin": _is_admin_user(user),
        "used_today": used,
        "daily_limit": limit,
        "remaining": max(0, limit - used),
        "global_rpm_used": active_rpm,
        "global_rpm_limit": GLOBAL_RPM_LIMIT,
    }


@router.get("/agent/personas")
async def list_agent_personas(
    db: db_dependency,
    user: Optional[models.User] = Depends(get_optional_user),
):
    custom_personas = []
    if user:
        rows = (
            db.query(models.AgentPersona)
            .filter(
                (models.AgentPersona.user_id == user.id)
                | (models.AgentPersona.is_public.is_(True))
            )
            .order_by(models.AgentPersona.created_at.desc())
            .all()
        )
        custom_personas = [
            {
                "id": f"custom-{r.id}",
                "db_id": r.id,
                "name": r.name,
                "role_description": r.role_description,
                "tone": r.tone,
                "system_instructions": r.system_instructions,
                "is_public": r.is_public,
                "is_owner": r.user_id == user.id,
                "builtin": False,
            }
            for r in rows
        ]

    return {
        "personas": [*BUILTIN_PERSONAS, *custom_personas],
    }


@router.post("/agent/personas", response_model=models.AgentPersonaModel)
async def create_agent_persona(
    persona: models.AgentPersonaCreate,
    db: db_dependency,
    user: models.User = Depends(get_current_user),
):
    name = persona.name.strip()
    role = persona.role_description.strip()
    instructions = persona.system_instructions.strip()

    if len(name) < 2 or len(name) > 60:
        raise HTTPException(status_code=400, detail="Persona name must be between 2 and 60 characters.")
    if len(instructions) < 15 or len(instructions) > 2000:
        raise HTTPException(status_code=400, detail="System instructions must be between 15 and 2,000 characters.")

    existing_count = (
        db.query(models.AgentPersona)
        .filter(models.AgentPersona.user_id == user.id)
        .count()
    )
    if existing_count >= 15:
        raise HTTPException(status_code=400, detail="Maximum of 15 custom personas per user reached.")

    new_persona = models.AgentPersona(
        user_id=user.id,
        name=name,
        role_description=role[:200],
        tone=persona.tone.strip()[:80] or "Analytical & Editorial",
        system_instructions=instructions,
        is_public=persona.is_public,
    )
    db.add(new_persona)
    db.commit()
    db.refresh(new_persona)
    return new_persona


@router.delete("/agent/personas/{persona_id}")
async def delete_agent_persona(
    persona_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user),
):
    persona = (
        db.query(models.AgentPersona)
        .filter(
            models.AgentPersona.id == persona_id,
            models.AgentPersona.user_id == user.id,
        )
        .first()
    )
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found or unauthorized.")

    db.delete(persona)
    db.commit()
    return {"message": "Persona deleted successfully"}


def _resolve_persona_instructions(db: Session, persona_id: Optional[str]) -> tuple[str, str]:
    if not persona_id:
        p = BUILTIN_PERSONAS[0]
        return p["name"], p["system_instructions"]

    for b in BUILTIN_PERSONAS:
        if b["id"] == persona_id:
            return b["name"], b["system_instructions"]

    if persona_id.startswith("custom-"):
        try:
            raw_id = int(persona_id.replace("custom-", ""))
            row = db.query(models.AgentPersona).filter(models.AgentPersona.id == raw_id).first()
            if row:
                return row.name, f"Tone: {row.tone}.\nRole: {row.role_description}.\n{row.system_instructions}"
        except ValueError:
            pass

    p = BUILTIN_PERSONAS[0]
    return p["name"], p["system_instructions"]


# ---------------------------------------------------------------------------
# Primary Blog Generation Agent Endpoint
# ---------------------------------------------------------------------------
@router.post("/agent")
async def run_blog_agent(
    payload: dict,
    db: db_dependency,
    user: Optional[models.User] = Depends(get_optional_user),
    x_gemini_key: Optional[str] = Header(default=None, alias="X-Gemini-Key"),
):
    user_input = (payload.get("input") or "").strip()
    persona_id = payload.get("persona_id") or "default-editorial"

    if not user_input:
        raise HTTPException(status_code=400, detail="Missing 'input'")
    if len(user_input) > 4000:
        raise HTTPException(
            status_code=400,
            detail="Input brief exceeds maximum allowed length (4,000 characters).",
        )

    using_custom_key = bool(x_gemini_key and x_gemini_key.strip())

    # Enforce per-user 24h quota when using the shared free-tier Gemini key
    if user and not using_custom_key:
        used = _get_user_24h_usage(db, user.id)
        limit = _get_user_daily_limit(user)
        if used >= limit:
            raise HTTPException(
                status_code=429,
                detail=(
                    f"Daily AI Studio quota reached ({used}/{limit} generations used in the last 24h). "
                    "Add your own free Google AI Studio key in Studio Settings for unlimited generations, or try again tomorrow."
                ),
            )

    # Check 15-minute prompt cache to prevent duplicate token spend on retries
    cache_seed = f"{user.id if user else 'anon'}::{persona_id}::{user_input.lower()}"
    prompt_hash = hashlib.sha256(cache_seed.encode("utf-8")).hexdigest()[:32]
    now = time.monotonic()

    if prompt_hash in _prompt_cache:
        cached_at, cached_output = _prompt_cache[prompt_hash]
        if now - cached_at < CACHE_TTL_SECONDS:
            return {"output": cached_output, "cached": True}

    persona_name, persona_instructions = _resolve_persona_instructions(db, persona_id)

    # Fetch up to 5 recent published blog titles for contextual internal awareness
    recent_blogs = (
        db.query(models.Blog.title, models.Blog.category)
        .filter(models.Blog.published.is_(True))
        .order_by(models.Blog.created_at.desc())
        .limit(5)
        .all()
    )
    archive_context = ""
    if recent_blogs:
        items = ", ".join(f'"{b.title}" ({b.category})' for b in recent_blogs)
        archive_context = f"\nRecent publication archive context (avoid duplicating these exact angles; reference naturally only if directly relevant): {items}\n"

    agent = Agent(
        name=f"Blogout — {persona_name}",
        instructions=f"""
You are a Senior Editorial Writer Agent for Blogout, operating under the persona: {persona_name}.
Persona Directives:
{persona_instructions}
{archive_context}
Return a BlogOutput object with these fields:

title:
- A compelling, publication-grade headline for the essay.

introContentHeading:
- A sharp subheading for the opening section (20-35 characters).

introContent:
- Around 900 characters.
- The opening lead section only. End with a complete sentence.
- Establish the central tension and hook the reader immediately.

contentHeading:
- A clear, descriptive subheading for the core analysis section (25-40 characters).

content:
- Around 3600 characters.
- The full body analysis and conclusion immediately following the introduction.
- Do NOT repeat the introduction. Use clear paragraph breaks.

headline_alternatives:
- Provide 3 distinct alternative headlines (1. Analytical, 2. Contrarian/Provocative, 3. Narrative) for A/B selection.

suggested_category:
- Best matching section from: Tech, Society, Governance, Infrastructure, Economy, Politics, Education, Health, World Affairs, Business, Science, Environment, Opinion, Culture, History, Sports, Travel, Fashion, Crime, Adventure, Fiction, Cinema/TV.

seo_tags:
- 4 to 5 concise topic tags for search and indexing.

quality_score:
- An integer from 75 to 98 rating the depth, thesis clarity, and structure of the draft.

editorial_notes:
- 1-2 sentences explaining the structural angle chosen and one suggestion for the human author.

Writing requirements:
- Human-like, authoritative editorial prose.
- Plain text with clean paragraph separation (no markdown # symbols inside introContent or content).
- No title repeated inside introContent or content.
        """,
        output_type=BlogOutput,
        model=_resolve_model(x_gemini_key),
    )

    try:
        async with GLOBAL_CONCURRENCY_SEMAPHORE:
            if not using_custom_key:
                await _acquire_global_rate_slot()
            response = await Runner.run(starting_agent=agent, input=user_input)

        final_out = response.final_output
        serialized = final_out.model_dump() if hasattr(final_out, "model_dump") else final_out

        _prompt_cache[prompt_hash] = (time.monotonic(), serialized)

        if user and not using_custom_key:
            log_entry = models.AgentUsageLog(
                user_id=user.id,
                action_type="generate_blog",
                prompt_hash=prompt_hash,
                estimated_tokens=1350,
            )
            db.add(log_entry)
            db.commit()

        return {"output": serialized, "cached": False}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Contextual Co-Pilot / Manuscript Refinement Endpoint
# ---------------------------------------------------------------------------
@router.post("/agent/assist")
async def run_editorial_assist(
    req: AssistRequest,
    db: db_dependency,
    user: Optional[models.User] = Depends(get_optional_user),
    x_gemini_key: Optional[str] = Header(default=None, alias="X-Gemini-Key"),
):
    using_custom_key = bool(x_gemini_key and x_gemini_key.strip())

    if user and not using_custom_key:
        used = _get_user_24h_usage(db, user.id)
        limit = _get_user_daily_limit(user)
        if used >= limit:
            raise HTTPException(
                status_code=429,
                detail=f"Daily AI Studio quota reached ({used}/{limit}). Supply a personal Gemini API key in Studio Settings to continue.",
            )

    action_prompts = {
        "sharpen": "Sharpen the prose, eliminate filler words, and make the central thesis more punchy while preserving the author's voice and approximate length.",
        "expand": "Expand this section with deeper analytical rigor, concrete real-world examples, and clearer transitions.",
        "condense": "Condense and tighten this text by roughly 25% while retaining every core argument and insight.",
        "counter_argument": "Weave a fair, intellectually honest counter-argument (steelman) into this section and show why the core thesis still holds.",
        "evaluate": "Keep revised_text identical to the input, and provide an honest editorial critique in editorial_summary, 3 stronger headline_suggestions, and an objective quality_score (1-100).",
    }

    directive = action_prompts.get(req.action, action_prompts["sharpen"])
    persona_name, persona_instructions = _resolve_persona_instructions(db, req.persona_id)

    assist_agent = Agent(
        name=f"Editorial Co-Pilot ({persona_name})",
        instructions=f"""
You are a Senior Managing Editor assisting an author on Blogout.
Persona style: {persona_instructions}

Task Directive:
{directive}

Formatting rules:
- Return plain text with clean paragraph breaks in `revised_text` (no markdown # headers).
- Provide a concise 1-2 sentence explanation of your edits in `editorial_summary`.
- Provide 3 strong alternative headlines in `headline_suggestions`.
- Provide a `quality_score` between 70 and 99.
        """,
        output_type=AssistOutput,
        model=_resolve_model(x_gemini_key),
    )

    try:
        async with GLOBAL_CONCURRENCY_SEMAPHORE:
            if not using_custom_key:
                await _acquire_global_rate_slot()
            response = await Runner.run(
                starting_agent=assist_agent,
                input=f"Headline Context: {req.context_title}\n\nManuscript Text:\n{req.text}",
            )

        if user and not using_custom_key:
            db.add(
                models.AgentUsageLog(
                    user_id=user.id,
                    action_type=f"assist_{req.action}",
                    estimated_tokens=800,
                )
            )
            db.commit()

        final_out = response.final_output
        serialized = final_out.model_dump() if hasattr(final_out, "model_dump") else final_out
        return {"output": serialized}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
