"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { TaskWithChannel } from "@/lib/types";

const querySchema = z.string().trim().min(1).max(200);

/** Lightweight title search powering the command palette. */
export async function searchTasks(query: string): Promise<TaskWithChannel[]> {
  await requireUser();
  const parsed = querySchema.safeParse(query);
  if (!parsed.success) return [];

  // Escape PostgREST pattern metacharacters before interpolating.
  const safe = parsed.data.replace(/[%_,()]/g, " ").trim();
  if (!safe) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*, channel:channels(*)")
    .ilike("title", `%${safe}%`)
    .order("updated_at", { ascending: false })
    .limit(6);
  return (data as TaskWithChannel[] | null) ?? [];
}
