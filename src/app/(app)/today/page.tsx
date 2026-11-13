import type { Metadata } from "next";

import { TodayView } from "@/components/today/today-view";
import { getChannels } from "@/lib/data/channels";
import { getTasksForDate } from "@/lib/data/tasks";
import { getDailyPlan } from "@/lib/data/daily-plan";
import { addDays, fromDateKey, toDateKey } from "@/lib/format";

export const metadata: Metadata = { title: "Today" };

function timeGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const now = new Date();
  const todayKey = toDateKey(now);
  const tomorrowKey = toDateKey(addDays(now, 1));
  const valid = Boolean(dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam));
  const dateKey = valid ? (dateParam as string) : todayKey;
  const date = fromDateKey(dateKey);
  const isToday = dateKey === todayKey;

  const [tasks, channels, plan] = await Promise.all([
    getTasksForDate(dateKey),
    getChannels(),
    getDailyPlan(dateKey),
  ]);

  const weekdayLabel = date.toLocaleDateString(undefined, { weekday: "long" });
  const dateLabel = date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  const diff = Math.round(
    (date.getTime() - fromDateKey(todayKey).getTime()) / 86_400_000,
  );
  let greeting: string;
  if (isToday) greeting = timeGreeting(now.getHours());
  else if (diff === 1) greeting = "Tomorrow";
  else if (diff === -1) greeting = "Yesterday";
  else if (diff > 1) greeting = "Upcoming";
  else greeting = "Earlier";

  return (
    <TodayView
      dateKey={dateKey}
      isToday={isToday}
      isPast={diff < 0}
      weekdayLabel={weekdayLabel}
      dateLabel={dateLabel}
      greeting={greeting}
      prevKey={toDateKey(addDays(date, -1))}
      nextKey={toDateKey(addDays(date, 1))}
      todayKey={todayKey}
      tomorrowKey={tomorrowKey}
      nextDayKey={toDateKey(addDays(date, 1))}
      tasks={tasks}
      channels={channels}
      dayNotes={plan?.notes ?? null}
      shutdownCompleted={plan?.shutdown_completed ?? false}
    />
  );
}
