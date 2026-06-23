import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateInput = z.object({
  idea: z.string().trim().min(8).max(2000),
  refinedBrief: z.unknown().optional(),
});

const PLAN_QUOTAS: Record<string, number> = { free: 1, pro: 25, team: 9999 };

function monthStart(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

/** Insert a pending row and return its id. Enforces monthly quota per plan. */
export const createBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    // Look up plan (defaults to free)
    const { data: sub } = await context.supabase
      .from("subscriptions").select("plan,status").eq("user_id", context.userId).maybeSingle();
    const plan = sub?.status === "active" || sub?.status === "trialing" ? (sub?.plan ?? "free") : "free";
    const quota = PLAN_QUOTAS[plan] ?? 1;

    // Read this month's usage
    const period = monthStart();
    const { data: usageRow } = await context.supabase
      .from("usage_counters").select("blueprints_generated")
      .eq("user_id", context.userId).eq("period_start", period).maybeSingle();
    const used = usageRow?.blueprints_generated ?? 0;
    if (used >= quota) {
      throw new Error(
        plan === "free"
          ? "You've used your 1 free blueprint this month. Upgrade to Pro for 25/month."
          : `You've hit your ${plan} plan limit of ${quota} blueprints this month.`,
      );
    }

    const { data: row, error } = await context.supabase
      .from("blueprints")
      .insert({ user_id: context.userId, idea: data.idea, status: "generating" })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Insert failed");

    // Increment usage (upsert)
    await context.supabase.from("usage_counters").upsert(
      { user_id: context.userId, period_start: period, blueprints_generated: used + 1 },
      { onConflict: "user_id,period_start" },
    );
    await context.supabase.from("audit_log").insert({
      user_id: context.userId, blueprint_id: row.id, actor: "user",
      action: "blueprint.created", details: { idea_preview: data.idea.slice(0, 120) },
    });

    return { id: row.id as string };
  });


/** Run the AI generation for an existing row. Idempotent-ish (re-runs if not ready). */
export const runBlueprintGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("blueprints")
      .select("id,idea,status")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    if (row.status === "ready") return { id: data.id, status: "ready" as const };

    await context.supabase
      .from("blueprints")
      .update({ status: "generating", error: null })
      .eq("id", data.id);

    try {
      const { generateBlueprint } = await import("./ai.server");
      const bp = await generateBlueprint(row.idea);
      const { error: upErr } = await context.supabase
        .from("blueprints")
        .update({
          title: bp.title || "Untitled Blueprint",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          analysis: bp as any,
          status: "ready",
          error: null,
        })
        .eq("id", data.id);
      if (upErr) throw new Error(upErr.message);
      return { id: data.id, status: "ready" as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      await context.supabase
        .from("blueprints")
        .update({ status: "failed", error: msg })
        .eq("id", data.id);
      throw new Error(msg);
    }
  });

export const listBlueprints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("blueprints")
      .select("id,title,idea,status,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("blueprints")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Blueprint not found");
    return row;
  });

export const deleteBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("blueprints").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateBlueprintSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      patch: z.record(z.string(), z.unknown()),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("blueprints")
      .select("analysis,title")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    const current = (row.analysis ?? {}) as Record<string, unknown>;
    const merged = { ...current, ...data.patch };
    const nextTitle =
      typeof data.patch.title === "string" && data.patch.title.trim().length > 0
        ? (data.patch.title as string).trim()
        : row.title;
    const { error: upErr } = await context.supabase
      .from("blueprints")
      .update({ analysis: merged as never, title: nextTitle })
      .eq("id", data.id);
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });
