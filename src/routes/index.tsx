import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Workflow, Database, Cpu, Rocket, Layers, Code2, GitBranch } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildBlueprint AI — Idea to launch blueprint" },
      { name: "description", content: "Turn any app, SaaS, marketplace, or AI agent idea into a 12-phase build blueprint with 100+ copy-ready prompts." },
    ],
  }),
  component: Landing,
});

const EXAMPLES = [
  "An Uber for lawn care",
  "A bookkeeping CRM for solo accountants",
  "A dating app for hikers",
  "A Call of Duty style browser game",
  "An AI agency management platform",
];

const PHASES = [
  "Discovery", "UI/UX", "Database", "Auth", "Core Features", "AI Features",
  "Payments", "Admin", "Testing", "Deploy", "Scaling", "Optimization",
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />

      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display text-lg font-semibold">BuildBlueprint <span className="gradient-text">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#phases" className="hover:text-foreground">Phases</a>
          <a href="#examples" className="hover:text-foreground">Examples</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">Sign in</Link>
          <Link to="/auth" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-24 text-center sm:pt-24">
        <div className="glass mx-auto inline-flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--glow)" }} />
          Built for Lovable, Cursor, Bolt, Claude Code & more
        </div>
        <h1 className="font-display mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          From a one-line idea<br />
          to a <span className="gradient-text">complete dev blueprint</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The AI Product Architect that turns "I want X" into a 12-phase roadmap with
          100+ copy-ready prompts, tech-stack picks, database schema, and a sequential
          build chain. Paste into any AI coding tool. Ship faster.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base font-medium">
            Generate your blueprint <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how" className="glass inline-flex items-center gap-2 px-6 py-3 text-base font-medium">
            See how it works
          </a>
        </div>

        {/* Floating preview */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="glass-strong animate-float overflow-hidden p-2">
            <div className="rounded-xl bg-background/60 p-6 text-left">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                </div>
                <span className="ml-2 font-mono">blueprint://dating-app-for-hikers</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PHASES.slice(0, 8).map((p, i) => (
                  <div key={p} className="rounded-lg border border-border/60 bg-surface/40 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phase {i + 1}</div>
                    <div className="mt-1 text-sm font-medium">{p}</div>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full shimmer" style={{ width: `${30 + i * 9}%`, background: "var(--gradient-primary)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div aria-hidden className="absolute inset-x-0 -bottom-10 -z-10 mx-auto h-40 w-3/4 blur-3xl" style={{ background: "var(--gradient-primary)", opacity: 0.25 }} />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Three steps from idea to a buildable plan.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Describe your idea", body: "One sentence is enough. The Architect infers users, features, and constraints." },
            { icon: Workflow, title: "Get a 12-phase roadmap", body: "Discovery → Deploy → Scale. Each phase with goals, complexity, and dependencies." },
            { icon: Code2, title: "Copy ready-to-run prompts", body: "Primary, advanced, expert, bugfix, scaling prompts plus a full sequential chain." },
          ].map((s) => (
            <div key={s.title} className="glass-strong gradient-border p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <s.icon className="h-5 w-5 text-background" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phases */}
      <section id="phases" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">A blueprint for every phase</h2>
          <p className="mt-3 text-muted-foreground">12 phases. 6 prompt styles per phase. A 24-step sequential build chain.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PHASES.map((p, i) => {
            const Icon = [Sparkles, Layers, Database, Cpu, Workflow, Sparkles, Rocket, GitBranch, Code2, Rocket, Workflow, Cpu][i];
            return (
              <div key={p} className="glass p-4 transition hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phase {i + 1}</div>
                    <div className="text-sm font-medium">{p}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">What people build</h2>
          <p className="mt-3 text-muted-foreground">Apps, SaaS, marketplaces, games, AI agents — anything you can describe.</p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {EXAMPLES.map((e) => (
            <div key={e} className="glass px-4 py-2 text-sm text-muted-foreground">{e}</div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/auth" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base font-medium">
            Try it free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BuildBlueprint AI · Built for builders.
      </footer>
    </div>
  );
}
