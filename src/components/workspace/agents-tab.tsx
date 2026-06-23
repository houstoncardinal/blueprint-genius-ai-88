import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Sparkles, Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { runAgent, AGENTS, type AgentKey } from "@/lib/agents.functions";
import type { Blueprint } from "@/lib/ai.server";

type AgentOutput = { markdown: string; runAt: string };

export function AgentsTab({ id, bp }: { id: string; bp: Blueprint & { agents?: Record<string, AgentOutput> } }) {
  const fn = useServerFn(runAgent);
  const qc = useQueryClient();
  const [active, setActive] = useState<AgentKey | null>(null);
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

  const activeSpec = useMemo(() => AGENTS.find((a) => a.key === active) ?? null, [active]);
  const activeOutput = active ? outputs[active] : undefined;

  return (
    <div className="space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> Specialized AI Agents
        </div>
        <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight">
          Ten experts, one blueprint
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Each agent reads your blueprint context and writes a senior-grade deliverable. Run any agent — results are saved alongside your project.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((a) => {
          const has = !!outputs[a.key];
          const isRunning = mut.isPending && mut.variables === a.key;
          const isActive = active === a.key;
          return (
            <button
              key={a.key}
              onClick={() => setActive(a.key)}
              className={`group text-left rounded-2xl border bg-card p-5 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                isActive ? "border-primary/50 ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-2xl">{a.emoji}</div>
                {has && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    Saved
                  </span>
                )}
              </div>
              <div className="mt-3 font-semibold leading-tight">{a.name}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.blurb}</p>
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(a.key);
                    mut.mutate(a.key);
                  }}
                  disabled={mut.isPending}
                  className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                >
                  {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : has ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {isRunning ? "Running…" : has ? "Re-run" : "Run agent"}
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {activeSpec && (
        <section className="glass-strong gradient-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {activeSpec.emoji} {activeSpec.name}
              </div>
              <h3 className="font-display mt-1 text-xl font-semibold">{activeSpec.blurb}</h3>
              {activeOutput?.runAt && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Last run: {new Date(activeOutput.runAt).toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {activeOutput?.markdown && <CopyBtn text={activeOutput.markdown} />}
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

          <div className="mt-5">
            {mut.isPending && mut.variables === activeSpec.key ? (
              <div className="space-y-2">
                <div className="shimmer h-3 w-3/4 rounded" />
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-5/6 rounded" />
                <div className="shimmer h-3 w-2/3 rounded" />
                <p className="mt-3 text-xs text-muted-foreground">Thinking through your project…</p>
              </div>
            ) : activeOutput?.markdown ? (
              <div className="prose prose-sm max-w-none rounded-xl border border-border bg-card p-6 text-foreground prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-6 prose-h2:text-lg prose-h3:mt-4 prose-h3:text-base prose-table:text-xs prose-pre:bg-secondary prose-code:text-primary prose-a:text-primary">
                <ReactMarkdown>{activeOutput.markdown}</ReactMarkdown>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
                Click <span className="font-medium text-foreground">Run</span> to generate this deliverable.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
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
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
