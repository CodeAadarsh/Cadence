import type { Metadata } from "next";

import { WeekBoard } from "@/components/week/week-board";
import { getTasksInRange } from "@/lib/data/tasks";
import { addDays, fromDateKey, toDateKey } from "@/lib/format";
import type { TaskWithChannel } from "@/lib/types";

export const metadata: Metadata = { title: "Week" };

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const now = new Date();
  const todayKey = toDateKey(now);

  const valid = Boolean(start && /^\d{4}-\d{2}-\d{2}$/.test(start));
  const weekStart = valid ? startOfWeek(fromDateKey(start as string)) : startOfWeek(now);
  const startKey = toDateKey(weekStart);
  const endDate = addDays(weekStart, 6);
  const endKey = toDateKey(endDate);

  const tasks = await getTasksInRange(startKey, endKey);

  const initial: Record<string, TaskWithChannel[]> = {};
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const key = toDateKey(date);
    initial[key] = [];
    return {
      key,
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      dayNum: String(date.getDate()),
      isToday: key === todayKey,
    };
  });
  for (const task of tasks) {
    if (task.planned_date && initial[task.planned_date]) {
      initial[task.planned_date].push(task);
    }
  }

  const rangeLabel = `${weekStart.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${endDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;

  const thisWeekKey = toDateKey(startOfWeek(now));

  return (
    <WeekBoard
      days={days}
      initial={initial}
      rangeLabel={rangeLabel}
      prevWeekKey={toDateKey(addDays(weekStart, -7))}
      nextWeekKey={toDateKey(addDays(weekStart, 7))}
      thisWeekKey={thisWeekKey}
      isThisWeek={startKey === thisWeekKey}
    />
  );
}
