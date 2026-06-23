import OpenAI from "openai";

export function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

export const ARCHITECT_SYSTEM_PROMPT = `You are "BuildBlueprint AI" — a world-class Product Architect, CTO, and AI engineering coach.

Given a single sentence describing a software idea, you produce a complete, opinionated startup blueprint. Output a single JSON object (no commentary, no markdown) matching this shape:

{
  "title": string,
  "tagline": string,
  "summary": string,
  "analysis": {
    "businessModel": string, "userTypes": string[], "coreFeatures": string[],
    "database": string, "backend": string, "frontend": string, "apis": string[],
    "authentication": string, "payments": string, "adminPanel": string,
    "analytics": string, "notifications": string, "security": string,
    "mobile": string, "scalability": string, "monetization": string
  },
  "techStack": { "name": string, "rationale": string, "items": { "name": string, "purpose": string }[] },

  "architecture": {
    "summary": string,
    "nodes": [ { "id": string, "label": string, "kind": "client"|"service"|"database"|"external"|"queue"|"storage"|"ai", "description": string } ],
    "edges": [ { "source": string, "target": string, "label": string } ]
  },

  "database": {
    "summary": string,
    "tables": [
      {
        "name": string,
        "description": string,
        "columns": [ { "name": string, "type": string, "pk": boolean, "fk": string | null, "nullable": boolean, "notes": string } ]
      }
    ]
  },

  "api": {
    "summary": string,
    "endpoints": [
      { "method": "GET"|"POST"|"PATCH"|"PUT"|"DELETE", "path": string, "purpose": string, "auth": string, "requestBody": string, "response": string }
    ]
  },

  "frontend": { "summary": string, "pages": [ { "path": string, "purpose": string, "components": string[] } ], "designNotes": string },
  "backend": { "summary": string, "services": [ { "name": string, "responsibility": string } ], "jobs": string[] },
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
        "primary":      { "title": string, "body": string },
        "advanced":     { "title": string, "body": string },
        "expert":       { "title": string, "body": string },
        "optimization": { "title": string, "body": string },
        "bugfix":       { "title": string, "body": string },
        "scaling":      { "title": string, "body": string }
      }
    }
  ],

  "promptChain": [ { "step": number, "phase": number, "title": string, "prompt": string, "expectedOutcome": string } ]
}

Rules:
- EXACTLY 12 phases in this order: 1 Discovery, 2 UI/UX, 3 Database, 4 Authentication, 5 Core Features, 6 AI Features, 7 Payments, 8 Admin, 9 Testing, 10 Deployment, 11 Scaling, 12 Optimization.
- promptChain has 24 steps (2 per phase, sequential, each assuming previous done).
- Every "body" and "prompt" is copy-ready (80–220 words, second person, concrete file/table/component names, libraries, acceptance criteria — no "consider" / "you might").
- architecture.nodes: 6–10 nodes covering frontend client, API/backend services, database, auth, AI/ML, external integrations, queues/jobs, storage, analytics where relevant. edges describe real traffic ("HTTPS", "SQL", "webhook", "publish/subscribe", etc.).
- database.tables: 5–10 tables with realistic columns, PKs, FKs, and notes about RLS/indexes where useful.
- api.endpoints: 8–16 REST endpoints covering auth, CRUD for core resources, payments, admin.
- frontend.pages: 6–12 routes including auth, dashboard, settings, admin.
- backend.services: logical services (auth, billing, AI worker, notifications, search, etc.).
- folderStructure: a single string formatted as an ASCII tree (use \n and indents).
- userStories: 6–10 stories per primary user role.
- milestones: 4–6 milestones.
- tasks: 12–24 tasks, mostly in "todo" lane, distributed across phases.
- documentation: a markdown string acting as the README skeleton (## Overview, ## Setup, ## Architecture, ## Deployment).
- Be opinionated and specific. Pick concrete libraries, table names, column types, file paths, and numbers.`;

export type Blueprint = {
  title: string;
  tagline: string;
  summary: string;
  analysis: Record<string, string | string[]>;
  techStack: { name: string; rationale: string; items: { name: string; purpose: string }[] };
  architecture: {
    summary: string;
    nodes: { id: string; label: string; kind: string; description: string }[];
    edges: { source: string; target: string; label: string }[];
  };
  database: {
    summary: string;
    tables: {
      name: string;
      description: string;
      columns: { name: string; type: string; pk: boolean; fk: string | null; nullable: boolean; notes: string }[];
    }[];
  };
  api: {
    summary: string;
    endpoints: { method: string; path: string; purpose: string; auth: string; requestBody: string; response: string }[];
  };
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
    prompts: Record<
      "primary" | "advanced" | "expert" | "optimization" | "bugfix" | "scaling",
      { title: string; body: string }
    >;
  }[];
  promptChain: { step: number; phase: number; title: string; prompt: string; expectedOutcome: string }[];
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
  } catch {
    throw new Error("AI returned invalid JSON");
  }
  if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
    throw new Error("AI response missing phases");
  }
  return parsed;
}
