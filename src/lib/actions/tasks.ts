"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { Database } from "@/lib/supabase/database.types";
import type { TaskStatus, TaskWithChannel } from "@/lib/types";

type DB = SupabaseClient<Database>;
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const SELECT_WITH_CHANNEL = "*, channel:channels(*)";

function revalidateApp() {
  revalidatePath("/today");
  revalidatePath("/week");
  revalidatePath("/backlog");
  revalidatePath("/analytics");
}

const statusEnum = z.enum([
  "backlog",
  "planned",
  "in_progress",
  "done",
  "cancelled",
]);
const priorityEnum = z.enum(["none", "low", "medium", "high"]);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

async function nextPosition(
  supabase: DB,
  userId: string,
  plannedDate: string | null,
): Promise<number> {
  let query = supabase
    .from("tasks")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1);
  query =
    plannedDate === null
      ? query.is("planned_date", null)
      : query.eq("planned_date", plannedDate);
  const { data } = await query;
  const max = data && data.length ? Number(data[0].position) : 0;
  return max + 1000;
}

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  plannedDate: dateString.nullable().optional(),
  channelId: z.string().uuid().nullable().optional(),
  estimatedMinutes: z.number().int().min(0).max(1440).optional(),
  priority: priorityEnum.optional(),
  notes: z.string().max(10000).nullable().optional(),
  status: statusEnum.optional(),
});

export async function createTask(
  input: z.input<typeof createTaskSchema>,
): Promise<ActionResult<TaskWithChannel>> {
  const user = await requireUser();
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid task" };
  }
  const p = parsed.data;
  const supabase = await createClient();
  const plannedDate = p.plannedDate ?? null;
  const position = await nextPosition(supabase, user.id, plannedDate);

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: p.title,
      planned_date: plannedDate,
      channel_id: p.channelId ?? null,
      estimated_minutes: p.estimatedMinutes ?? 0,
      priority: p.priority ?? "none",
      notes: p.notes ?? null,
      status: p.status ?? (plannedDate ? "planned" : "backlog"),
      position,
    })
    .select(SELECT_WITH_CHANNEL)
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: data as unknown as TaskWithChannel };
}

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(500).optional(),
  notes: z.string().max(10000).nullable().optional(),
  channelId: z.string().uuid().nullable().optional(),
  estimatedMinutes: z.number().int().min(0).max(1440).optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  plannedDate: dateString.nullable().optional(),
  position: z.number().optional(),
});

export async function updateTask(
  input: z.input<typeof updateTaskSchema>,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid update" };
  }
  const { id, ...rest } = parsed.data;
  const patch: TaskUpdate = {};
  if (rest.title !== undefined) patch.title = rest.title;
  if (rest.notes !== undefined) patch.notes = rest.notes;
  if (rest.channelId !== undefined) patch.channel_id = rest.channelId;
  if (rest.estimatedMinutes !== undefined)
    patch.estimated_minutes = rest.estimatedMinutes;
  if (rest.priority !== undefined) patch.priority = rest.priority;
  if (rest.status !== undefined) patch.status = rest.status;
  if (rest.plannedDate !== undefined) patch.planned_date = rest.plannedDate;
  if (rest.position !== undefined) patch.position = rest.position;

  if (Object.keys(patch).length === 0) return { ok: true, data: null };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}

export async function toggleTaskComplete(
  id: string,
  done: boolean,
): Promise<ActionResult> {
  return updateTask({ id, status: done ? "done" : "planned" });
}

export async function setTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<ActionResult> {
  return updateTask({ id, status });
}

const moveTaskSchema = z.object({
  id: z.string().uuid(),
  position: z.number(),
  plannedDate: dateString.nullable().optional(),
  status: statusEnum.optional(),
});

export async function moveTask(
  input: z.input<typeof moveTaskSchema>,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = moveTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid move" };
  }
  const p = parsed.data;
  const patch: TaskUpdate = { position: p.position };
  if (p.plannedDate !== undefined) patch.planned_date = p.plannedDate;
  if (p.status !== undefined) patch.status = p.status;

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", p.id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}

export async function moveTaskToBacklog(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const position = await nextPosition(supabase, user.id, null);
  const { error } = await supabase
    .from("tasks")
    .update({ planned_date: null, status: "backlog", position })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}

export async function scheduleTask(
  id: string,
  date: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const position = await nextPosition(supabase, user.id, date);
  const { error } = await supabase
    .from("tasks")
    .update({ planned_date: date, status: "planned", position })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}
