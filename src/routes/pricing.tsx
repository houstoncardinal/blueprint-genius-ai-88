import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — BuildBlueprint AI" },
      { name: "description", content: "Simple, transparent pricing. Start free, upgrade when your ideas are flying." },
      { property: "og:title", content: "Pricing — BuildBlueprint AI" },
      { property: "og:description", content: "Free, Pro, and Team plans for solo builders, indie founders, and product squads." },
      { property: "og:url", content: "https://blueprint-genius-ai-88.lovable.app/pricing" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://blueprint-genius-ai-88.lovable.app/pricing" }],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Free", price: "$0", cadence: "forever",
    blurb: "Try the architect on one idea this month.",
    cta: "Start free", to: "/auth",
    features: [
      "1 blueprint per month",
      "Full 12-phase roadmap",
      "100+ copy-ready prompts",
      "Mobile-friendly workspace",
    ],
  },
  {
    name: "Pro", price: "$29", cadence: "per month",
    blurb: "For founders shipping multiple ideas.",
    cta: "Upgrade to Pro", to: "/auth", featured: true,
    features: [
      "25 blueprints per month",
      "Versioned audit trail",
      "PDF / Markdown / JSON export",
      "Drag-and-drop roadmap editing",
      "Priority generation queue",
      "Email support",
    ],
  },
  {
    name: "Team", price: "$99", cadence: "per month",
    blurb: "For product squads and agencies.",
    cta: "Talk to us", to: "/auth",
    features: [
      "Unlimited blueprints",
      "Approval workflow for snapshots",
      "Stakeholder-ready slide deck export",
      "Team workspace + roles",
      "SSO & SAML (on request)",
      "Dedicated Slack support",
    ],
  },
];

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel from your dashboard — you keep access until the end of the billing period." },
  { q: "What counts as a blueprint?", a: "One full generation from your idea: roadmap, prompts, schema, architecture, and the agent runs that follow." },
  { q: "Do unused blueprints roll over?", a: "No. Each plan refills on the first of the month so the system stays simple." },
  { q: "Is my data private?", a: "Your blueprints are scoped to your account by row-level security. We never train models on your data." },
];

function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display text-lg font-semibold">BuildBlueprint <span className="gradient-text">AI</span></span>
        </Link>
        <Link to="/auth" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium">
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Pricing that scales with your ideas</h1>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're shipping more than one thing a month.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className={`glass-strong p-6 ${t.featured ? "ring-2 ring-primary/60" : ""}`}>
              {t.featured && <div className="mb-3 inline-flex rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">Most popular</div>}
              <div className="font-display text-2xl font-semibold">{t.name}</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <div className="text-4xl font-bold">{t.price}</div>
                <div className="text-sm text-muted-foreground">{t.cadence}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={t.to} className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium ${t.featured ? "btn-primary" : "glass"}`}>
                {t.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Payments powered by Stripe. Taxes calculated at checkout. Cancel anytime.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-display text-center text-3xl font-semibold">Frequently asked</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="glass group p-4">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} BuildBlueprint AI</div>
      </footer>
    </div>
  );
}
