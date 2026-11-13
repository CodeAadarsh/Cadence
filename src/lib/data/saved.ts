import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { TaskWithChannel } from "@/lib/types";

const SELECT_WITH_CHANNEL = "*, channel:channels(*)";

export async function getSavedTasks(): Promise<TaskWithChannel[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(SELECT_WITH_CHANNEL)
    .not("saved_at", "is", null)
    .order("saved_at", { ascending: false });
  return (data as TaskWithChannel[] | null) ?? [];
}

export async function getSavedCount(): Promise<number> {
  await requireUser();
  const supabase = await createClient();
  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .not("saved_at", "is", null);
  return count ?? 0;
}
