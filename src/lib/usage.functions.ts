import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PLAN_QUOTAS: Record<string, number> = { free: 1, pro: 25, team: 9999 };

function monthStart(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export const getMyUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: sub } = await context.supabase
      .from("subscriptions").select("plan,status,current_period_end")
      .eq("user_id", context.userId).maybeSingle();
    const plan = sub?.status === "active" || sub?.status === "trialing" ? (sub?.plan ?? "free") : "free";
    const quota = PLAN_QUOTAS[plan] ?? 1;
    const period = monthStart();
    const { data: u } = await context.supabase
      .from("usage_counters").select("blueprints_generated")
      .eq("user_id", context.userId).eq("period_start", period).maybeSingle();
    const used = u?.blueprints_generated ?? 0;
    return { plan, status: sub?.status ?? "active", quota, used, remaining: Math.max(0, quota - used) };
  });
