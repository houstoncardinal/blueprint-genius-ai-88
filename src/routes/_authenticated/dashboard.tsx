import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowRight, Trash2, FileText, Clock, Wand2, Zap } from "lucide-react";
import {
  createBlueprint,
  listBlueprints,
  deleteBlueprint,
} from "@/lib/blueprints.functions";
import { IntakeWizard } from "@/components/wizard/intake-wizard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your blueprints — BuildBlueprint AI" }] }),
  component: Dashboard,
});

const EXAMPLES = [
  "I want a dating app for hikers",
  "An Uber for lawn care in suburban USA",
  "A bookkeeping CRM for solo accountants",
  "A Call of Duty style browser game",
  "An AI agency management platform",
];

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listBlueprints);
  const create = useServerFn(createBlueprint);
  const del = useServerFn(deleteBlueprint);

  type BlueprintRow = { id: string; title: string; idea: string; status: string; created_at: string };

  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<"choose" | "wizard" | "fast">("choose");

  const { data: blueprints = [], isLoading } = useQuery({
    queryKey: ["blueprints"],
    queryFn: () => list() as Promise<BlueprintRow[]>,
  });

  const createMut = useMutation({
    mutationFn: (payload: { idea: string }) => create({ data: payload }) as Promise<{ id: string }>,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["blueprints"] });
      navigate({ to: "/blueprint/$id", params: { id: res.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["blueprints"] });
    },
  });

  const submitFast = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 8) return toast.error("Describe your idea in a sentence (8+ chars).");
    createMut.mutate({ idea: idea.trim() });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Generator */}
      {mode === "wizard" ? (
        <IntakeWizard
          onCancel={() => setMode("choose")}
          onComplete={({ blueprintPrompt }) => createMut.mutate({ idea: blueprintPrompt })}
        />
      ) : mode === "fast" ? (
        <section className="lux-card p-5 sm:p-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
            <Zap className="h-3.5 w-3.5" /> Fast Mode
          </div>
          <h1 className="font-display mt-2 text-2xl font-semibold sm:text-4xl">One sentence. One blueprint.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Skip the interview — the architect will infer the rest and flag low-confidence guesses.
          </p>
          <form onSubmit={submitFast} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="text" value={idea} onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. I want a dating app for hikers"
              disabled={createMut.isPending}
              className="flex-1 rounded-lg border border-input bg-background/50 px-4 py-3 text-base outline-none ring-ring focus:ring-2"
            />
            <button
              type="submit" disabled={createMut.isPending}
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium disabled:opacity-60"
            >
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {createMut.isPending ? "Architecting…" : "Generate blueprint"}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e} onClick={() => setIdea(e)} disabled={createMut.isPending}
                className="glass px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                {e}
              </button>
            ))}
          </div>
          <div className="mt-5">
            <button onClick={() => setMode("choose")} className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to options
            </button>
          </div>
          {createMut.isPending && (
            <div className="mt-6 overflow-hidden rounded-lg border border-border/60 bg-secondary/40 p-4">
              <div className="flex items-center gap-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Designing architecture, picking a stack, sequencing 12 phases…</span>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full shimmer w-1/2" style={{ background: "var(--gradient-primary)" }} />
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="lux-card gradient-border p-5 sm:p-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Product Architect
          </div>
          <h1 className="font-display mt-3 text-2xl font-semibold sm:text-4xl">What are you building?</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Pick how deep you want to go. The wizard asks 2–3 rounds of sharp questions until your intent is unambiguous.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setMode("wizard")}
              className="group rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-left transition hover:border-primary/60 hover:shadow-lg"
            >
              <div className="flex items-center gap-2 text-primary">
                <Wand2 className="h-5 w-5" />
                <span className="font-display text-lg font-semibold">Guided Intake</span>
                <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Recommended</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                2–3 rounds of clarifying questions. Lock in audience, success metrics, and constraints before generation.
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Start interview <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </button>

            <button
              onClick={() => setMode("fast")}
              className="group rounded-2xl border-2 border-border bg-card p-5 text-left transition hover:border-foreground/40 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                <span className="font-display text-lg font-semibold">Fast Mode</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                One sentence in, full blueprint out. Architect flags low-confidence guesses for you to confirm later.
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground/70">
                Skip the interview <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>
        </section>
      )}


      {/* List */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your blueprints</h2>
          <span className="text-sm text-muted-foreground">{blueprints.length} total</span>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass h-32 p-5">
                <div className="shimmer h-4 w-2/3 rounded" />
                <div className="shimmer mt-3 h-3 w-full rounded" />
                <div className="shimmer mt-2 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : blueprints.length === 0 ? (
          <div className="glass p-10 text-center text-muted-foreground">
            <FileText className="mx-auto h-8 w-8 opacity-50" />
            <p className="mt-3">No blueprints yet. Try one of the examples above.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {blueprints.map((b) => (
              <div key={b.id} className="glass group relative p-5 transition hover:-translate-y-0.5">
                <Link
                  to="/blueprint/$id" params={{ id: b.id }}
                  className="block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold">{b.title || "Untitled"}</div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.idea}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-foreground opacity-0 transition group-hover:opacity-100">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); if (confirm("Delete this blueprint?")) delMut.mutate(b.id); }}
                  className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ready: { label: "Ready", cls: "bg-primary/20 text-primary" },
    generating: { label: "Generating", cls: "bg-accent/20 text-accent" },
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
    failed: { label: "Failed", cls: "bg-destructive/20 text-destructive" },
  };
  const m = map[status] ?? map.pending;
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${m.cls}`}>{m.label}</span>;
}
