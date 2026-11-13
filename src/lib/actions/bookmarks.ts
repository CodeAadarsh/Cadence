"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { ActionResult } from "@/lib/actions/tasks";
import type { Database } from "@/lib/supabase/database.types";
import type { Bookmark } from "@/lib/types";

type BookmarkUpdate = Database["public"]["Tables"]["bookmarks"]["Update"];

function revalidateBookmarks() {
  revalidatePath("/backlog");
  revalidatePath("/saved");
}

/** Accepts bare domains too — "vercel.com" becomes "https://vercel.com". */
const urlField = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .refine((v) => !v || z.string().url().safeParse(v).success, "Invalid URL")
  .optional()
  .nullable();

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  url: urlField,
  note: z.string().trim().max(2000).optional().nullable(),
  emoji: z.string().trim().max(8).optional().nullable(),
  channelId: z.string().uuid().nullable().optional(),
});

export async function createBookmark(
  input: z.input<typeof createSchema>,
): Promise<ActionResult<Bookmark>> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid bookmark" };
  }
  const p = parsed.data;
  const supabase = await createClient();

  const { data: tail } = await supabase
    .from("bookmarks")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);
  const position = (tail?.length ? Number(tail[0].position) : 0) + 1000;

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: user.id,
      channel_id: p.channelId ?? null,
      title: p.title,
      url: p.url || null,
      note: p.note || null,
      emoji: p.emoji || null,
      position,
    })
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateBookmarks();
  return { ok: true, data: data as Bookmark };
}

const updateSchema = createSchema.partial().extend({ id: z.string().uuid() });

export async function updateBookmark(
  input: z.input<typeof updateSchema>,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid update" };
  }
  const { id, channelId, ...rest } = parsed.data;
  const patch: BookmarkUpdate = {};
  if (rest.title !== undefined) patch.title = rest.title;
  if (rest.url !== undefined) patch.url = rest.url || null;
  if (rest.note !== undefined) patch.note = rest.note || null;
  if (rest.emoji !== undefined) patch.emoji = rest.emoji || null;
  if (channelId !== undefined) patch.channel_id = channelId;
  if (Object.keys(patch).length === 0) return { ok: true, data: null };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookmarks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidateBookmarks();
  return { ok: true, data: null };
}

export async function deleteBookmark(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid bookmark" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidateBookmarks();
  return { ok: true, data: null };
}
