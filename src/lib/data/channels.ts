import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import type { Channel } from "@/lib/types";

export async function getChannels(): Promise<Channel[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select("*")
    .eq("archived", false)
    .order("position", { ascending: true });
  return data ?? [];
}
