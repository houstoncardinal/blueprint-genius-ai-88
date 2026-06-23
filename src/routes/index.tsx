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

      {/* Hero — futuristic */}
      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-28 sm:pt-20">
        {/* Animated backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-grid absolute inset-0" />
          <div className="absolute inset-0 animate-aurora" style={{ background: "var(--gradient-aurora)" }} />
          {/* Orbit rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="orbit-ring animate-orbit" style={{ width: 520, height: 520, left: -260, top: -260 }} />
            <div className="orbit-ring animate-orbit-rev" style={{ width: 760, height: 760, left: -380, top: -380, opacity: .7 }} />
            <div className="orbit-ring animate-orbit" style={{ width: 1040, height: 1040, left: -520, top: -520, opacity: .45 }} />
          </div>
          {/* Soft glow */}
          <div className="absolute left-1/2 top-[38%] h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
               style={{ background: "var(--gradient-primary)", opacity: .25 }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Status pill */}
          <div className="chip-glow mx-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide animate-rise" style={{ animationDelay: ".05s" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--glow)" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--glow)" }} />
            </span>
            <span className="text-muted-foreground">Live AI Architect · v2 online</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span className="hidden sm:inline gradient-text font-semibold">Made for Lovable · Cursor · Bolt</span>
          </div>

          {/* Headline with per-word animation */}
          <h1 className="font-display mt-7 text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl md:text-[5.25rem] word-stack">
            {["From", "one", "spark", "to"].map((w, i) => (
              <span key={i} style={{ animationDelay: `${0.15 + i * 0.06}s`, marginRight: ".25em" }}>{w}</span>
            ))}
            <br />
            <span className="relative inline-block animate-rise" style={{ animationDelay: ".55s" }}>
              <span className="gradient-text">a launch-ready blueprint</span>
              <span aria-hidden className="absolute inset-x-0 -bottom-2 h-[3px] rounded-full"
                    style={{ background: "var(--gradient-primary)", opacity: .55, filter: "blur(.5px)" }} />
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg text-muted-foreground animate-rise" style={{ animationDelay: ".7s" }}>
            The AI Product Architect that turns a single sentence into a 12-phase roadmap,
            100+ copy-ready prompts, a database schema, and a sequential build chain —
            engineered for the way vibe coders actually ship.
          </p>

          {/* CTA cluster */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-rise" style={{ animationDelay: ".85s" }}>
            <Link to="/auth" className="btn-primary animate-glow-pulse animate-sheen inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium">
              Generate your blueprint <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="chip-glow inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-medium hover:-translate-y-0.5 transition">
              <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
                <Sparkles className="h-3 w-3 text-background" />
              </span>
              Watch a 60-second tour
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground animate-rise" style={{ animationDelay: "1s" }}>
            {["12 phases", "100+ prompts", "Sequential build chain", "Mobile-first", "Versioned audit trail"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full" style={{ background: "var(--primary)" }} /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Floating preview console */}
        <div className="relative mx-auto mt-20 max-w-5xl animate-rise" style={{ animationDelay: "1.1s" }}>
          <div className="glass-strong animate-float overflow-hidden p-2">
            <div className="relative rounded-2xl bg-background/70 p-6 text-left overflow-hidden">
              {/* scanline */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan"
                   style={{ background: "linear-gradient(180deg, oklch(0.74 0.095 70 / .35), transparent)" }} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                  </div>
                  <span className="ml-2 font-mono">blueprint://dating-app-for-hikers</span>
                </div>
                <span className="hidden sm:inline font-mono opacity-70">architect · streaming</span>
              </div>
              <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PHASES.slice(0, 8).map((p, i) => (
                  <div key={p} className="group relative overflow-hidden rounded-xl border border-border/60 bg-surface/50 p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--primary)]/40">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phase {i + 1}</div>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)", animation: `glow-pulse 2.${i}s ease-in-out infinite` }} />
                    </div>
                    <div className="mt-1 text-sm font-medium">{p}</div>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full shimmer" style={{ width: `${30 + i * 9}%`, background: "var(--gradient-primary)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Marquee ticker */}
          <div className="mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-ticker gap-10 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {[...Array(2)].map((_, dup) => (
                <div key={dup} className="flex items-center gap-10">
                  {["intent capture","confidence scoring","intake wizard","schema draft","prompt chain","audit trail","exports","mobile-first","agents online"].map((t) => (
                    <span key={t + dup} className="inline-flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: "var(--primary)" }} /> {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
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
