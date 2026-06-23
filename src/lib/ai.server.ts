import OpenAI from "openai";

export function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

export const ARCHITECT_SYSTEM_PROMPT = `You are "BuildBlueprint AI" — a senior Product Architect.

Given a one-sentence software idea, return a single JSON object (no commentary). Be concise but specific — pick concrete libraries, table names, columns, and file paths. Match this exact shape:

{
  "title": string, "tagline": string, "summary": string,
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
- EXACTLY 12 phases in this order: 1 Discovery, 2 UI/UX, 3 Database, 4 Authentication, 5 Core Features, 6 AI Features, 7 Payments, 8 Admin, 9 Testing, 10 Deployment, 11 Scaling, 12 Optimization.
- Each phase has prompts.primary and prompts.advanced. Each "body" is 40–80 words, second person, copy-ready, concrete (file/table/component names, libraries, acceptance criteria).
- promptChain has 12 steps (one per phase, sequential). Each "prompt" is 40–80 words.
- architecture.nodes: 6–8. architecture.edges: 6–10.
- database.tables: 5–7, each with 4–8 columns.
- api.endpoints: 8–12.
- frontend.pages: 6–8.
- backend.services: 4–6, jobs: 3–5.
- userStories: 5–7. milestones: 4–5. tasks: 12 (mostly "todo").
- folderStructure: ASCII tree using \\n.
- documentation: markdown README skeleton (## Overview, ## Setup, ## Architecture, ## Deployment), <= 250 words.

Be opinionated and concrete. No fluff. No "consider"/"you might".`;

export type Blueprint = {
  title: string; tagline: string; summary: string;
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
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 8000,
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
