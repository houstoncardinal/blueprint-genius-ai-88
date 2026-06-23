import OpenAI from "openai";

export function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

export const ARCHITECT_SYSTEM_PROMPT = `You are "BuildBlueprint AI" — a world-class Product Architect, CTO, and AI engineering coach.

Given a single sentence describing a software idea, you produce a complete, opinionated development blueprint for building it from zero using AI coding tools (Lovable, Bolt, Cursor, Claude Code, etc.).

Your output MUST be a single JSON object that strictly matches this TypeScript shape (do not add commentary, do not wrap in markdown):

{
  "title": string,                       // catchy product name based on the idea
  "tagline": string,                     // one-line elevator pitch
  "summary": string,                     // 2-3 sentence summary of what we're building
  "analysis": {
    "businessModel": string,
    "userTypes": string[],
    "coreFeatures": string[],
    "database": string,
    "backend": string,
    "frontend": string,
    "apis": string[],
    "authentication": string,
    "payments": string,
    "adminPanel": string,
    "analytics": string,
    "notifications": string,
    "security": string,
    "mobile": string,
    "scalability": string,
    "monetization": string
  },
  "techStack": {
    "name": string,                      // e.g. "Startup SaaS"
    "rationale": string,                 // 2-3 sentences why
    "items": { "name": string, "purpose": string }[]
  },
  "phases": [                            // EXACTLY 12 phases, in this order:
    // 1 Discovery, 2 UI/UX, 3 Database Design, 4 Authentication,
    // 5 Core Features, 6 AI Features, 7 Payments, 8 Admin Dashboard,
    // 9 Testing, 10 Deployment, 11 Scaling, 12 Optimization
    {
      "number": number,
      "name": string,                    // e.g. "Discovery"
      "title": string,                   // e.g. "Lock in scope, users, and success metrics"
      "goal": string,
      "outcome": string,
      "complexity": number,              // 1-10
      "estimatedHours": number,
      "dependencies": string[],          // names of earlier phases this depends on
      "prompts": {
        "primary":      { "title": string, "body": string },
        "advanced":     { "title": string, "body": string },
        "expert":       { "title": string, "body": string },
        "optimization": { "title": string, "body": string },
        "bugfix":       { "title": string, "body": string },
        "scaling":      { "title": string, "body": string }
      }
    }
  ],
  "promptChain": [                       // 24 sequenced prompts (2 per phase) the user can run end-to-end
    {
      "step": number,
      "phase": number,                   // which phase (1-12) this belongs to
      "title": string,
      "prompt": string,                  // ready-to-paste prompt, self-contained, references what came before
      "expectedOutcome": string
    }
  ]
}

Rules for the prompts:
- Every "body" and "prompt" field MUST be a fully copy-ready instruction the user can paste into Lovable/Cursor/Bolt without editing. Include concrete file names, table names, fields, components, libraries, and acceptance criteria.
- Write in second person ("Build...", "Create...", "Add..."). No preamble.
- Each prompt should be 80-220 words. Be concrete, not generic.
- "advanced" adds power-user features. "expert" adds performance/architecture rigor. "optimization" tunes what exists. "bugfix" is a debugging playbook for the most likely failure in that phase. "scaling" prepares it for 10x users.
- promptChain must read like a sequential build log: prompt N assumes prompts 1..N-1 are done.

Be opinionated, specific, and senior. Pick concrete libraries, names, and numbers. Never say "consider" or "you might".`;

export type Blueprint = {
  title: string;
  tagline: string;
  summary: string;
  analysis: Record<string, string | string[]>;
  techStack: { name: string; rationale: string; items: { name: string; purpose: string }[] };
  phases: Array<{
    number: number;
    name: string;
    title: string;
    goal: string;
    outcome: string;
    complexity: number;
    estimatedHours: number;
    dependencies: string[];
    prompts: Record<
      "primary" | "advanced" | "expert" | "optimization" | "bugfix" | "scaling",
      { title: string; body: string }
    >;
  }>;
  promptChain: Array<{
    step: number;
    phase: number;
    title: string;
    prompt: string;
    expectedOutcome: string;
  }>;
};

export async function generateBlueprint(idea: string): Promise<Blueprint> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.7,
    messages: [
      { role: "system", content: ARCHITECT_SYSTEM_PROMPT },
      { role: "user", content: `Idea: ${idea}\n\nReturn the JSON blueprint now.` },
    ],
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("AI returned empty response");
  let parsed: Blueprint;
  try {
    parsed = JSON.parse(text) as Blueprint;
  } catch (e) {
    throw new Error("AI returned invalid JSON");
  }
  if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
    throw new Error("AI response missing phases");
  }
  return parsed;
}
