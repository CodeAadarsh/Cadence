"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { ActionResult } from "@/lib/actions/tasks";

function revalidateApp() {
  revalidatePath("/today");
  revalidatePath("/week");
  revalidatePath("/analytics");
}

export type TimerState = {
  running: boolean;
  startedAt: string | null;
  trackedSeconds: number;
  actualMinutes: number;
};

export async function getTimerState(taskId: string): Promise<TimerState> {
  await requireUser();
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("time_entries")
    .select("started_at, ended_at, duration_seconds")
    .eq("task_id", taskId);

  let trackedSeconds = 0;
  let running = false;
  let startedAt: string | null = null;
  for (const e of entries ?? []) {
    if (e.ended_at) trackedSeconds += e.duration_seconds ?? 0;
    else {
      running = true;
      startedAt = e.started_at;
    }
  }
  const { data: task } = await supabase
    .from("tasks")
    .select("actual_minutes")
    .eq("id", taskId)
    .single();
  return { running, startedAt, trackedSeconds, actualMinutes: task?.actual_minutes ?? 0 };
}

export async function startTimer(taskId: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("time_entries")
    .select("id")
    .eq("task_id", taskId)
    .is("ended_at", null)
    .limit(1);
  if (existing && existing.length) return { ok: true, data: null };

  const { error } = await supabase.from("time_entries").insert({
    task_id: taskId,
    user_id: user.id,
    started_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("tasks")
    .update({ status: "in_progress" })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .neq("status", "done");

  revalidateApp();
  return { ok: true, data: null };
}

export async function stopTimer(
  taskId: string,
): Promise<ActionResult<{ actualMinutes: number }>> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: running } = await supabase
    .from("time_entries")
    .select("id, started_at")
    .eq("task_id", taskId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1);
  const entry = running?.[0];
  if (!entry) return { ok: true, data: { actualMinutes: 0 } };

  const now = Date.now();
  const started = new Date(entry.started_at).getTime();
  const duration = Math.max(0, Math.round((now - started) / 1000));
  await supabase
    .from("time_entries")
    .update({
      ended_at: new Date(now).toISOString(),
      duration_seconds: duration,
    })
    .eq("id", entry.id);

  const { data: task } = await supabase
    .from("tasks")
    .select("actual_minutes")
    .eq("id", taskId)
    .single();
  const addMinutes = duration >= 30 ? Math.max(1, Math.round(duration / 60)) : 0;
  const actualMinutes = (task?.actual_minutes ?? 0) + addMinutes;
  await supabase
    .from("tasks")
    .update({ actual_minutes: actualMinutes })
    .eq("id", taskId)
    .eq("user_id", user.id);

  revalidateApp();
  return { ok: true, data: { actualMinutes } };
}
