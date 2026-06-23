import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Workflow, Database, Cpu, Rocket, Layers, Code2, GitBranch, Check } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useState } from "react";

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
  "Uber for lawn care",
  "Bookkeeping CRM for solo accountants",
  "Dating app for hikers",
  "Browser FPS game",
  "AI agency platform",
];

const PHASES = [
  "Discovery", "UI/UX", "Database", "Auth", "Core Features", "AI Features",
  "Payments", "Admin", "Testing", "Deploy", "Scaling", "Optimization",
];

function GoogleMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.12A6.99 6.99 0 0 1 5.46 12c0-.74.13-1.45.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function Landing() {
  const [googleLoading, setGoogleLoading] = useState(false);

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) {
        toast.error("Google sign-in failed", { description: result.error.message });
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = "/dashboard";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-zinc-900 font-sans antialiased">
      {/* Hairline grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(24,24,27,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 40%, transparent 75%)",
        }}
      />

      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-zinc-900">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
            BuildBlueprint <span className="text-zinc-400">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-zinc-500 md:flex">
          <a href="#how" className="hover:text-zinc-900 transition-colors">How it works</a>
          <a href="#phases" className="hover:text-zinc-900 transition-colors">Phases</a>
          <Link to="/pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
          <a href="#faq" className="hover:text-zinc-900 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={signInWithGoogle}
            disabled={googleLoading}
            className="hidden sm:inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-60"
          >
            <GoogleMark className="h-3.5 w-3.5" />
            {googleLoading ? "Opening…" : "Continue with Google"}
          </button>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/80 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            AI Product Architect · v2 online
          </div>

          {/* Headline */}
          <h1 className="font-display text-[2.75rem] leading-[1.05] font-medium tracking-[-0.025em] text-zinc-950 sm:text-6xl md:text-7xl">
            Describe it. <span className="text-zinc-400">Architect it.</span> Ship it.
          </h1>

          {/* Subhead */}
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-zinc-500 sm:text-lg">
            BuildBlueprint AI turns a single sentence into a 12-phase roadmap, 100+ copy-ready prompts,
            a database schema, and a sequential build chain — engineered for teams that ship.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={signInWithGoogle}
              disabled={googleLoading}
              className="inline-flex h-11 items-center justify-center gap-2.5 rounded-md border border-zinc-200 bg-white px-5 text-[14px] font-medium text-zinc-800 shadow-[0_1px_2px_rgba(16,24,40,0.06)] hover:bg-zinc-50 transition-colors disabled:opacity-60"
            >
              <GoogleMark />
              {googleLoading ? "Opening Google…" : "Continue with Google"}
            </button>
            <Link
              to="/auth"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-900 px-6 text-[14px] font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Start building free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-zinc-400">
            {["12 phases", "100+ prompts", "Sequential build chain", "Mobile-first", "Versioned audit trail"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-zinc-400" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Blueprint console */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_24px_70px_-20px_rgba(15,23,42,0.12)]">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                blueprint · dating-app-for-hikers.spec
              </div>
              <div className="w-10" />
            </div>

            <div className="flex flex-col md:flex-row min-h-[420px]">
              {/* Spec */}
              <div className="flex-1 border-b border-zinc-100 p-6 text-left md:border-b-0 md:border-r">
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">System prompt</div>
                <div className="font-mono text-[13px] leading-relaxed text-zinc-700">
                  <span className="text-blue-600">generate</span>{" "}
                  <span className="text-zinc-400">--type</span>{" "}
                  <span className="text-emerald-700">"social-marketplace"</span>
                  <br />
                  <span className="text-zinc-400">--scale</span>{" "}
                  <span className="text-emerald-700">"100k MAU"</span>
                  <br />
                  <br />
                  <span className="text-zinc-400">// Core components</span>
                  <br />
                  1. Auth Service <span className="text-zinc-400">(OAuth · Magic Link)</span>
                  <br />
                  2. Match Engine <span className="text-zinc-400">(Postgres · pgvector)</span>
                  <br />
                  3. Trips & Events <span className="text-zinc-400">(PostGIS)</span>
                  <br />
                  4. Realtime Chat <span className="text-zinc-400">(WS · Redis)</span>
                  <br />
                  5. Payments <span className="text-zinc-400">(Stripe Connect)</span>
                </div>
              </div>

              {/* Architecture grid */}
              <div className="relative flex flex-1 items-center justify-center bg-zinc-50/40 p-8">
                <div className="relative z-10 grid w-full max-w-sm grid-cols-2 gap-4">
                  {[
                    { label: "API_GATEWAY", accent: "bg-blue-500/30" },
                    { label: "REDIS_CACHE", accent: "bg-emerald-500/30" },
                    { label: "AUTH_SVC", accent: "bg-amber-500/30" },
                    { label: "DB_CLUSTER", accent: "bg-zinc-500/30" },
                    { label: "MATCH_ENGINE", accent: "bg-violet-500/30" },
                    { label: "PAYMENTS", accent: "bg-rose-500/30" },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="flex h-20 flex-col justify-between rounded-md border border-zinc-200 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300"
                    >
                      <div className={`h-1 w-8 rounded-full ${b.accent}`} />
                      <div className="font-mono text-[10px] tracking-wide text-zinc-500">{b.label}</div>
                    </div>
                  ))}
                </div>
                <svg className="pointer-events-none absolute inset-0 h-full w-full text-zinc-300 opacity-40" viewBox="0 0 400 300" aria-hidden>
                  <path d="M80 80 L320 80 M200 80 L200 220 M80 220 L320 220" stroke="currentColor" fill="none" strokeDasharray="3 5" />
                </svg>
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
              <span>BP-7721 · region us-east-1</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> architecture validated
              </span>
            </div>
          </div>
        </div>

        {/* Logo proof row */}
        <div className="mt-16 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
          Trusted by engineering teams shipping with Lovable, Cursor, Bolt &amp; Claude Code
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-zinc-100 bg-zinc-50/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">How it works</div>
            <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">
              Three steps from idea to blueprint
            </h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {[
              { icon: Sparkles, n: "01", title: "Describe your idea", body: "One sentence is enough. The Architect infers users, features, and constraints." },
              { icon: Workflow, n: "02", title: "Get a 12-phase roadmap", body: "Discovery → Deploy → Scale. Each phase with goals, complexity, and dependencies." },
              { icon: Code2,   n: "03", title: "Copy ready-to-run prompts", body: "Primary, advanced, expert, bugfix, scaling prompts plus a full sequential chain." },
            ].map((s) => (
              <div key={s.title} className="bg-white p-8">
                <div className="flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 bg-zinc-50">
                    <s.icon className="h-4 w-4 text-zinc-700" />
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">{s.n}</div>
                </div>
                <h3 className="mt-6 text-base font-medium text-zinc-950">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phases */}
      <section id="phases" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">The blueprint</div>
            <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">
              A complete plan for every phase
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
              12 phases. 6 prompt styles per phase. A 24-step sequential build chain.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PHASES.map((p, i) => {
              const Icon = [Sparkles, Layers, Database, Cpu, Workflow, Sparkles, Rocket, GitBranch, Code2, Rocket, Workflow, Cpu][i];
              return (
                <div key={p} className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-zinc-300">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 bg-zinc-50">
                      <Icon className="h-4 w-4 text-zinc-700" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-400">Phase {String(i + 1).padStart(2, "0")}</div>
                      <div className="text-[13px] font-medium text-zinc-900">{p}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="border-t border-zinc-100 bg-zinc-50/40 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">What people build</div>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">
            Apps, SaaS, marketplaces, agents
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((e) => (
              <div key={e} className="rounded-md border border-zinc-200 bg-white px-3.5 py-1.5 text-[13px] text-zinc-600">
                {e}
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link
              to="/auth"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-900 px-6 text-[14px] font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing-teaser" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">Pricing</div>
            <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">
              Simple, predictable
            </h2>
            <p className="mt-3 text-[15px] text-zinc-500">Free to start. Upgrade when you're shipping more than one idea a month.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { name: "Free", price: "$0",  blurb: "1 blueprint / month" },
              { name: "Pro",  price: "$29", blurb: "25 blueprints + exports + audit trail", featured: true },
              { name: "Team", price: "$99", blurb: "Unlimited + approvals + SSO" },
            ].map((t) => (
              <div
                key={t.name}
                className={`rounded-lg border bg-white p-6 text-center ${t.featured ? "border-zinc-900 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.18)]" : "border-zinc-200"}`}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">{t.name}</div>
                <div className="mt-3 text-3xl font-medium tracking-tight text-zinc-950">
                  {t.price}<span className="text-sm font-normal text-zinc-400">/mo</span>
                </div>
                <div className="mt-2 text-[13px] text-zinc-500">{t.blurb}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              See full pricing <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-zinc-100 bg-zinc-50/40 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">FAQ</div>
            <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">
              Questions, answered
            </h2>
          </div>
          <div className="mt-10 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {[
              { q: "Is this another ChatGPT wrapper?", a: "No — we run a specialist Architect prompt against GPT-4o to produce 12 phases, 100+ prompts, a schema, an architecture diagram, and a sequential build chain in one structured response." },
              { q: "What stacks does it support?", a: "Lovable, Cursor, Bolt, Windsurf, Claude Code — any AI-native IDE. The prompts are stack-agnostic and stack-specific where it matters." },
              { q: "Do I own my blueprints?", a: "Yes. You own everything you submit and everything generated from it. We never train models on your content." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel from your dashboard — access continues through the end of the billing period." },
            ].map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium text-zinc-900">
                  {f.q}
                  <span className="font-mono text-zinc-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-zinc-500">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-100 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[14px] font-semibold tracking-tight text-zinc-900">
                BuildBlueprint <span className="text-zinc-400">AI</span>
              </span>
            </div>
            <p className="mt-3 text-[12px] text-zinc-500">Turn a single sentence into a launch-ready blueprint.</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-900">Product</div>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
              <li><a href="#how" className="hover:text-zinc-900">How it works</a></li>
              <li><a href="#phases" className="hover:text-zinc-900">Phases</a></li>
              <li><Link to="/pricing" className="hover:text-zinc-900">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-900">Company</div>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
              <li><a href="#faq" className="hover:text-zinc-900">FAQ</a></li>
              <li><Link to="/terms" className="hover:text-zinc-900">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-zinc-900">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-900">Get started</div>
            <button
              onClick={signInWithGoogle}
              disabled={googleLoading}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              <GoogleMark className="h-3.5 w-3.5" />
              Continue with Google
            </button>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl px-6 text-[11px] text-zinc-400">
          © {new Date().getFullYear()} BuildBlueprint AI
        </div>
      </footer>
    </div>
  );
}
