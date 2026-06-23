import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Guided intake wizard.
 * Given the raw idea + any prior Q&A, the AI either:
 *   - asks the next batch of clarifying questions (done=false), or
 *   - returns a refined brief + confidence score (done=true).
 *
 * Public on purpose — no DB writes, just an AI round-trip. The blueprint
 * insert still requires auth.
 */

const QAItem = z.object({
  question: z.string(),
  answer: z.string().default(""),
});

const Input = z.object({
  idea: z.string().trim().min(4).max(600),
  history: z.array(QAItem).max(20).default([]),
  round: z.number().int().min(0).max(5).default(0),
});

const INTAKE_PROMPT = `You are "BuildBlueprint Intake" — a senior product strategist running a 90-second discovery interview with a founder.

Your job is to make the founder's intent and success metrics UNAMBIGUOUS before any blueprint is generated. You will be called multiple times. Each call you receive:
- the original idea
- the full Q&A history so far (their answers may be empty if they skipped)
- the round number (0 = first call)

DECISION RULES:
- If you can confidently infer (a) the primary audience, (b) the singular core outcome the product delivers, (c) at least 2 measurable success metrics, AND (d) the binding constraint (budget OR timeline OR team), return done=true.
- Otherwise return done=false with 2–4 sharp, mutually-exclusive clarifying questions. Each question must materially change the blueprint if answered differently. Never ask trivia, never ask "what colors do you like", never ask things you can reasonably infer.
- HARD CAP: by round 3 you MUST return done=true and just flag any remaining unknowns inside refinedBrief.uncertainties.
- Questions should be answerable in <15 seconds. Offer 3–4 concrete suggested answers per question (the user can click one or type their own).

Return ONE JSON object only, matching exactly one of these two shapes:

A) NEEDS MORE INFO:
{
  "done": false,
  "rationale": string,                         // 1 sentence on what's still unclear
  "confidence": number,                        // 0-100, your CURRENT confidence
  "questions": [
    {
      "id": string,                            // short kebab-case
      "question": string,                      // <= 140 chars, plain English
      "why": string,                           // 1 short sentence on why this matters
      "suggestions": string[]                  // 3-4 short concrete picks
    }
  ]
}

B) READY:
{
  "done": true,
  "confidence": number,                        // 0-100
  "refinedBrief": {
    "headline": string,                        // 1 sentence pitch in the founder's voice
    "audience": string,                        // who exactly
    "coreOutcome": string,                     // the singular outcome
    "successMetrics": string[],                // 2-4 measurable targets w/ timeframe
    "constraints": string[],                   // 1-3 binding constraints
    "assumptions": string[],                   // 2-4 explicit assumptions
    "uncertainties": string[]                  // 0-4 things still unclear (empty array is fine)
  },
  "blueprintPrompt": string                    // the FINAL prompt to feed the architect: 80-160 words, dense, no fluff, second person, includes everything above
}

Be ruthless about cutting fluff. Never hedge ("maybe", "could", "you might"). Never repeat a question the founder already answered.`;

export const clarifyIntake = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const { getOpenAI } = await import("./ai.server");
    const openai = getOpenAI();

    const historyBlock = data.history.length
      ? data.history.map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer || "(skipped)"}`).join("\n\n")
      : "(no answers yet)";

    const userMsg = `Original idea: ${data.idea}\n\nRound: ${data.round}\n\nHistory:\n${historyBlock}\n\nReturn your JSON now.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2500,
      messages: [
        { role: "system", content: INTAKE_PROMPT },
        { role: "user", content: userMsg },
      ],
    });
    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("AI returned empty response");
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { throw new Error("AI returned invalid JSON"); }

    // Force done=true by round 3 even if model didn't comply
    const out = parsed as { done?: boolean; [k: string]: unknown };
    if (data.round >= 3 && !out.done) {
      // ask model to finalize
      const finalize = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000,
        messages: [
          { role: "system", content: INTAKE_PROMPT },
          { role: "user", content: userMsg + "\n\nROUND CAP REACHED. You MUST return done=true now with refinedBrief + blueprintPrompt." },
        ],
      });
      const text2 = finalize.choices[0]?.message?.content;
      if (!text2) throw new Error("AI returned empty response");
      parsed = JSON.parse(text2);
    }
    return parsed as IntakeResponse;
  });

export type IntakeQuestion = { id: string; question: string; why: string; suggestions: string[] };
export type IntakeBrief = {
  headline: string;
  audience: string;
  coreOutcome: string;
  successMetrics: string[];
  constraints: string[];
  assumptions: string[];
  uncertainties: string[];
};
export type IntakeResponse =
  | { done: false; rationale: string; confidence: number; questions: IntakeQuestion[] }
  | { done: true; confidence: number; refinedBrief: IntakeBrief; blueprintPrompt: string };
