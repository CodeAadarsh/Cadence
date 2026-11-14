"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import { toDateKey } from "@/lib/format";
import type { TaskPriority } from "@/lib/types";

type SeedOpts = { date?: string; est?: number; priority?: TaskPriority };

export async function onboardIfNeeded(): Promise<{ seeded: boolean }> {
  const user = await requireUser();
  const supabase = await createClient();

  // The profile row is normally created by the on_auth_user_created trigger,
  // but an account can predate the trigger. Without a row, the "onboarded"
  // guard below would have nothing to update and would re-seed on every load,
  // so make sure the row exists first.
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ?? null,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (upsertError) return { seeded: false };

  // Never seed on top of existing data, whatever the flag says.
  const { count: channelCount } = await supabase
    .from("channels")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const { count: taskCount } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((channelCount ?? 0) > 0 || (taskCount ?? 0) > 0) {
    await supabase
      .from("profiles")
      .update({ onboarded: true })
      .eq("id", user.id);
    return { seeded: false };
  }

  // Atomically claim the right to seed: this only matches while onboarded is
  // still false, so concurrent requests can't both win.
  const { data: claimed } = await supabase
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", user.id)
    .eq("onboarded", false)
    .select("id");
  if (!claimed || claimed.length === 0) return { seeded: false };

  const channels = [
    { name: "Work", color: "#6366f1", emoji: "💼", position: 1000 },
    { name: "Personal", color: "#10b981", emoji: "🌱", position: 2000 },
    { name: "Deep Work", color: "#8b5cf6", emoji: "🧠", position: 3000 },
  ].map((c) => ({ ...c, user_id: user.id }));
  const { data: ch } = await supabase
    .from("channels")
    .insert(channels)
    .select("id, name");
  const byName = Object.fromEntries((ch ?? []).map((c) => [c.name, c.id]));

  const today = toDateKey(new Date());
  let pos = 0;
  const P = () => (pos += 1000);
  const t = (title: string, channel: string, opts: SeedOpts = {}) => ({
    user_id: user.id,
    title,
    channel_id: byName[channel] ?? null,
    planned_date: opts.date ?? null,
    status: (opts.date ? "planned" : "backlog") as "planned" | "backlog",
    estimated_minutes: opts.est ?? 0,
    priority: opts.priority ?? ("none" as TaskPriority),
    position: P(),
  });

  const tasks = [
    t("Welcome to Cadence 👋 — tap me to open details", "Personal", { date: today, est: 5 }),
    t("Plan your top 3 priorities for today", "Work", { date: today, est: 10, priority: "high" }),
    t("Start the focus timer on a task", "Deep Work", { date: today, est: 25 }),
    t("Drag the handle to reorder your day", "Work", { date: today, est: 5 }),
    t("Review your week in the Week view", "Personal", { est: 10 }),
    t("Capture a someday idea in your backlog", "Deep Work", { est: 15 }),
  ];
  await supabase.from("tasks").insert(tasks);

  revalidatePath("/today");
  revalidatePath("/week");
  revalidatePath("/backlog");
  revalidatePath("/analytics");
  return { seeded: true };
}
