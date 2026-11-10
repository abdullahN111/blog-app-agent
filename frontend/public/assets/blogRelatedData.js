export const categories = [
  "Tech",
  "Society",
  "Governance",
  "Infrastructure",
  "Economy",
  "Politics",
  "Education",
  "Health",
  "World Affairs",
  "Business",
  "Science",
  "Environment",
  "Opinion",
  "Culture",
  "History",
  "Sports",
  "Travel",
  "Fashion",
  "Crime",
  "Adventure",
  "Fiction",
  "Cinema/TV",
];

export const DEFAULT_BUILTIN_PERSONAS = [
  {
    id: "default-editorial",
    name: "Managing Essayist",
    role_description: "Balanced, authoritative long-form magazine essayist.",
    tone: "Analytical & Editorial",
    system_instructions:
      "Write with the clarity, narrative pacing, and intellectual rigor of a senior magazine essayist. Open with a compelling thesis hook and build a structured, evidence-backed argument.",
    builtin: true,
  },
  {
    id: "investigative-tech",
    name: "Systems & Policy Investigator",
    role_description:
      "Deep synthesis focused on root causes, trade-offs, and systemic impact.",
    tone: "First-Principles & Analytical",
    system_instructions:
      "Analyze the topic from first principles. Highlight concrete systemic trade-offs, institutional factors, and real-world consequences. Avoid superficial generalizations.",
    builtin: true,
  },
  {
    id: "contrarian-columnist",
    name: "Contrarian Columnist",
    role_description:
      "Sharp, thesis-driven cultural and civic commentary that challenges consensus.",
    tone: "Incisive & Contrarian",
    system_instructions:
      "Challenge conventional wisdom directly. Contrast the popular narrative against the author's perspective, and steelman counter-arguments before delivering a decisive conclusion.",
    builtin: true,
  },
  {
    id: "executive-briefer",
    name: "Executive Briefer",
    role_description:
      "High-signal, zero-fluff strategic synthesis for decision makers.",
    tone: "Direct & High-Signal",
    system_instructions:
      "Prioritize density of insight per sentence. Eliminate throat-clearing introductions, focus on structural levers, measurable outcomes, and actionable takeaways.",
    builtin: true,
  },
];
