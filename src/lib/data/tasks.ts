import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { TaskWithChannel, TaskWithDetails } from "@/lib/types";

const SELECT_WITH_CHANNEL = "*, channel:channels(*)";

export async function getTasksForDate(
  date: string,
): Promise<TaskWithChannel[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(SELECT_WITH_CHANNEL)
    .eq("planned_date", date)
    .order("position", { ascending: true });
  return (data as TaskWithChannel[] | null) ?? [];
}

export async function getTasksInRange(
  start: string,
  end: string,
): Promise<TaskWithChannel[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(SELECT_WITH_CHANNEL)
    .gte("planned_date", start)
    .lte("planned_date", end)
    .order("position", { ascending: true });
  return (data as TaskWithChannel[] | null) ?? [];
}

export async function getBacklogTasks(): Promise<TaskWithChannel[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(SELECT_WITH_CHANNEL)
    .is("planned_date", null)
    .in("status", ["backlog", "planned", "in_progress"])
    .order("position", { ascending: true });
  return (data as TaskWithChannel[] | null) ?? [];
}

export async function getTaskById(
  id: string,
): Promise<TaskWithDetails | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*, channel:channels(*), subtasks(*)")
    .eq("id", id)
    .order("position", { referencedTable: "subtasks", ascending: true })
    .single();
  return (data as TaskWithDetails | null) ?? null;
}
