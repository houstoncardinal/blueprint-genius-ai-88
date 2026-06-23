import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const AGENT_KEYS = [
  "marketResearch",
  "pricingStrategy",
  "goToMarket",
  "marketingCopy",
  "investorPitch",
  "brandIdentity",
  "competitorAnalysis",
  "qaTestPlan",
  "securityAudit",
  "growthExperiments",
] as const;
export type AgentKey = (typeof AGENT_KEYS)[number];

export type AgentSpec = {
  key: AgentKey;
  name: string;
  blurb: string;
  emoji: string;
  systemPrompt: string;
};

export const AGENTS: AgentSpec[] = [
  {
    key: "marketResearch",
    name: "Market Research Analyst",
    blurb: "TAM/SAM/SOM, target segments, demand signals, risks.",
    emoji: "🔎",
    systemPrompt:
      "You are a senior market research analyst. Output concise markdown with these sections: ## Market Size (TAM/SAM/SOM with rough numbers and rationale), ## Target Segments (3-5 personas), ## Demand Signals, ## Competitive Landscape (top 5 with one-line positioning), ## Risks & Headwinds, ## Recommendation. Be specific. No fluff.",
  },
  {
    key: "pricingStrategy",
    name: "Pricing Strategist",
    blurb: "Pricing tiers, anchors, monetization model, unit economics.",
    emoji: "💎",
    systemPrompt:
      "You are a SaaS pricing strategist. Return markdown: ## Monetization Model, ## Recommended Tiers (table with Tier | Price | Who it's for | Key limits | 3 features), ## Anchoring & Decoys, ## Annual Discount, ## Unit Economics (CAC, payback, gross margin assumptions), ## A/B Tests to run first.",
  },
  {
    key: "goToMarket",
    name: "Go-To-Market Strategist",
    blurb: "Launch plan, channels, ICP, first 90 days.",
    emoji: "🚀",
    systemPrompt:
      "You are a GTM strategist. Return markdown: ## ICP (Ideal Customer Profile), ## Positioning Statement (one sentence), ## Channels (rank top 5 with effort/payoff), ## 90-Day Launch Plan (week-by-week), ## Activation Metrics, ## Wedge Strategy.",
  },
  {
    key: "marketingCopy",
    name: "Marketing Copywriter",
    blurb: "Landing copy: hero, sections, CTAs, social proof angles.",
    emoji: "✍️",
    systemPrompt:
      "You are a world-class landing-page copywriter (Harry Dry / Apple voice). Return markdown: ## Hero (Headline, Subhead, Primary CTA, Secondary CTA), ## Social Proof line, ## 3 Feature Sections (Title, 1-line, 3 bullets), ## Objection Handling, ## FAQ (5 Q/A), ## Email Capture line. Tight, concrete, no clichés.",
  },
  {
    key: "investorPitch",
    name: "Investor Pitch Writer",
    blurb: "Seed pitch deck outline + investor narrative.",
    emoji: "📈",
    systemPrompt:
      "You are a YC partner writing a seed pitch. Return markdown with 12 slides: Problem, Solution, Why Now, Market, Product, Traction, Business Model, GTM, Competition, Team, Financials, Ask. Each slide: 1 sentence + 3 bullets. End with ## Investor One-Liner and ## Top 5 Risks & Mitigations.",
  },
  {
    key: "brandIdentity",
    name: "Brand Identity Director",
    blurb: "Naming, tone, palette, type direction, logo brief.",
    emoji: "🎨",
    systemPrompt:
      "You are a brand identity director. Return markdown: ## Brand Personality (5 adjectives), ## Tone of Voice (do/don't), ## Naming (3 alternative names with rationale), ## Tagline (3 options), ## Color Palette (4 colors with hex + role), ## Typography (heading + body pair from Google Fonts), ## Logo Concept Brief (visual direction in 4 sentences).",
  },
  {
    key: "competitorAnalysis",
    name: "Competitive Intelligence",
    blurb: "Top competitors, feature gap matrix, differentiators.",
    emoji: "🛰️",
    systemPrompt:
      "You are a competitive intelligence analyst. Return markdown: ## Direct Competitors (top 5, each: name, URL guess, positioning, pricing, strength, weakness), ## Indirect Competitors (3), ## Feature Gap Matrix (table: feature | us | comp A | comp B | comp C), ## Defensible Differentiators (5), ## Counter-Positioning Strategy.",
  },
  {
    key: "qaTestPlan",
    name: "QA Test Plan Author",
    blurb: "Test strategy, critical user journeys, edge cases.",
    emoji: "🧪",
    systemPrompt:
      "You are a senior QA engineer. Return markdown: ## Test Strategy (unit / integration / e2e mix), ## Tooling (specific libraries), ## Critical User Journeys (5 with Given/When/Then), ## Edge Cases & Failure Modes (10), ## Performance Budgets (LCP, CLS, INP, API p95), ## Accessibility Checklist (WCAG AA), ## Release Gate Criteria.",
  },
  {
    key: "securityAudit",
    name: "Security Auditor",
    blurb: "Threat model, RLS review, secret handling, OWASP.",
    emoji: "🛡️",
    systemPrompt:
      "You are a security engineer. Return markdown: ## Threat Model (STRIDE summary), ## Auth & Session Risks, ## Database/RLS Checklist, ## Secret & Key Management, ## OWASP Top 10 mapped to this app, ## Logging & Incident Response, ## Pre-Launch Hardening Checklist (10 items).",
  },
  {
    key: "growthExperiments",
    name: "Growth Experimenter",
    blurb: "Backlog of high-leverage experiments with hypotheses.",
    emoji: "📊",
    systemPrompt:
      "You are a head of growth. Return markdown: ## North Star Metric, ## AARRR Funnel (one tactic per stage), ## Experiment Backlog (table: hypothesis | metric | effort | expected lift | priority) with 10 experiments, ## Activation Quick Wins (5), ## Retention Loops (3).",
  },
];

import { getOpenAI } from "./ai.server";

export const runAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        agent: z.enum(AGENT_KEYS),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("blueprints")
      .select("analysis,idea,title")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Blueprint not found");

    const spec = AGENTS.find((a) => a.key === data.agent);
    if (!spec) throw new Error("Unknown agent");

    const bp = (row.analysis ?? {}) as Record<string, unknown>;
    const context_blob = JSON.stringify(
      {
        idea: row.idea,
        title: row.title,
        summary: bp.summary,
        analysis: bp.analysis,
        techStack: bp.techStack,
        userTypes: (bp.analysis as Record<string, unknown> | undefined)?.userTypes,
      },
      null,
      2,
    ).slice(0, 6000);

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      max_tokens: 2800,
      messages: [
        {
          role: "system",
          content:
            spec.systemPrompt +
            "\n\nACCURACY MANDATE: Tailor every section specifically to the provided project context. Use the real domain, target users, and tech stack from the JSON. Cite real competitor names, real pricing benchmarks, and concrete numbers with brief rationale. Never output generic SaaS boilerplate or placeholder text like 'Company X' or 'Feature A'. If you lack information, state your assumption explicitly in one short line and proceed.",
        },
        {
          role: "user",
          content: `Project context (JSON):\n${context_blob}\n\nProduce the deliverable now as markdown only. No preamble. Be specific to THIS project.`,
        },
      ],
    });
    const markdown = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!markdown) throw new Error("Agent returned empty result");

    const existing = (bp.agents ?? {}) as Record<string, { markdown: string; runAt: string }>;
    const nextAgents = {
      ...existing,
      [data.agent]: { markdown, runAt: new Date().toISOString() },
    };
    const merged = { ...bp, agents: nextAgents };
    const { error: upErr } = await context.supabase
      .from("blueprints")
      .update({ analysis: merged as never })
      .eq("id", data.id);
    if (upErr) throw new Error(upErr.message);

    return { agent: data.agent, markdown, runAt: nextAgents[data.agent].runAt };
  });
