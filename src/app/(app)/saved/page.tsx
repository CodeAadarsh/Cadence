import type { Metadata } from "next";

import { SavedView } from "@/components/saved/saved-view";
import { getChannels } from "@/lib/data/channels";
import { getSavedTasks } from "@/lib/data/saved";
import { addDays, toDateKey } from "@/lib/format";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const now = new Date();
  const [tasks, channels] = await Promise.all([getSavedTasks(), getChannels()]);

  return (
    <SavedView
      tasks={tasks}
      channels={channels}
      todayKey={toDateKey(now)}
      tomorrowKey={toDateKey(addDays(now, 1))}
    />
  );
}
