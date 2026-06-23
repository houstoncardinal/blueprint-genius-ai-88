import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, LayoutGrid, Network, Database, Layout, Server, Code2, Cloud, KanbanSquare, BookOpen, RefreshCw, Bot } from "lucide-react";
import { getBlueprint, runBlueprintGeneration } from "@/lib/blueprints.functions";
import type { Blueprint } from "@/lib/ai.server";
import {
  OverviewTab, ArchitectureTab, DatabaseTab, FrontendTab, BackendTab,
  ApiTab, DeploymentTab, TasksTab, DocumentationTab,
} from "@/components/workspace/tabs";
import { AgentsTab } from "@/components/workspace/agents-tab";

export const Route = createFileRoute("/_authenticated/blueprint/$id")({
  head: () => ({ meta: [{ title: "Blueprint — BuildBlueprint AI" }] }),
  component: BlueprintPage,
});

type TabKey = "overview" | "architecture" | "database" | "frontend" | "backend" | "api" | "deployment" | "tasks" | "agents" | "docs";
const TABS: { key: TabKey; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "overview",     label: "Overview",      Icon: LayoutGrid },
  { key: "architecture", label: "Architecture",  Icon: Network },
  { key: "database",     label: "Database",      Icon: Database },
  { key: "frontend",     label: "Frontend",      Icon: Layout },
  { key: "backend",      label: "Backend",       Icon: Server },
  { key: "api",          label: "API",           Icon: Code2 },
  { key: "deployment",   label: "Deployment",    Icon: Cloud },
  { key: "tasks",        label: "Tasks",         Icon: KanbanSquare },
  { key: "agents",       label: "AI Agents",     Icon: Bot },
  { key: "docs",         label: "Documentation", Icon: BookOpen },
];

function BlueprintPage() {
  const { id } = Route.useParams();
  const fetchFn = useServerFn(getBlueprint);
  const runGen = useServerFn(runBlueprintGeneration);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["blueprint", id],
    queryFn: () => fetchFn({ data: { id } }),
    refetchInterval: (q) => {
      const s = (q.state.data as { status?: string } | undefined)?.status;
      return s === "generating" ? 3000 : false;
    },
  });
  const [tab, setTab] = useState<TabKey>("overview");

  const genMut = useMutation({
    mutationFn: () => runGen({ data: { id } }) as Promise<{ status: string }>,
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  // Auto-trigger generation once when row is in 'generating' state and no analysis yet.
  const triggered = useRef(false);
  useEffect(() => {
    if (!data) return;
    if (triggered.current) return;
    if (data.status === "generating" && !data.analysis) {
      triggered.current = true;
      genMut.mutate();
    }
  }, [data, genMut]);

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
    const failed = data.status === "failed";
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="glass-strong p-8 text-center">
          {failed ? (
            <>
              <h2 className="font-display text-xl font-semibold">Generation failed</h2>
              <p className="mt-2 text-sm text-muted-foreground">{data.error ?? "Unknown error"}</p>
              <button
                onClick={() => { triggered.current = true; genMut.mutate(); }}
                disabled={genMut.isPending}
                className="btn-primary mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                {genMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Retry generation
              </button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 font-medium">Architecting your blueprint…</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Designing architecture, schema, API, and 12-phase prompt chain. This usually takes 30–90 seconds.
              </p>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full shimmer w-1/2" style={{ background: "var(--gradient-primary)" }} />
              </div>
            </>
          )}
          <div className="mt-6">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }


  const bp = data.analysis as unknown as Blueprint;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mt-6 sticky top-2 z-20">
        <div className="glass-strong flex flex-wrap gap-1 p-1">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                tab === key ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {tab === "overview"     && <OverviewTab     bp={bp} idea={data.idea} />}
        {tab === "architecture" && <ArchitectureTab id={id} bp={bp} />}
        {tab === "database"     && <DatabaseTab     id={id} bp={bp} />}
        {tab === "frontend"     && <FrontendTab     id={id} bp={bp} />}
        {tab === "backend"      && <BackendTab      id={id} bp={bp} />}
        {tab === "api"          && <ApiTab          id={id} bp={bp} />}
        {tab === "deployment"   && <DeploymentTab   id={id} bp={bp} />}
        {tab === "tasks"        && <TasksTab        id={id} bp={bp} />}
        {tab === "agents"       && <AgentsTab       id={id} bp={bp} />}
        {tab === "docs"         && <DocumentationTab id={id} bp={bp} />}
      </div>
    </main>
  );
}
