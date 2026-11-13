"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { ActionResult } from "@/lib/actions/tasks";
import type { Subtask } from "@/lib/types";

function revalidateApp() {
  revalidatePath("/today");
  revalidatePath("/week");
  revalidatePath("/backlog");
}

export async function getSubtasks(taskId: string): Promise<Subtask[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function addSubtask(
  taskId: string,
  title: string,
): Promise<ActionResult<Subtask>> {
  const user = await requireUser();
  const trimmed = title.trim();
  if (!trimmed) return { ok: false, error: "Title is required" };
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("subtasks")
    .select("position")
    .eq("task_id", taskId)
    .order("position", { ascending: false })
    .limit(1);
  const position = (last?.[0]?.position ?? 0) + 1000;
  const { data, error } = await supabase
    .from("subtasks")
    .insert({ task_id: taskId, user_id: user.id, title: trimmed, position })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data };
}

export async function toggleSubtask(
  id: string,
  done: boolean,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subtasks")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}

export async function deleteSubtask(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subtasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}
