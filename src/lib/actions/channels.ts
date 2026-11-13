"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { Database } from "@/lib/supabase/database.types";
import type { Channel } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/tasks";

type DB = SupabaseClient<Database>;
type ChannelUpdate = Database["public"]["Tables"]["channels"]["Update"];

function revalidateApp() {
  revalidatePath("/today");
  revalidatePath("/week");
  revalidatePath("/backlog");
  revalidatePath("/analytics");
  revalidatePath("/settings");
}

async function nextChannelPosition(supabase: DB, userId: string) {
  const { data } = await supabase
    .from("channels")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1);
  const max = data && data.length ? Number(data[0].position) : 0;
  return max + 1000;
}

const createChannelSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Invalid color")
    .optional(),
  emoji: z.string().max(8).nullable().optional(),
});

export async function createChannel(
  input: z.input<typeof createChannelSchema>,
): Promise<ActionResult<Channel>> {
  const user = await requireUser();
  const parsed = createChannelSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid channel" };
  }
  const supabase = await createClient();
  const position = await nextChannelPosition(supabase, user.id);
  const { data, error } = await supabase
    .from("channels")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      color: parsed.data.color ?? "#6366f1",
      emoji: parsed.data.emoji ?? null,
      position,
    })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data };
}

const updateChannelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(60).optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/)
    .optional(),
  emoji: z.string().max(8).nullable().optional(),
  archived: z.boolean().optional(),
  position: z.number().optional(),
});

export async function updateChannel(
  input: z.input<typeof updateChannelSchema>,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateChannelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid update" };
  const { id, ...rest } = parsed.data;
  const patch: ChannelUpdate = {};
  if (rest.name !== undefined) patch.name = rest.name;
  if (rest.color !== undefined) patch.color = rest.color;
  if (rest.emoji !== undefined) patch.emoji = rest.emoji;
  if (rest.archived !== undefined) patch.archived = rest.archived;
  if (rest.position !== undefined) patch.position = rest.position;
  if (Object.keys(patch).length === 0) return { ok: true, data: null };

  const supabase = await createClient();
  const { error } = await supabase
    .from("channels")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}

export async function deleteChannel(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("channels")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidateApp();
  return { ok: true, data: null };
}
