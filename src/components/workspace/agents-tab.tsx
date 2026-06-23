import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Sparkles, Loader2, RefreshCw, ChevronRight, Printer, Download, PlayCircle } from "lucide-react";
import { runAgent, runAllAgents, AGENTS, type AgentKey } from "@/lib/agents.functions";
import { HelpTip, InfoDot } from "@/components/ui/help-tip";
import type { Blueprint } from "@/lib/ai.server";

type AgentOutput = { markdown: string; runAt: string };

const CATEGORIES = ["Vibe Coding", "Business", "Brand", "Engineering", "Growth"] as const;

export function AgentsTab({ id, bp }: { id: string; bp: Blueprint & { agents?: Record<string, AgentOutput> } }) {
  const fn = useServerFn(runAgent);
  const runAllFn = useServerFn(runAllAgents);
  const qc = useQueryClient();
  const [active, setActive] = useState<AgentKey | null>(null);
  const [filter, setFilter] = useState<"All" | (typeof CATEGORIES)[number]>("All");
  const outputs = bp.agents ?? {};

  const mut = useMutation({
    mutationFn: (agent: AgentKey) =>
      fn({ data: { id, agent } }) as Promise<{ agent: AgentKey; markdown: string; runAt: string }>,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["blueprint", id] });
      setActive(res.agent);
      toast.success(`${AGENTS.find((a) => a.key === res.agent)?.name} finished`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Agent failed"),
  });

  const runAll = useMutation({
    mutationFn: (agents: AgentKey[]) =>
      runAllFn({ data: { id, agents } }) as Promise<{ results: { agent: AgentKey; ok: boolean; error?: string }[] }>,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["blueprint", id] });
      const ok = res.results.filter((r) => r.ok).length;
      const fail = res.results.length - ok;
      toast.success(`Generated ${ok} deliverables${fail ? ` · ${fail} failed` : ""}`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Batch failed"),
  });

  const visible = useMemo(
    () => (filter === "All" ? AGENTS : AGENTS.filter((a) => a.category === filter)),
    [filter],
  );
  const activeSpec = useMemo(() => AGENTS.find((a) => a.key === active) ?? null, [active]);
  const activeOutput = active ? outputs[active] : undefined;
  const completed = AGENTS.filter((a) => outputs[a.key]).length;

  const exportAll = () => {
    const parts: string[] = [`# ${bp.title} — AI Strategy Pack\n\n_Generated ${new Date().toLocaleString()}_\n\n---\n`];
    for (const a of AGENTS) {
      const o = outputs[a.key];
      if (!o) continue;
      parts.push(`\n\n<!-- ${a.name} -->\n\n${o.markdown}\n\n---\n`);
    }
    const blob = new Blob([parts.join("")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bp.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-strategy-pack.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded markdown pack");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Specialized AI Agents · {completed}/{AGENTS.length} complete
            <InfoDot label="Each agent is a senior specialist (pricing, security, brand, etc.) tuned to read your blueprint and write a publication-quality deliverable in markdown. Outputs are saved to your project and can be re-run anytime." />
          </div>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight">
            Sixteen experts on call for your build
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each agent reads your blueprint and writes a senior-grade, document-quality deliverable. Tuned for vibe coders — every report ends with copy-paste prompts and concrete next actions.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <HelpTip label="Runs every agent that hasn't been generated yet, in parallel batches of 3. Takes 60–120 seconds. Outputs are saved so you can come back anytime.">
            <button
              onClick={() => {
                const missing = AGENTS.filter((a) => !outputs[a.key]).map((a) => a.key);
                if (!missing.length) {
                  toast.info("All agents already complete — re-run individually to refresh.");
                  return;
                }
                runAll.mutate(missing);
              }}
              disabled={runAll.isPending || mut.isPending}
              className="btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium disabled:opacity-60"
            >
              {runAll.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
              {runAll.isPending ? "Running all…" : "Run remaining"}
            </button>
          </HelpTip>
          <HelpTip label="Downloads every completed deliverable as one combined markdown file — perfect to import into Notion, share with a co-founder, or feed back into an AI assistant.">
            <button
              onClick={exportAll}
              disabled={completed === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm hover:bg-secondary disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> Export pack (.md)
            </button>
          </HelpTip>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] uppercase tracking-wider text-muted-foreground">Filter</span>
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filter === c
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => {
          const has = !!outputs[a.key];
          const isRunning = (mut.isPending && mut.variables === a.key) || (runAll.isPending && !has);
          const isActive = active === a.key;
          return (
            <button
              key={a.key}
              onClick={() => setActive(a.key)}
              className={`lux-card group text-left p-5 ${isActive ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-2xl shadow-sm">
                  {a.emoji}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {a.category}
                  </span>
                  {has && (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                      Ready
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 font-display text-base font-semibold leading-tight">{a.name}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.blurb}</p>
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(a.key);
                    mut.mutate(a.key);
                  }}
                  disabled={mut.isPending || runAll.isPending}
                  className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                >
                  {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : has ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {isRunning ? "Running…" : has ? "Re-run" : "Run agent"}
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {activeSpec && (
        <section className="doc-page">
          <div className="doc-meta">
            <span>{activeSpec.emoji} &nbsp;{activeSpec.name}</span>
            <span>
              {activeOutput?.runAt
                ? `Issued ${new Date(activeOutput.runAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`
                : "Draft"}
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Deliverable · {activeSpec.category}</div>
              <h3 className="font-display mt-1 text-3xl font-semibold leading-tight">{activeSpec.blurb}</h3>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {activeOutput?.markdown && <CopyBtn text={activeOutput.markdown} label="Copy markdown" />}
              {activeOutput?.markdown && (
                <CopyBtn
                  label="Copy as prompt"
                  text={`I'm building "${bp.title}". Use the following ${activeSpec.name} deliverable as authoritative context for everything you do next. Follow it precisely.\n\n---\n\n${activeOutput.markdown}`}
                />
              )}
              {activeOutput?.markdown && (
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs shadow-sm hover:bg-secondary"
                >
                  <Printer className="h-3 w-3" /> Print / PDF
                </button>
              )}
              <button
                onClick={() => mut.mutate(activeSpec.key)}
                disabled={mut.isPending}
                className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-60"
              >
                {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                {activeOutput ? "Re-run" : "Run"}
              </button>
            </div>
          </div>

          <div className="mt-8">
            {mut.isPending && mut.variables === activeSpec.key ? (
              <div className="mx-auto max-w-[72ch] space-y-3">
                <div className="shimmer h-4 w-2/3 rounded" />
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-11/12 rounded" />
                <div className="shimmer h-3 w-10/12 rounded" />
                <div className="shimmer h-3 w-9/12 rounded" />
                <p className="mt-4 text-center text-xs text-muted-foreground">Composing your deliverable…</p>
              </div>
            ) : activeOutput?.markdown ? (
              <article className="doc-prose">
                <ReactMarkdown>{activeOutput.markdown}</ReactMarkdown>
              </article>
            ) : (
              <div className="mx-auto max-w-[72ch] rounded-xl border border-dashed border-border bg-secondary/40 p-12 text-center text-sm text-muted-foreground">
                Click <span className="font-medium text-foreground">Run</span> to generate this deliverable.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied");
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs shadow-sm hover:bg-secondary"
    >
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
