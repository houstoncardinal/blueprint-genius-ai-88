import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateBlueprintSection } from "@/lib/blueprints.functions";
import type { Blueprint } from "@/lib/ai.server";

export function useBlueprintSave(id: string) {
  const fn = useServerFn(updateBlueprintSection);
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const save = useCallback(
    async (patch: Partial<Blueprint>) => {
      setSaving(true);
      try {
        await fn({ data: { id, patch: patch as Record<string, unknown> } });
        await qc.invalidateQueries({ queryKey: ["blueprint", id] });
        toast.success("Saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [fn, id, qc],
  );
  return { save, saving };
}

export function useDraft<T>(initial: T): [T, (next: T) => void, boolean, () => void] {
  const [draft, setDraft] = useState<T>(initial);
  const initialJson = useMemo(() => JSON.stringify(initial), [initial]);
  useEffect(() => {
    setDraft(initial);
  }, [initialJson]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify(draft) !== initialJson;
  const reset = () => setDraft(initial);
  return [draft, setDraft, dirty, reset];
}
