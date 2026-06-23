import OpenAI from "openai";

export function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

export const ARCHITECT_SYSTEM_PROMPT = `You are "BuildBlueprint AI" — a senior Product Architect + Chief of Staff.

You receive a short software idea (sometimes one sentence, sometimes a paragraph). Your job has TWO parts you must do in a single JSON response:

PART A — INTENT DECONSTRUCTION (read between the lines):
- Infer what the founder REALLY wants, not just what they typed. Imagine you are interviewing them for 30 minutes.
- Surface vision, the singular north-star metric, the 2-4 distinct audiences they will serve, the jobs-to-be-done for each, the 3-5 measurable success metrics with concrete targets and timeframes, the non-goals (what NOT to build), the binding constraints (budget/team/timeline/regulatory), the assumptions you are making, and the open questions a co-founder would ask.

PART B — EXECUTION PLAN (devise every track of work):
- Decompose the build into parallel workstreams (Product/UX, Frontend, Backend/Data, AI/ML, Infra/DevOps, Growth/GTM, Legal/Compliance — include only tracks that apply).
- For each track, sequence concrete items across weeks 1..N (N is your call, usually 8–16). Mark dependencies between items across tracks.
- Show what can run in parallel and what is blocking.

Return ONE JSON object (no commentary). Match this exact shape:

{
  "title": string, "tagline": string, "summary": string,

  "intent": {
    "vision": string,                                  // one inspiring sentence; what the world looks like when this exists
    "northStar": { "metric": string, "target": string, "rationale": string },
    "primaryAudiences": [ { "name": string, "description": string, "pain": string } ],   // 2-4
    "jobsToBeDone": [ { "audience": string, "job": string, "trigger": string, "outcome": string } ], // 3-6
    "successMetrics": [ { "name": string, "target": string, "timeframe": string, "why": string } ], // 3-5
    "nonGoals": string[],                              // 3-5; things explicitly NOT to build
    "constraints": [ { "kind": "budget"|"team"|"timeline"|"regulatory"|"technical"|"market", "detail": string } ],
    "assumptions": string[],                           // 3-5
    "openQuestions": string[]                          // 3-5; questions a co-founder would ask
  },

  "actionPlan": {
    "totalWeeks": number,                              // typically 8-16
    "tracks": [
      {
        "name": string,                                // e.g. "Product/UX", "Frontend", "Backend", "AI/ML", "Infra", "Growth", "Legal"
        "color": "indigo"|"emerald"|"amber"|"rose"|"sky"|"violet"|"slate",
        "items": [
          { "id": string, "title": string, "startWeek": number, "endWeek": number, "dependsOn": string[], "deliverable": string }
        ]
      }
    ],
    "criticalPath": string[]                           // ordered list of item ids on the critical path
  },

  "analysis": {
    "businessModel": string, "userTypes": string[], "coreFeatures": string[],
    "database": string, "backend": string, "frontend": string, "apis": string[],
    "authentication": string, "payments": string, "adminPanel": string,
    "analytics": string, "notifications": string, "security": string,
    "mobile": string, "scalability": string, "monetization": string
  },
  "techStack": { "name": string, "rationale": string, "items": [ { "name": string, "purpose": string } ] },
  "architecture": {
    "summary": string,
    "nodes": [ { "id": string, "label": string, "kind": "client"|"service"|"database"|"external"|"queue"|"storage"|"ai", "description": string } ],
    "edges": [ { "source": string, "target": string, "label": string } ]
  },
  "database": {
    "summary": string,
    "tables": [ { "name": string, "description": string,
      "columns": [ { "name": string, "type": string, "pk": boolean, "fk": string|null, "nullable": boolean, "notes": string } ] } ]
  },
  "api": {
    "summary": string,
    "endpoints": [ { "method": "GET"|"POST"|"PATCH"|"PUT"|"DELETE", "path": string, "purpose": string, "auth": string, "requestBody": string, "response": string } ]
  },
  "frontend": { "summary": string, "pages": [ { "path": string, "purpose": string, "components": string[] } ], "designNotes": string },
  "backend":  { "summary": string, "services": [ { "name": string, "responsibility": string } ], "jobs": string[] },
  "deployment": { "summary": string, "environments": string[], "hosting": string, "cicd": string, "infraNotes": string },
  "folderStructure": string,
  "userStories": [ { "role": string, "story": string, "acceptance": string[] } ],
  "milestones":   [ { "name": string, "outcome": string, "weeks": number } ],
  "tasks": [ { "id": string, "title": string, "lane": "todo"|"doing"|"done", "phase": number, "estimateHours": number } ],
  "documentation": string,
  "phases": [
    {
      "number": number, "name": string, "title": string,
      "goal": string, "outcome": string, "complexity": number, "estimatedHours": number,
      "dependencies": string[],
      "prompts": {
        "primary":  { "title": string, "body": string },
        "advanced": { "title": string, "body": string }
      }
    }
  ],
  "promptChain": [ { "step": number, "phase": number, "title": string, "prompt": string, "expectedOutcome": string } ]
}

Counts (strict):
- intent.primaryAudiences: 2-4. intent.jobsToBeDone: 3-6. intent.successMetrics: 3-5. intent.nonGoals: 3-5. intent.constraints: 3-6. intent.assumptions: 3-5. intent.openQuestions: 3-5.
- actionPlan.tracks: 4-6 (only relevant tracks). Each track has 3-7 items. Items must have startWeek <= endWeek <= totalWeeks. Item ids unique across tracks; use short kebab-case like "fe-auth".
- EXACTLY 12 phases in this order: 1 Discovery, 2 UI/UX, 3 Database, 4 Authentication, 5 Core Features, 6 AI Features, 7 Payments, 8 Admin, 9 Testing, 10 Deployment, 11 Scaling, 12 Optimization.
- Each phase prompt body is 40–80 words, second person, copy-ready, concrete (file/table/component names, libraries, acceptance criteria).
- promptChain has 12 steps. architecture.nodes 6–8, edges 6–10. database.tables 5–7. api.endpoints 8–12. frontend.pages 6–8. backend.services 4–6, jobs 3–5. userStories 5–7. milestones 4–5. tasks 12.
- folderStructure: ASCII tree using \\n. documentation: markdown README skeleton <= 250 words.

Be opinionated and concrete. No fluff. No "consider"/"you might".

ACCURACY MANDATE: Every field tailored to THIS idea — real domain entities, real competitor names, real library versions, realistic numbers with sources/rationale. If a section does not apply (e.g. payments for internal tool), say so explicitly and explain why. Intent fields must reflect what a thoughtful founder of THIS specific product would actually say — never generic SaaS boilerplate.`;

export type ActionItem = { id: string; title: string; startWeek: number; endWeek: number; dependsOn: string[]; deliverable: string };
export type ActionTrack = { name: string; color: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "slate"; items: ActionItem[] };

export type Blueprint = {
  title: string; tagline: string; summary: string;
  intent?: {
    vision: string;
    northStar: { metric: string; target: string; rationale: string };
    primaryAudiences: { name: string; description: string; pain: string }[];
    jobsToBeDone: { audience: string; job: string; trigger: string; outcome: string }[];
    successMetrics: { name: string; target: string; timeframe: string; why: string }[];
    nonGoals: string[];
    constraints: { kind: string; detail: string }[];
    assumptions: string[];
    openQuestions: string[];
  };
  actionPlan?: { totalWeeks: number; tracks: ActionTrack[]; criticalPath: string[] };
  analysis: Record<string, string | string[]>;
  techStack: { name: string; rationale: string; items: { name: string; purpose: string }[] };
  architecture: {
    summary: string;
    nodes: { id: string; label: string; kind: string; description: string }[];
    edges: { source: string; target: string; label: string }[];
  };
  database: {
    summary: string;
    tables: { name: string; description: string;
      columns: { name: string; type: string; pk: boolean; fk: string | null; nullable: boolean; notes: string }[] }[];
  };
  api: { summary: string; endpoints: { method: string; path: string; purpose: string; auth: string; requestBody: string; response: string }[] };
  frontend: { summary: string; pages: { path: string; purpose: string; components: string[] }[]; designNotes: string };
  backend: { summary: string; services: { name: string; responsibility: string }[]; jobs: string[] };
  deployment: { summary: string; environments: string[]; hosting: string; cicd: string; infraNotes: string };
  folderStructure: string;
  userStories: { role: string; story: string; acceptance: string[] }[];
  milestones: { name: string; outcome: string; weeks: number }[];
  tasks: { id: string; title: string; lane: "todo" | "doing" | "done"; phase: number; estimateHours: number }[];
  documentation: string;
  phases: {
    number: number; name: string; title: string; goal: string; outcome: string;
    complexity: number; estimatedHours: number; dependencies: string[];
    prompts: Record<"primary" | "advanced", { title: string; body: string }>;
  }[];
  promptChain: { step: number; phase: number; title: string; prompt: string; expectedOutcome: string }[];
};

export async function generateBlueprint(idea: string): Promise<Blueprint> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 16000,
    messages: [
      { role: "system", content: ARCHITECT_SYSTEM_PROMPT },
      { role: "user", content: `Idea: ${idea}\n\nReturn the JSON blueprint now.` },
    ],
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("AI returned empty response");
  let parsed: Blueprint;
  try { parsed = JSON.parse(text) as Blueprint; }
  catch { throw new Error("AI returned invalid JSON"); }
  if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
    throw new Error("AI response missing phases");
  }
  return parsed;
}
