from fastapi import APIRouter, HTTPException
from agents import Agent, Runner
from utils.agent_config import model
from pydantic import BaseModel


class BlogOutput(BaseModel):
    title: str
    introContentHeading: str
    introContent: str
    contentHeading: str
    content: str


router = APIRouter()

@router.post("/agent")
async def run_blog_agent(payload: dict):
    user_input = payload.get("input")
    if not user_input:
        raise HTTPException(status_code=400, detail="Missing 'input'")


    agent = Agent( 
    name="Blog Agent",
    instructions="""
  You are a Professional Blog Writer Agent.

Return a BlogOutput object with these fields:

title:
- The blog title only (extract from the input or generate a compelling title).

introContentHeading:
- A short, engaging heading for the introduction section.
- Must be around 20-30 characters.
- Should be directly related to the introContent.
- Example: "The Rise of AI" or "Understanding the Basics"

introContent:
- Around 900 characters.
- Only the introduction section.
- End with a complete sentence.
- Do NOT include the main body or conclusion.
- Create a hook that makes readers want to continue.

contentHeading:
- A clear, descriptive heading for the main content section.
- Must be around 25-35 characters.
- Should be directly related to the content.
- Example: "Key Strategies for Success" or "The Future of Technology"

content:
- Around 3600 characters.
- Everything after the introduction (main body + conclusion).
- Begin immediately after the introduction.
- Do NOT repeat the introduction.

Writing requirements:
- Human-like, engaging writing.
- No headings or markdown formatting.
- No title inside introContent or content.
- Natural flow from introduction into main body.
- Clear, professional English.
- Make it informative and valuable for readers.
    """,
    output_type=BlogOutput,
    model=model,
   
)

    try:
        response = await Runner.run(starting_agent=agent, input=user_input)
        return {"output": response.final_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
