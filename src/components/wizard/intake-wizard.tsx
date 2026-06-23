import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Check, X, Wand2, ListChecks, Gauge, AlertTriangle } from "lucide-react";
import { clarifyIntake, type IntakeQuestion, type IntakeBrief, type IntakeResponse } from "@/lib/intake.functions";

type Props = {
  onCancel: () => void;
  onComplete: (args: { brief: IntakeBrief; blueprintPrompt: string; confidence: number }) => void;
};

type QA = { question: string; answer: string };

export function IntakeWizard({ onCancel, onComplete }: Props) {
  const clarify = useServerFn(clarifyIntake);
  const [idea, setIdea] = useState("");
  const [phase, setPhase] = useState<"idea" | "questions" | "review">("idea");
  const [round, setRound] = useState(0);
  const [history, setHistory] = useState<QA[]>([]);
  const [currentQs, setCurrentQs] = useState<IntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brief, setBrief] = useState<IntakeBrief | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [blueprintPrompt, setBlueprintPrompt] = useState<string>("");

  const ask = useMutation({
    mutationFn: async (input: { idea: string; history: QA[]; round: number }) =>
      (await clarify({ data: input })) as IntakeResponse,
    onSuccess: (res) => {
      setConfidence(res.confidence ?? 0);
      if (res.done) {
        setBrief(res.refinedBrief);
        setBlueprintPrompt(res.blueprintPrompt);
        setPhase("review");
      } else {
        setCurrentQs(res.questions ?? []);
        setAnswers({});
        setPhase("questions");
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Intake failed"),
  });

  const start = () => {
    if (idea.trim().length < 8) return toast.error("Describe your idea in a sentence (8+ chars).");
    setHistory([]);
    setRound(0);
    ask.mutate({ idea: idea.trim(), history: [], round: 0 });
  };

  const submitAnswers = () => {
    const newHistory: QA[] = [
      ...history,
      ...currentQs.map((q) => ({ question: q.question, answer: (answers[q.id] ?? "").trim() })),
    ];
    setHistory(newHistory);
    const nextRound = round + 1;
    setRound(nextRound);
    ask.mutate({ idea: idea.trim(), history: newHistory, round: nextRound });
  };

  return (
    <section className="lux-card relative overflow-hidden p-5 sm:p-8">
      <button
        onClick={onCancel}
        className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label="Close wizard"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
        <Wand2 className="h-3.5 w-3.5" /> Guided Intake · Round {phase === "idea" ? 0 : round + (phase === "review" ? 0 : 1)} of 3
      </div>
      <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
        {phase === "idea" && "What are you really building?"}
        {phase === "questions" && "A few quick questions"}
        {phase === "review" && "Here's what I understand"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {phase === "idea" && "One sentence. I'll ask follow-ups until your intent is unambiguous."}
        {phase === "questions" && "Tap a suggestion or write your own. Skip any that don't apply."}
        {phase === "review" && "Confirm or correct, then I'll generate your blueprint."}
      </p>

      {/* IDEA */}
      {phase === "idea" && (
        <div className="mt-6 space-y-3">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A bookkeeping CRM for solo accountants who hate spreadsheets"
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-background/50 px-4 py-3 text-base outline-none ring-ring focus:ring-2"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button
              onClick={start}
              disabled={ask.isPending}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Start interview
            </button>
          </div>
        </div>
      )}

      {/* QUESTIONS */}
      {phase === "questions" && (
        <div className="mt-6 space-y-5">
          <ConfidenceBar value={confidence} />
          {currentQs.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">{q.question}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{q.why}</div>
                  {q.suggestions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {q.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: s }))}
                          className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                            answers[q.id] === s
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    placeholder="…or type your own answer"
                    className="mt-3 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              onClick={() => { setPhase("idea"); }}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Edit idea
            </button>
            <button
              onClick={submitAnswers}
              disabled={ask.isPending}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {round >= 2 ? "Finalize brief" : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* REVIEW */}
      {phase === "review" && brief && (
        <div className="mt-6 space-y-4">
          <ConfidenceBar value={confidence} />

          <EditableField
            label="Headline"
            value={brief.headline}
            onChange={(v) => setBrief({ ...brief, headline: v })}
          />
          <EditableField
            label="Primary audience"
            value={brief.audience}
            onChange={(v) => setBrief({ ...brief, audience: v })}
          />
          <EditableField
            label="Core outcome"
            value={brief.coreOutcome}
            onChange={(v) => setBrief({ ...brief, coreOutcome: v })}
          />

          <EditableList
            label="Success metrics"
            icon={<ListChecks className="h-3.5 w-3.5" />}
            items={brief.successMetrics}
            onChange={(items) => setBrief({ ...brief, successMetrics: items })}
          />
          <EditableList
            label="Constraints"
            icon={<ListChecks className="h-3.5 w-3.5" />}
            items={brief.constraints}
            onChange={(items) => setBrief({ ...brief, constraints: items })}
          />
          <EditableList
            label="Assumptions"
            icon={<ListChecks className="h-3.5 w-3.5" />}
            items={brief.assumptions}
            onChange={(items) => setBrief({ ...brief, assumptions: items })}
          />

          {brief.uncertainties?.length > 0 && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5" /> Remaining uncertainties
              </div>
              <ul className="mt-2 space-y-1 text-xs text-amber-900/90">
                {brief.uncertainties.map((u, i) => (
                  <li key={i} className="flex gap-1.5"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-700" /><span>{u}</span></li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-amber-900/70">The architect will explicitly flag these as assumptions to validate.</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              onClick={() => { setPhase("questions"); setRound((r) => Math.max(0, r - 1)); }}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> More questions
            </button>
            <button
              onClick={() => onComplete({ brief, blueprintPrompt: composePrompt(idea, brief, blueprintPrompt), confidence })}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium"
            >
              <Check className="h-4 w-4" /> Generate blueprint
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function composePrompt(idea: string, brief: IntakeBrief, original: string): string {
  // Re-stitch the prompt from any edits the user made in review.
  return [
    `Original idea: ${idea}`,
    `Headline: ${brief.headline}`,
    `Primary audience: ${brief.audience}`,
    `Core outcome: ${brief.coreOutcome}`,
    brief.successMetrics?.length ? `Success metrics:\n- ${brief.successMetrics.join("\n- ")}` : "",
    brief.constraints?.length ? `Constraints:\n- ${brief.constraints.join("\n- ")}` : "",
    brief.assumptions?.length ? `Assumptions:\n- ${brief.assumptions.join("\n- ")}` : "",
    brief.uncertainties?.length ? `Open uncertainties to flag explicitly:\n- ${brief.uncertainties.join("\n- ")}` : "",
    "",
    `Architect brief (refined): ${original}`,
  ].filter(Boolean).join("\n\n");
}

function ConfidenceBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = v >= 80 ? "text-emerald-700" : v >= 55 ? "text-amber-700" : "text-rose-700";
  const bar = v >= 80 ? "bg-emerald-500" : v >= 55 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-primary" /> Intent confidence</span>
        <span className={`text-sm font-semibold ${tone}`}>{v}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bar} transition-all`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1 w-full resize-none rounded-md bg-transparent text-sm font-medium text-foreground outline-none"
      />
    </div>
  );
}

function EditableList({ label, icon, items, onChange }: { label: string; icon: React.ReactNode; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span> {label}
      </div>
      <div className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
            <input
              value={it}
              onChange={(e) => {
                const next = [...items]; next[i] = e.target.value; onChange(next);
              }}
              className="flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-xs text-foreground outline-none hover:border-border focus:border-primary/50"
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="rounded p-0.5 text-muted-foreground hover:text-destructive"
              aria-label="Remove"
            ><X className="h-3 w-3" /></button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, ""])}
          className="text-[11px] text-primary hover:underline"
        >+ Add</button>
      </div>
    </div>
  );
}
