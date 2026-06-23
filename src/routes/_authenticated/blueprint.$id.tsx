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
import { HelpTip } from "@/components/ui/help-tip";
import { X, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/_authenticated/blueprint/$id")({
  head: () => ({ meta: [{ title: "Blueprint — BuildBlueprint AI" }] }),
  component: BlueprintPage,
});

type TabKey = "overview" | "architecture" | "database" | "frontend" | "backend" | "api" | "deployment" | "tasks" | "agents" | "docs";
const TABS: { key: TabKey; label: string; Icon: typeof LayoutGrid; hint: string; description: string }[] = [
  { key: "overview",     label: "Overview",      Icon: LayoutGrid,    hint: "Your idea at a glance: stack, business model, the 12-phase build roadmap, and copy-ready prompts.",                         description: "Start here. Pick a phase, then copy the prompt straight into Lovable, Cursor, or Bolt." },
  { key: "architecture", label: "Architecture",  Icon: Network,       hint: "Interactive system diagram showing how every service, database, and client connects.",                                       description: "Drag nodes to rearrange. Edit any component's name or description below — your changes save to the blueprint." },
  { key: "database",     label: "Database",      Icon: Database,      hint: "ERD with every table, column, primary key, and foreign key relationship.",                                                   description: "This is your schema. Use the SQL Migration Writer agent to turn it into production-ready migrations with RLS policies." },
  { key: "frontend",     label: "Frontend",      Icon: Layout,        hint: "Every page, the components on it, design notes, and a suggested folder structure.",                                          description: "Run the Component Chef agent for paste-ready shadcn/ui recipes for your most important screens." },
  { key: "backend",      label: "Backend",       Icon: Server,        hint: "Server-side services, background jobs, and what each one is responsible for.",                                               description: "Edit any service responsibility — your changes save automatically." },
  { key: "api",          label: "API",           Icon: Code2,         hint: "All endpoints with method, path, auth requirements, request body, and response shape.",                                     description: "Hand this to your AI assistant when scaffolding backend routes — it has everything needed." },
  { key: "deployment",   label: "Deployment",    Icon: Cloud,         hint: "Hosting choice, CI/CD pipeline, environments, and infrastructure notes.",                                                   description: "A senior-engineer deployment plan you can hand to a junior dev or a CI config." },
  { key: "tasks",        label: "Tasks",         Icon: KanbanSquare,  hint: "Kanban board with the 12 starter tasks. Drag between To-do, Doing, Done.",                                                  description: "Track build progress here. Each task is tied to a phase and has an hour estimate." },
  { key: "agents",       label: "AI Agents",     Icon: Bot,           hint: "16 specialist agents that turn your blueprint into PDF-quality strategy documents.",                                        description: "Click any agent to see its output, or hit \"Run remaining\" to generate them all at once." },
  { key: "docs",         label: "Documentation", Icon: BookOpen,      hint: "Auto-generated README in markdown — overview, setup, architecture, deployment.",                                            description: "Copy this into your repo's README.md to give collaborators (or your future self) instant context." },
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
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <OnboardingBanner />

      <div className="mt-6 sticky top-2 z-20">
        <div className="glass-strong flex flex-wrap gap-1 p-1">
          {TABS.map(({ key, label, Icon, hint }) => (
            <HelpTip key={key} label={hint} side="bottom">
              <button
                onClick={() => setTab(key)}
                aria-label={`${label} — ${hint}`}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  tab === key ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            </HelpTip>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          <span className="font-medium text-foreground">{activeTab.label}:</span> {activeTab.description}
        </p>
      </div>

      <div className="mt-6">
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

function OnboardingBanner() {
  const KEY = "bb_onboarding_dismissed_v1";
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(KEY) === "1";
  });
  if (hidden) return null;
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <Lightbulb className="h-4 w-4" />
      </div>
      <div className="flex-1 text-sm">
        <div className="font-medium text-foreground">New here? Here's how to use this blueprint.</div>
        <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li><span className="font-medium text-foreground">1.</span> Skim the <b>Overview</b> tab to confirm the stack and roadmap match your vision.</li>
          <li><span className="font-medium text-foreground">2.</span> Open <b>AI Agents</b> and click <b>Run remaining</b> — 16 specialists will write your strategy, copy, pricing, security audit, and paste-ready prompts.</li>
          <li><span className="font-medium text-foreground">3.</span> In each phase, copy the prompt into Lovable / Cursor / Bolt and ship.</li>
          <li><span className="font-medium text-foreground">4.</span> Hover any tab or button — every control has a tooltip explaining what it does.</li>
        </ol>
      </div>
      <button
        onClick={() => { window.localStorage.setItem(KEY, "1"); setHidden(true); }}
        aria-label="Dismiss"
        className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
