import type { Blueprint, ActionTrack } from "@/lib/ai.server";
import { Target, Users, Compass, ShieldAlert, HelpCircle, CheckCircle2, XCircle, Sparkle, Gauge, AlertTriangle } from "lucide-react";

const TRACK_COLORS: Record<ActionTrack["color"], { bar: string; chip: string; ring: string }> = {
  indigo:  { bar: "bg-indigo-500/85",  chip: "bg-indigo-50 text-indigo-700 border-indigo-200",   ring: "ring-indigo-200" },
  emerald: { bar: "bg-emerald-500/85", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "ring-emerald-200" },
  amber:   { bar: "bg-amber-500/85",   chip: "bg-amber-50 text-amber-700 border-amber-200",     ring: "ring-amber-200" },
  rose:    { bar: "bg-rose-500/85",    chip: "bg-rose-50 text-rose-700 border-rose-200",        ring: "ring-rose-200" },
  sky:     { bar: "bg-sky-500/85",     chip: "bg-sky-50 text-sky-700 border-sky-200",           ring: "ring-sky-200" },
  violet:  { bar: "bg-violet-500/85",  chip: "bg-violet-50 text-violet-700 border-violet-200",  ring: "ring-violet-200" },
  slate:   { bar: "bg-slate-500/85",   chip: "bg-slate-50 text-slate-700 border-slate-200",     ring: "ring-slate-200" },
};

export function IntentCanvas({ bp }: { bp: Blueprint }) {
  const intent = bp.intent;
  if (!intent) return null;
  return (
    <section className="space-y-6">
      <ConfidencePanel intent={intent} />

      {/* Vision hero */}
      <div className="lux-card relative overflow-hidden p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
              <Compass className="h-3 w-3" /> Founder Intent
            </div>
            <p className="font-display mt-4 text-3xl leading-tight tracking-tight text-foreground">
              {intent.vision}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-card/70 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-primary" /> North-Star Metric
            </div>
            <div className="font-display mt-2 text-xl font-semibold">{intent.northStar.metric}</div>
            <div className="mt-1 text-2xl font-bold text-primary">{intent.northStar.target}</div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{intent.northStar.rationale}</p>
          </div>
        </div>
      </div>

      {/* Success metrics chips */}
      {intent.successMetrics?.length > 0 && (
        <div>
          <SectionTitle icon={<Sparkle className="h-3.5 w-3.5" />} label="Success metrics" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {intent.successMetrics.map((m) => (
              <div key={m.name} className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.name}</div>
                <div className="font-display mt-1 text-xl font-semibold text-primary">{m.target}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">by {m.timeframe}</div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audiences + JTBD */}
      <div className="grid gap-6 lg:grid-cols-2">
        {intent.primaryAudiences?.length > 0 && (
          <div>
            <SectionTitle icon={<Users className="h-3.5 w-3.5" />} label="Primary audiences" />
            <div className="mt-3 space-y-2">
              {intent.primaryAudiences.map((a) => (
                <div key={a.name} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="font-display text-sm font-semibold">{a.name}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                  <p className="mt-2 rounded-md bg-secondary/60 px-2.5 py-1.5 text-[11px] text-foreground/80">
                    <span className="font-medium text-rose-700">Pain:</span> {a.pain}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {intent.jobsToBeDone?.length > 0 && (
          <div>
            <SectionTitle icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Jobs-to-be-done" />
            <div className="mt-3 space-y-2">
              {intent.jobsToBeDone.map((j, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="text-[10px] uppercase tracking-wider text-primary">{j.audience}</div>
                  <p className="mt-1 text-sm">
                    When <span className="text-muted-foreground">{j.trigger}</span>, I want to{" "}
                    <span className="font-medium">{j.job}</span>, so that{" "}
                    <span className="text-muted-foreground">{j.outcome}</span>.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Constraints / Non-goals / Assumptions / Questions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ListCard
          title="Constraints"
          icon={<ShieldAlert className="h-3.5 w-3.5" />}
          items={intent.constraints?.map((c) => `${cap(c.kind)} · ${c.detail}`) ?? []}
          tone="amber"
        />
        <ListCard
          title="Non-goals"
          icon={<XCircle className="h-3.5 w-3.5" />}
          items={intent.nonGoals ?? []}
          tone="rose"
        />
        <ListCard
          title="Assumptions"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          items={intent.assumptions ?? []}
          tone="emerald"
        />
        <ListCard
          title="Open questions"
          icon={<HelpCircle className="h-3.5 w-3.5" />}
          items={intent.openQuestions ?? []}
          tone="sky"
        />
      </div>
    </section>
  );
}

export function RoadmapTimeline({ bp }: { bp: Blueprint }) {
  const plan = bp.actionPlan;
  if (!plan || !plan.tracks?.length) return null;
  const totalWeeks = Math.max(plan.totalWeeks ?? 12, ...plan.tracks.flatMap((t) => t.items.map((i) => i.endWeek)));
  const critical = new Set(plan.criticalPath ?? []);
  const weekCols = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <SectionTitle icon={<Compass className="h-3.5 w-3.5" />} label="Execution plan" />
          <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight">
            Parallel workstreams across {totalWeeks} weeks
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Every track of work, sequenced. Bars show duration; ringed bars are on the critical path.
          </p>
        </div>
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          {plan.tracks.map((t) => (
            <span key={t.name} className={`rounded-full border px-2.5 py-0.5 text-[11px] ${TRACK_COLORS[t.color].chip}`}>
              {t.name}
            </span>
          ))}
        </div>
      </div>

      <div className="lux-card mt-5 overflow-x-auto p-5">
        <div className="min-w-[760px]">
          {/* Week header */}
          <div className="grid items-center gap-2" style={{ gridTemplateColumns: `160px repeat(${totalWeeks}, minmax(36px, 1fr))` }}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Track</div>
            {weekCols.map((w) => (
              <div key={w} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                W{w}
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-5">
            {plan.tracks.map((track) => (
              <div key={track.name}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${TRACK_COLORS[track.color].bar}`} />
                  <span className="text-xs font-semibold">{track.name}</span>
                </div>
                {track.items.map((item) => {
                  const span = Math.max(1, item.endWeek - item.startWeek + 1);
                  const tone = TRACK_COLORS[track.color];
                  const isCrit = critical.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="grid items-center gap-2 py-1"
                      style={{ gridTemplateColumns: `160px repeat(${totalWeeks}, minmax(36px, 1fr))` }}
                    >
                      <div className="truncate pr-2 text-[11px] text-muted-foreground" title={item.deliverable}>
                        {item.title}
                      </div>
                      {weekCols.map((w) => {
                        if (w > item.startWeek && w <= item.endWeek) return null; // covered by span
                        if (w < item.startWeek || w > item.endWeek) {
                          return <div key={w} className="h-6 rounded bg-secondary/30" />;
                        }
                        return (
                          <div
                            key={w}
                            className={`h-6 ${tone.bar} ${isCrit ? `ring-2 ${tone.ring} ring-offset-1` : ""} rounded-md`}
                            style={{ gridColumn: `span ${span}` }}
                            title={`${item.title} · W${item.startWeek}–W${item.endWeek}${item.dependsOn?.length ? ` · depends on ${item.dependsOn.join(", ")}` : ""}`}
                          >
                            <span className="block truncate px-2 text-[10px] font-medium leading-6 text-white">
                              {item.deliverable}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      <span className="text-primary">{icon}</span> {label}
    </div>
  );
}

const TONE: Record<string, string> = {
  amber:   "border-amber-200/70 bg-amber-50/60",
  rose:    "border-rose-200/70 bg-rose-50/60",
  emerald: "border-emerald-200/70 bg-emerald-50/60",
  sky:     "border-sky-200/70 bg-sky-50/60",
};

function ListCard({ title, icon, items, tone }: { title: string; icon: React.ReactNode; items: string[]; tone: keyof typeof TONE }) {
  if (!items?.length) return null;
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${TONE[tone]}`}>
      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-foreground/70">
        {icon} {title}
      </div>
      <ul className="mt-2 space-y-1.5 text-xs text-foreground/85">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/50" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function ConfidencePanel({ intent }: { intent: NonNullable<Blueprint["intent"]> }) {
  const c = intent.confidence;
  if (!c) return null;
  const v = Math.max(0, Math.min(100, Math.round(c.overall ?? 0)));
  const tone = v >= 80 ? { text: "text-emerald-700", bar: "bg-emerald-500", chip: "bg-emerald-50 border-emerald-200 text-emerald-800" }
             : v >= 55 ? { text: "text-amber-700",   bar: "bg-amber-500",   chip: "bg-amber-50 border-amber-200 text-amber-800" }
             :          { text: "text-rose-700",    bar: "bg-rose-500",    chip: "bg-rose-50 border-rose-200 text-rose-800" };
  const flags = c.lowConfidenceFlags ?? [];
  return (
    <div className="lux-card p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Gauge className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Intent confidence
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}>
              {v >= 80 ? "High" : v >= 55 ? "Medium" : "Low"}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/85">{c.rationale}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${tone.bar} transition-all`} style={{ width: `${v}%` }} />
          </div>
        </div>
        <div className={`text-3xl font-bold ${tone.text} sm:text-right`}>{v}%</div>
      </div>

      {flags.length > 0 && (
        <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" /> Confirm or correct these assumptions
          </div>
          <ul className="mt-3 space-y-2.5">
            {flags.map((f, i) => (
              <li key={i} className="rounded-lg border border-amber-200/70 bg-white/60 p-3">
                <div className="text-xs font-semibold text-amber-900">{f.field}</div>
                <div className="mt-0.5 text-xs text-amber-900/80">{f.reason}</div>
                <div className="mt-1.5 text-[11px] text-foreground/70">
                  <span className="font-medium text-foreground">Suggested fix:</span> {f.suggestion}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
