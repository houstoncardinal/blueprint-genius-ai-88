import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Copy, Check, Sparkles, Layers, Database, ShieldCheck, Cpu, CreditCard,
  Settings2, TestTube, Rocket, TrendingUp, Zap, Workflow, ChevronRight, Loader2, FileText,
} from "lucide-react";
import { getBlueprint } from "@/lib/blueprints.functions";
import type { Blueprint } from "@/lib/ai.server";

export const Route = createFileRoute("/_authenticated/blueprint/$id")({
  head: () => ({ meta: [{ title: "Blueprint — BuildBlueprint AI" }] }),
  component: BlueprintPage,
});

const PHASE_ICONS = [Sparkles, Layers, Database, ShieldCheck, Workflow, Cpu, CreditCard, Settings2, TestTube, Rocket, TrendingUp, Zap];

type PromptKey = "primary" | "advanced" | "expert" | "optimization" | "bugfix" | "scaling";
const PROMPT_TABS: { key: PromptKey; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "advanced", label: "Advanced" },
  { key: "expert", label: "Expert" },
  { key: "optimization", label: "Optimization" },
  { key: "bugfix", label: "Bug Fix" },
  { key: "scaling", label: "Scaling" },
];

function BlueprintPage() {
  const { id } = Route.useParams();
  const fetchFn = useServerFn(getBlueprint);
  const { data, isLoading, error } = useQuery({
    queryKey: ["blueprint", id],
    queryFn: () => fetchFn({ data: { id } }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (error || !data) {
    return <div className="mx-auto max-w-2xl px-6 py-20 text-center text-muted-foreground">Blueprint not found.</div>;
  }

  if (data.status !== "ready" || !data.analysis) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="glass-strong p-8 text-center">
          {data.status === "failed" ? (
            <>
              <h2 className="font-display text-xl font-semibold">Generation failed</h2>
              <p className="mt-2 text-sm text-muted-foreground">{data.error ?? "Unknown error"}</p>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-muted-foreground">Generating your blueprint…</p>
            </>
          )}
          <Link to="/dashboard" className="btn-primary mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const bp = data.analysis as unknown as Blueprint;
  return <BlueprintView bp={bp} idea={data.idea} />;
}

function BlueprintView({ bp, idea }: { bp: Blueprint; idea: string }) {
  const [activePhase, setActivePhase] = useState(bp.phases[0]?.number ?? 1);
  const phase = useMemo(() => bp.phases.find((p) => p.number === activePhase) ?? bp.phases[0], [activePhase, bp.phases]);
  const [tab, setTab] = useState<PromptKey>("primary");

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <header className="mt-6">
        <div className="glass mb-3 inline-flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> Idea: {idea}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {bp.title}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{bp.tagline}</p>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{bp.summary}</p>
      </header>

      {/* Tech stack */}
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="glass-strong gradient-border p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Recommended stack · {bp.techStack?.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{bp.techStack?.rationale}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {bp.techStack?.items?.map((it) => (
              <div key={it.name} className="flex items-start gap-2 rounded-md border border-border/50 bg-surface/40 p-3">
                <div className="mt-0.5 h-2 w-2 rounded-full" style={{ background: "var(--gradient-primary)" }} />
                <div>
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.purpose}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-strong p-6">
          <h3 className="font-display text-lg font-semibold">Quick analysis</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {([
              ["Business model", bp.analysis?.businessModel],
              ["Monetization", bp.analysis?.monetization],
              ["Auth", bp.analysis?.authentication],
              ["Payments", bp.analysis?.payments],
            ] as const).map(([k, v]) => v ? (
              <div key={k} className="flex gap-2">
                <dt className="w-32 shrink-0 text-muted-foreground">{k}</dt>
                <dd className="flex-1">{String(v)}</dd>
              </div>
            ) : null)}
          </dl>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">12-phase roadmap</h2>
        <p className="mt-1 text-sm text-muted-foreground">Click a phase to see goals, complexity, dependencies, and 6 copy-ready prompts.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bp.phases.map((p) => {
            const Icon = PHASE_ICONS[(p.number - 1) % PHASE_ICONS.length];
            const active = p.number === activePhase;
            return (
              <button
                key={p.number} onClick={() => setActivePhase(p.number)}
                className={`group relative text-left transition ${active ? "" : "hover:-translate-y-0.5"}`}
              >
                <div className={`${active ? "gradient-border glass-strong" : "glass"} p-5`}>
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface">
                      <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phase {p.number} · {p.estimatedHours}h</div>
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{p.title}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Complexity</span>
                    <span className="font-mono">{p.complexity}/10</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full" style={{ width: `${(p.complexity / 10) * 100}%`, background: "var(--gradient-primary)" }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Phase detail */}
      {phase && (
        <section className="mt-10">
          <div className="glass-strong gradient-border p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Phase {phase.number}</div>
                <h3 className="font-display text-2xl font-semibold">{phase.name} — {phase.title}</h3>
              </div>
              <div className="flex gap-4 text-sm">
                <Stat label="Complexity" value={`${phase.complexity}/10`} />
                <Stat label="Est. time" value={`${phase.estimatedHours}h`} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Card title="Goal" body={phase.goal} />
              <Card title="Expected outcome" body={phase.outcome} />
            </div>

            {phase.dependencies?.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Depends on:</span>{" "}
                {phase.dependencies.join(" · ")}
              </div>
            )}

            {/* Prompt tabs */}
            <div className="mt-6 flex flex-wrap gap-1 border-b border-border/60">
              {PROMPT_TABS.map((t) => (
                <button
                  key={t.key} onClick={() => setTab(t.key)}
                  className={`relative px-4 py-2 text-sm font-medium transition ${tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t.label}
                  {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: "var(--gradient-primary)" }} />}
                </button>
              ))}
            </div>

            <PromptCard prompt={phase.prompts?.[tab]} />
          </div>
        </section>
      )}

      {/* Prompt chain */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold">Sequential prompt chain</h2>
          <span className="text-sm text-muted-foreground">{bp.promptChain?.length ?? 0} steps</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Run these in order in any AI coding tool. Each step assumes the previous ones are done.</p>

        <div className="mt-6 space-y-3">
          {bp.promptChain?.map((p) => (
            <ChainStep key={p.step} step={p} />
          ))}
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Back to dashboard</Link>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-semibold">{value}</div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/40 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <p className="mt-1 text-sm">{body}</p>
    </div>
  );
}

function PromptCard({ prompt }: { prompt?: { title: string; body: string } }) {
  const [copied, setCopied] = useState(false);
  if (!prompt) return <div className="mt-4 text-sm text-muted-foreground">No prompt available.</div>;
  const copy = async () => {
    await navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="mt-5 rounded-xl border border-border/60 bg-background/60">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-medium">{prompt.title}</span>
        </div>
        <button onClick={copy} className="glass inline-flex items-center gap-1.5 px-3 py-1 text-xs">
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-[13px] leading-relaxed text-foreground/90">
        {prompt.body}
      </pre>
    </div>
  );
}

function ChainStep({ step }: { step: Blueprint["promptChain"][number] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(step.prompt);
    setCopied(true);
    toast.success(`Copied step ${step.step}`);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="glass overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-4 text-left">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface font-mono text-sm">
          {step.step}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">Phase {step.phase}</span>
            <span className="truncate text-sm font-medium">{step.title}</span>
          </div>
          <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{step.expectedOutcome}</div>
        </div>
        <button onClick={copy} className="glass inline-flex items-center gap-1.5 px-3 py-1 text-xs">
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </button>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border/60 bg-background/60 px-4 py-4">
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground/90">
            {step.prompt}
          </pre>
        </div>
      )}
    </div>
  );
}
