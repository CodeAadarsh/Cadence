import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { Bookmark } from "@/lib/types";

/**
 * Bookmarks for a channel. Passing `null` returns the workspace-wide ones
 * (channel_id is null), mirroring Slack's "saved in this channel" header.
 */
export async function getBookmarks(
  channelId?: string | null,
): Promise<Bookmark[]> {
  await requireUser();
  const supabase = await createClient();
  let query = supabase.from("bookmarks").select("*");
  if (channelId === undefined) {
    // all bookmarks
  } else if (channelId === null) {
    query = query.is("channel_id", null);
  } else {
    query = query.eq("channel_id", channelId);
  }
  const { data } = await query.order("position", { ascending: true });
  return (data as Bookmark[] | null) ?? [];
}
