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

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();
  if (profile?.onboarded) return { seeded: false };

  // Flip the flag first so concurrent loads don't double-seed.
  await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);

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
