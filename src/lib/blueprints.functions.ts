import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateInput = z.object({ idea: z.string().trim().min(8).max(500) });

export const createAndGenerateBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Create pending row
    const { data: row, error } = await supabase
      .from("blueprints")
      .insert({ user_id: userId, idea: data.idea, status: "generating" })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Insert failed");
    const id = row.id as string;

    // Generate via OpenAI (server-only import)
    try {
      const { generateBlueprint } = await import("./ai.server");
      const bp = await generateBlueprint(data.idea);
      const { error: upErr } = await supabase
        .from("blueprints")
        .update({
          title: bp.title || "Untitled Blueprint",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          analysis: bp as any,
          status: "ready",
          error: null,
        })
        .eq("id", id);
      if (upErr) throw new Error(upErr.message);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      await supabase.from("blueprints").update({ status: "failed", error: msg }).eq("id", id);
      throw new Error(msg);
    }

    return { id };
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
