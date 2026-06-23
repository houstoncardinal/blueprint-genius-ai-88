import { useState } from "react";
import { Copy, Check, FileText, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { Blueprint } from "@/lib/ai.server";
import { ArchitectureFlow, DatabaseFlow } from "./flows";
import { IntentCanvas, RoadmapTimeline } from "./intent-canvas";
import { useBlueprintSave, useDraft } from "@/lib/use-blueprint-save";

type TabProps = { id: string; bp: Blueprint };

/* -------------------- OVERVIEW -------------------- */
export function OverviewTab({ bp, idea }: { bp: Blueprint; idea: string }) {
  const [activePhase, setActivePhase] = useState(bp.phases[0]?.number ?? 1);
  const phase = bp.phases.find((p) => p.number === activePhase) ?? bp.phases[0];
  type PK = "primary" | "advanced";
  const [pTab, setPTab] = useState<PK>("primary");
  const PROMPT_TABS: { k: PK; l: string }[] = [
    { k: "primary", l: "Primary" },
    { k: "advanced", l: "Advanced" },
  ];

  return (
    <div className="space-y-12">
      <header>
        <div className="glass mb-3 inline-flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
          Idea: {idea}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">{bp.title}</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{bp.tagline}</p>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{bp.summary}</p>
      </header>

      <IntentCanvas bp={bp} />

      <RoadmapTimeline bp={bp} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-strong gradient-border p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">
            Recommended stack · {bp.techStack?.name}
          </h2>
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
            ] as const).map(([k, v]) =>
              v ? (
                <div key={k} className="flex gap-2">
                  <dt className="w-32 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="flex-1">{String(v)}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">12-phase roadmap</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bp.phases.map((p) => {
            const active = p.number === activePhase;
            return (
              <button
                key={p.number}
                onClick={() => setActivePhase(p.number)}
                className={`text-left transition ${active ? "" : "hover:-translate-y-0.5"}`}
              >
                <div className={`${active ? "gradient-border glass-strong" : "glass"} p-5`}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Phase {p.number} · {p.estimatedHours}h
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold">{p.name}</div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.title}</p>
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full" style={{ width: `${(p.complexity / 10) * 100}%`, background: "var(--gradient-primary)" }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {phase && (
        <section className="glass-strong gradient-border p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Phase {phase.number}</div>
          <h3 className="font-display text-2xl font-semibold">{phase.name} — {phase.title}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card title="Goal" body={phase.goal} />
            <Card title="Expected outcome" body={phase.outcome} />
          </div>
          <div className="mt-6 flex flex-wrap gap-1 border-b border-border/60">
            {PROMPT_TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => setPTab(t.k)}
                className={`relative px-4 py-2 text-sm font-medium transition ${pTab === t.k ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.l}
                {pTab === t.k && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: "var(--gradient-primary)" }} />}
              </button>
            ))}
          </div>
          <PromptCard prompt={phase.prompts?.[pTab]} />
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl font-semibold">Sequential prompt chain</h2>
        <div className="mt-6 space-y-3">
          {bp.promptChain?.map((p) => <ChainStep key={p.step} step={p} />)}
        </div>
      </section>
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
  if (!prompt) return null;
  return (
    <div className="mt-5 rounded-xl border border-border/60 bg-background/60">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-medium">{prompt.title}</span>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(prompt.body);
            setCopied(true);
            toast.success("Copied");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="glass inline-flex items-center gap-1.5 px-3 py-1 text-xs"
        >
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
  return (
    <div className="glass overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); } }}
        className="flex w-full cursor-pointer items-center gap-3 p-4 text-left"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface font-mono text-sm">{step.step}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              Phase {step.phase}
            </span>
            <span className="truncate text-sm font-medium">{step.title}</span>
          </div>
          <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{step.expectedOutcome}</div>
        </div>
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await navigator.clipboard.writeText(step.prompt);
            setCopied(true);
            toast.success(`Copied step ${step.step}`);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="glass inline-flex items-center gap-1.5 px-3 py-1 text-xs"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </button>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-90" : ""}`} />
      </div>
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

/* -------------------- shared editor pieces -------------------- */
function SaveBar({ dirty, saving, onSave, onReset }: { dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className="sticky top-0 z-10 -mx-2 mb-4 flex items-center justify-end gap-2 bg-background/70 px-2 py-2 backdrop-blur">
      {dirty && (
        <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground">
          Discard
        </button>
      )}
      <button
        disabled={!dirty || saving}
        onClick={onSave}
        className="btn-primary inline-flex items-center gap-2 px-3 py-1.5 text-xs disabled:opacity-40"
      >
        {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
      </button>
    </div>
  );
}

function TextField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full resize-y rounded-md border border-border/60 bg-background/60 p-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

/* -------------------- ARCHITECTURE -------------------- */
export function ArchitectureTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.architecture);
  if (!draft) return <Empty label="No architecture data" />;
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ architecture: draft })} />
      <p className="mb-3 text-sm text-muted-foreground">
        Live system diagram. Drag nodes to rearrange. Edit the summary below.
      </p>
      <ArchitectureFlow architecture={draft} />
      <div className="mt-6">
        <TextField label="Architecture summary" rows={4} value={draft.summary} onChange={(v) => setDraft({ ...draft, summary: v })} />
      </div>
      <div className="mt-6">
        <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Components</h4>
        <div className="grid gap-2 md:grid-cols-2">
          {draft.nodes?.map((n, i) => (
            <div key={n.id} className="rounded-lg border border-border/60 bg-surface/40 p-3 text-sm">
              <div className="flex items-center justify-between">
                <input
                  className="bg-transparent font-semibold outline-none"
                  value={n.label}
                  onChange={(e) => {
                    const next = [...draft.nodes];
                    next[i] = { ...n, label: e.target.value };
                    setDraft({ ...draft, nodes: next });
                  }}
                />
                <span className="rounded bg-surface px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{n.kind}</span>
              </div>
              <textarea
                rows={2}
                className="mt-1 w-full resize-none bg-transparent text-xs text-muted-foreground outline-none"
                value={n.description}
                onChange={(e) => {
                  const next = [...draft.nodes];
                  next[i] = { ...n, description: e.target.value };
                  setDraft({ ...draft, nodes: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------- DATABASE -------------------- */
export function DatabaseTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.database);
  if (!draft) return <Empty label="No database data" />;
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ database: draft })} />
      <p className="mb-3 text-sm text-muted-foreground">ERD generated from the blueprint. Tables and columns are editable below.</p>
      <DatabaseFlow database={draft} />
      <TextField label="Database summary" rows={3} value={draft.summary} onChange={(v) => setDraft({ ...draft, summary: v })} />
      <div className="mt-6 space-y-4">
        {draft.tables?.map((t, ti) => (
          <div key={t.name} className="glass p-4">
            <input
              className="bg-transparent font-mono text-sm font-semibold text-emerald-700 outline-none"
              value={t.name}
              onChange={(e) => {
                const next = [...draft.tables];
                next[ti] = { ...t, name: e.target.value };
                setDraft({ ...draft, tables: next });
              }}
            />
            <textarea
              rows={1}
              className="mt-1 w-full resize-none bg-transparent text-xs text-muted-foreground outline-none"
              value={t.description}
              onChange={(e) => {
                const next = [...draft.tables];
                next[ti] = { ...t, description: e.target.value };
                setDraft({ ...draft, tables: next });
              }}
            />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1 text-left">Column</th>
                    <th className="text-left">Type</th>
                    <th className="text-left">PK</th>
                    <th className="text-left">FK</th>
                    <th className="text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {t.columns?.map((c, ci) => (
                    <tr key={ci} className="border-t border-border/40">
                      <td className="py-1 font-mono">{c.name}</td>
                      <td className="font-mono text-muted-foreground">{c.type}</td>
                      <td>{c.pk ? "🔑" : ""}</td>
                      <td className="font-mono text-[11px] text-muted-foreground">{c.fk ?? ""}</td>
                      <td className="text-muted-foreground">{c.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- FRONTEND -------------------- */
export function FrontendTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.frontend);
  if (!draft) return <Empty label="No frontend data" />;
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ frontend: draft })} />
      <TextField label="Summary" rows={3} value={draft.summary} onChange={(v) => setDraft({ ...draft, summary: v })} />
      <TextField label="Design notes" rows={4} value={draft.designNotes} onChange={(v) => setDraft({ ...draft, designNotes: v })} />
      <h4 className="mb-2 mt-6 text-xs uppercase tracking-wider text-muted-foreground">Pages</h4>
      <div className="grid gap-2 md:grid-cols-2">
        {draft.pages?.map((p, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-surface/40 p-3 text-sm">
            <div className="font-mono text-primary">{p.path}</div>
            <div className="mt-1 text-muted-foreground">{p.purpose}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.components?.map((c) => (
                <span key={c} className="rounded bg-surface px-2 py-0.5 text-[10px]">{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <FolderTree value={bp.folderStructure ?? ""} />
    </div>
  );
}

function FolderTree({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="mt-8">
      <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Suggested folder structure</h4>
      <pre className="overflow-auto rounded-lg border border-border/60 bg-background/60 p-4 font-mono text-xs">
        {value}
      </pre>
    </div>
  );
}

/* -------------------- BACKEND -------------------- */
export function BackendTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.backend);
  if (!draft) return <Empty label="No backend data" />;
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ backend: draft })} />
      <TextField label="Summary" rows={3} value={draft.summary} onChange={(v) => setDraft({ ...draft, summary: v })} />
      <h4 className="mb-2 mt-6 text-xs uppercase tracking-wider text-muted-foreground">Services</h4>
      <div className="grid gap-2 md:grid-cols-2">
        {draft.services?.map((s, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-surface/40 p-3 text-sm">
            <div className="font-semibold">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.responsibility}</div>
          </div>
        ))}
      </div>
      <h4 className="mb-2 mt-6 text-xs uppercase tracking-wider text-muted-foreground">Background jobs</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {draft.jobs?.map((j, i) => <li key={i}>{j}</li>)}
      </ul>
    </div>
  );
}

/* -------------------- API -------------------- */
export function ApiTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.api);
  if (!draft) return <Empty label="No API data" />;
  const METHOD_COLOR: Record<string, string> = {
    GET: "text-emerald-700", POST: "text-sky-700", PATCH: "text-amber-700",
    PUT: "text-amber-700", DELETE: "text-rose-700",
  };
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ api: draft })} />
      <TextField label="API summary" rows={3} value={draft.summary} onChange={(v) => setDraft({ ...draft, summary: v })} />
      <div className="mt-6 space-y-2">
        {draft.endpoints?.map((e, i) => (
          <div key={i} className="glass p-3 text-sm">
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xs font-bold ${METHOD_COLOR[e.method] ?? "text-muted-foreground"}`}>{e.method}</span>
              <span className="font-mono text-xs">{e.path}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{e.auth}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{e.purpose}</div>
            {(e.requestBody || e.response) && (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {e.requestBody && <pre className="overflow-auto rounded bg-background/60 p-2 font-mono text-[11px]">{`req: ${e.requestBody}`}</pre>}
                {e.response && <pre className="overflow-auto rounded bg-background/60 p-2 font-mono text-[11px]">{`res: ${e.response}`}</pre>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- DEPLOYMENT -------------------- */
export function DeploymentTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.deployment);
  if (!draft) return <Empty label="No deployment data" />;
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ deployment: draft })} />
      <TextField label="Summary" rows={3} value={draft.summary} onChange={(v) => setDraft({ ...draft, summary: v })} />
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Hosting" rows={2} value={draft.hosting} onChange={(v) => setDraft({ ...draft, hosting: v })} />
        <TextField label="CI/CD" rows={2} value={draft.cicd} onChange={(v) => setDraft({ ...draft, cicd: v })} />
      </div>
      <TextField label="Infra notes" rows={4} value={draft.infraNotes} onChange={(v) => setDraft({ ...draft, infraNotes: v })} />
      <div className="mt-4">
        <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Environments</h4>
        <div className="flex flex-wrap gap-2">
          {draft.environments?.map((e, i) => (
            <span key={i} className="glass px-3 py-1 text-xs">{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------- TASKS (Kanban) -------------------- */
export function TasksTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.tasks ?? []);
  const lanes: { key: "todo" | "doing" | "done"; label: string }[] = [
    { key: "todo", label: "To do" }, { key: "doing", label: "In progress" }, { key: "done", label: "Done" },
  ];
  const move = (taskId: string, lane: "todo" | "doing" | "done") => {
    setDraft(draft.map((t) => (t.id === taskId ? { ...t, lane } : t)));
  };
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ tasks: draft })} />
      {bp.milestones?.length ? (
        <div className="mb-6">
          <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Milestones</h4>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {bp.milestones.map((m, i) => (
              <div key={i} className="glass p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.weeks}w</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{m.outcome}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        {lanes.map((l) => (
          <div key={l.key} className="rounded-xl border border-border/60 bg-surface/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">{l.label}</div>
              <span className="text-xs text-muted-foreground">{draft.filter((t) => t.lane === l.key).length}</span>
            </div>
            <div className="space-y-2">
              {draft.filter((t) => t.lane === l.key).map((t) => (
                <div key={t.id} className="glass p-3 text-sm">
                  <div className="font-medium leading-snug">{t.title}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Phase {t.phase} · {t.estimateHours}h</span>
                    <div className="flex gap-1">
                      {lanes.filter((x) => x.key !== l.key).map((x) => (
                        <button key={x.key} onClick={() => move(t.id, x.key)} className="rounded bg-surface px-1.5 py-0.5 hover:text-foreground">
                          → {x.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- DOCUMENTATION -------------------- */
export function DocumentationTab({ id, bp }: TabProps) {
  const { save, saving } = useBlueprintSave(id);
  const [draft, setDraft, dirty, reset] = useDraft(bp.documentation ?? "");
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  return (
    <div>
      <SaveBar dirty={dirty} saving={saving} onReset={reset} onSave={() => save({ documentation: draft })} />
      <div className="mb-3 inline-flex rounded-lg border border-border/60 p-0.5 text-xs">
        {(["preview", "edit"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1 ${mode === m ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
          >
            {m === "preview" ? "Preview" : "Edit"}
          </button>
        ))}
      </div>
      <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">User stories</h4>
      <div className="mb-6 grid gap-2 md:grid-cols-2">
        {bp.userStories?.map((s, i) => (
          <div key={i} className="glass p-3 text-sm">
            <div className="text-xs text-primary">{s.role}</div>
            <div className="mt-1">{s.story}</div>
            {s.acceptance?.length ? (
              <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                {s.acceptance.map((a, j) => <li key={j}>{a}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
      {mode === "edit" ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={24}
          className="w-full resize-y rounded-lg border border-border/60 bg-background/60 p-4 font-mono text-sm outline-none focus:border-primary"
        />
      ) : (
        <section className="doc-page">
          <div className="doc-meta">
            <span>Project Documentation</span>
            <span>{bp.title}</span>
          </div>
          <article className="doc-prose">
            <ReactMarkdown>{draft || "_No documentation yet._"}</ReactMarkdown>
          </article>
        </section>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-lg border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">{label}</div>;
}
