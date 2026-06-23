import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowRight, Trash2, FileText, Clock } from "lucide-react";
import {
  createBlueprint,
  listBlueprints,
  deleteBlueprint,
} from "@/lib/blueprints.functions";

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

  const { data: blueprints = [], isLoading } = useQuery({
    queryKey: ["blueprints"],
    queryFn: () => list() as Promise<BlueprintRow[]>,
  });

  const createMut = useMutation({
    mutationFn: (text: string) => create({ data: { idea: text } }) as Promise<{ id: string }>,
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 8) return toast.error("Describe your idea in a sentence (8+ chars).");
    createMut.mutate(idea.trim());
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Generator */}
      <section className="glass-strong gradient-border p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Product Architect
        </div>
        <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
          What are you building?
        </h1>
        <p className="mt-2 text-muted-foreground">
          One sentence. The Architect will design a 12-phase plan with 100+ copy-ready prompts.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
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

        {createMut.isPending && (
          <div className="mt-6 overflow-hidden rounded-lg border border-border/60 bg-surface/50 p-4">
            <div className="flex items-center gap-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-muted-foreground">Designing architecture, picking a stack, sequencing 12 phases, and writing your prompt chain…</span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full shimmer w-1/2" style={{ background: "var(--gradient-primary)" }} />
            </div>
          </div>
        )}
      </section>

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
