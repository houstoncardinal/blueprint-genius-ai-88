import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BuildBlueprint AI" },
      { name: "description", content: "How BuildBlueprint AI collects, uses, and protects your data." },
      { property: "og:title", content: "Privacy Policy — BuildBlueprint AI" },
      { property: "og:url", content: "https://blueprint-genius-ai-88.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://blueprint-genius-ai-88.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
      <h1 className="mt-6 font-display text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="prose prose-invert mt-8 max-w-none space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p><strong className="text-foreground">What we collect.</strong> Account email, the ideas and content you submit, generated blueprints, basic usage telemetry (page views, feature use), and payment metadata via Stripe.</p>
        <p><strong className="text-foreground">How we use it.</strong> To run the Service, generate blueprints, bill your plan, send transactional email (welcome, generation complete, receipts), and improve product quality.</p>
        <p><strong className="text-foreground">Sub-processors.</strong> Supabase (database &amp; auth), OpenAI (LLM generation), Stripe (payments), Resend (email). Data is sent only as needed to deliver the feature you triggered.</p>
        <p><strong className="text-foreground">Training.</strong> We do not use your content to train AI models. Prompts sent to OpenAI are subject to OpenAI's API data policy, which excludes API content from training by default.</p>
        <p><strong className="text-foreground">Security.</strong> Row-level security scopes every blueprint to its owner. Secrets are encrypted at rest. Auth tokens are short-lived and rotated.</p>
        <p><strong className="text-foreground">Your rights.</strong> Export or delete your data at any time from your dashboard. Contact us for GDPR / CCPA requests.</p>
        <p><strong className="text-foreground">Retention.</strong> Account &amp; blueprint data is kept until you delete it. Audit logs are retained for 12 months.</p>
        <p><strong className="text-foreground">Contact.</strong> privacy@buildblueprint.ai</p>
      </div>
    </main>
  );
}
