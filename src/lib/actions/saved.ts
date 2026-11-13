"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { ActionResult } from "@/lib/actions/tasks";

const idSchema = z.string().uuid();

function revalidateSaved() {
  // Layout scope so the sidebar's saved badge updates from any page.
  revalidatePath("/", "layout");
  revalidatePath("/saved");
  revalidatePath("/today");
  revalidatePath("/week");
  revalidatePath("/backlog");
}

/** Slack-style "save for later": flags a task and surfaces it in /saved. */
export async function setTaskSaved(
  id: string,
  saved: boolean,
): Promise<ActionResult<{ savedAt: string | null }>> {
  const user = await requireUser();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid task" };

  const savedAt = saved ? new Date().toISOString() : null;
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ saved_at: savedAt })
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidateSaved();
  return { ok: true, data: { savedAt } };
}

/** Clears every saved flag at once — the "clear saved items" affordance. */
export async function clearSavedTasks(): Promise<ActionResult<{ cleared: number }>> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ saved_at: null })
    .eq("user_id", user.id)
    .not("saved_at", "is", null)
    .select("id");

  if (error) return { ok: false, error: error.message };
  revalidateSaved();
  return { ok: true, data: { cleared: data?.length ?? 0 } };
}
