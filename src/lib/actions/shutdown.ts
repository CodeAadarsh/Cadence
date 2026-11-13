"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { ActionResult } from "@/lib/actions/tasks";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

function revalidateApp() {
  revalidatePath("/today");
  revalidatePath("/week");
  revalidatePath("/backlog");
  revalidatePath("/analytics");
}

export type RolloverAction = "tomorrow" | "backlog" | "keep";

const shutdownSchema = z.object({
  date: dateString,
  nextDate: dateString,
  notes: z.string().max(10000).nullable().optional(),
  rollovers: z
    .array(
      z.object({
        id: z.string().uuid(),
        action: z.enum(["tomorrow", "backlog", "keep"]),
      }),
    )
    .max(200)
    .optional(),
});

/**
 * Applies the end-of-day ritual: carries unfinished work forward, stores the
 * day's reflection, and marks the plan as shut down.
 */
export async function completeShutdown(
  input: z.input<typeof shutdownSchema>,
): Promise<ActionResult<{ moved: number }>> {
  const user = await requireUser();
  const parsed = shutdownSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { date, nextDate, notes, rollovers = [] } = parsed.data;
  const supabase = await createClient();

  const toTomorrow = rollovers.filter((r) => r.action === "tomorrow");
  const toBacklog = rollovers.filter((r) => r.action === "backlog");

  if (toTomorrow.length) {
    const { data: tail } = await supabase
      .from("tasks")
      .select("position")
      .eq("user_id", user.id)
      .eq("planned_date", nextDate)
      .order("position", { ascending: false })
      .limit(1);
    let position = (tail?.length ? Number(tail[0].position) : 0) + 1000;

    for (const r of toTomorrow) {
      const { error } = await supabase
        .from("tasks")
        .update({ planned_date: nextDate, status: "planned", position })
        .eq("id", r.id)
        .eq("user_id", user.id);
      if (error) return { ok: false, error: error.message };
      position += 1000;
    }
  }

  if (toBacklog.length) {
    const { data: tail } = await supabase
      .from("tasks")
      .select("position")
      .eq("user_id", user.id)
      .is("planned_date", null)
      .order("position", { ascending: false })
      .limit(1);
    let position = (tail?.length ? Number(tail[0].position) : 0) + 1000;

    for (const r of toBacklog) {
      const { error } = await supabase
        .from("tasks")
        .update({ planned_date: null, status: "backlog", position })
        .eq("id", r.id)
        .eq("user_id", user.id);
      if (error) return { ok: false, error: error.message };
      position += 1000;
    }
  }

  const { error: planError } = await supabase.from("daily_plans").upsert(
    {
      user_id: user.id,
      date,
      notes: notes?.trim() ? notes.trim() : null,
      shutdown_completed: true,
    },
    { onConflict: "user_id,date" },
  );
  if (planError) return { ok: false, error: planError.message };

  revalidateApp();
  return { ok: true, data: { moved: toTomorrow.length + toBacklog.length } };
}

export async function reopenShutdown(date: string): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = dateString.safeParse(date);
  if (!parsed.success) return { ok: false, error: "Invalid date" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_plans")
    .update({ shutdown_completed: false })
    .eq("user_id", user.id)
    .eq("date", parsed.data);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/today");
  return { ok: true, data: null };
}
