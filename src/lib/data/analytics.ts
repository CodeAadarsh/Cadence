import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import { getChannels } from "@/lib/data/channels";
import { addDays, fromDateKey, toDateKey } from "@/lib/format";

export type DayPoint = {
  date: string;
  label: string;
  completed: number;
  focus: number;
  planned: number;
};
export type ChannelSlice = { label: string; value: number; color: string };

export type Analytics = {
  days: DayPoint[];
  channels: ChannelSlice[];
  completedWeek: number;
  focusWeek: number;
  completionRate: number;
  streak: number;
  totalFocus: number;
};

export async function getAnalytics(): Promise<Analytics> {
  await requireUser();
  const supabase = await createClient();
  const today = new Date();
  const startKey = toDateKey(addDays(today, -13));
  const endKey = toDateKey(today);

  const [tasksRes, channels] = await Promise.all([
    supabase
      .from("tasks")
      .select("status, planned_date, estimated_minutes, actual_minutes, channel_id")
      .gte("planned_date", startKey)
      .lte("planned_date", endKey),
    getChannels(),
  ]);

  const rows = tasksRes.data ?? [];
  const channelMap = new Map(channels.map((c) => [c.id, c]));

  const days: DayPoint[] = [];
  const byDate = new Map<string, DayPoint>();
  for (let i = 13; i >= 0; i--) {
    const date = toDateKey(addDays(today, -i));
    const point: DayPoint = {
      date,
      label: fromDateKey(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      completed: 0,
      focus: 0,
      planned: 0,
    };
    days.push(point);
    byDate.set(date, point);
  }

  const channelTotals = new Map<string, number>();
  const focusOf = (t: (typeof rows)[number]) =>
    t.actual_minutes && t.actual_minutes > 0
      ? t.actual_minutes
      : (t.estimated_minutes ?? 0);

  for (const t of rows) {
    const day = t.planned_date ? byDate.get(t.planned_date) : undefined;
    if (day) {
      day.planned += t.estimated_minutes ?? 0;
      if (t.status === "done") {
        day.completed += 1;
        day.focus += focusOf(t);
      }
    }
    if (t.status === "done") {
      const key = t.channel_id ?? "none";
      channelTotals.set(key, (channelTotals.get(key) ?? 0) + focusOf(t));
    }
  }

  const channelSlices: ChannelSlice[] = [];
  for (const [key, value] of channelTotals) {
    if (value <= 0) continue;
    if (key === "none") {
      channelSlices.push({ label: "No channel", value, color: "#94a3b8" });
    } else {
      const c = channelMap.get(key);
      if (c) channelSlices.push({ label: c.name, value, color: c.color });
    }
  }
  channelSlices.sort((a, b) => b.value - a.value);

  const last7 = days.slice(-7);
  const completedWeek = last7.reduce((s, d) => s + d.completed, 0);
  const focusWeek = last7.reduce((s, d) => s + d.focus, 0);
  const totalFocus = days.reduce((s, d) => s + d.focus, 0);

  const last7Keys = new Set(last7.map((d) => d.date));
  let totalScheduled = 0;
  let totalDone = 0;
  for (const t of rows) {
    if (!t.planned_date || !last7Keys.has(t.planned_date)) continue;
    totalScheduled += 1;
    if (t.status === "done") totalDone += 1;
  }
  const completionRate = totalScheduled
    ? Math.round((totalDone / totalScheduled) * 100)
    : 0;

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].completed > 0) streak += 1;
    else break;
  }

  return {
    days,
    channels: channelSlices,
    completedWeek,
    focusWeek,
    completionRate,
    streak,
    totalFocus,
  };
}
