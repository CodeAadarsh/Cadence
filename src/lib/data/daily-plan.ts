import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { DailyPlan } from "@/lib/types";

export async function getDailyPlan(date: string): Promise<DailyPlan | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_plans")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  return (data as DailyPlan | null) ?? null;
}

/** Minutes actually tracked via the timer on a given planned day. */
export async function getTrackedMinutesForDate(date: string): Promise<number> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("actual_minutes")
    .eq("planned_date", date);
  return (data ?? []).reduce((sum, t) => sum + (t.actual_minutes ?? 0), 0);
}
