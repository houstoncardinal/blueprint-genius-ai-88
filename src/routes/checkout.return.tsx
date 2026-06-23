import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment complete — BuildBlueprint AI" }] }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="glass-strong max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold">You're in.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session_id ? "Your subscription is active. Welcome to the next tier." : "No session info — please contact support if you were charged."}
        </p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-medium">
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
