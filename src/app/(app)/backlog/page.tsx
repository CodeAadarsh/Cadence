import type { Metadata } from "next";

import { BacklogView } from "@/components/backlog/backlog-view";
import { getBookmarks } from "@/lib/data/bookmarks";
import { getChannels } from "@/lib/data/channels";
import { getBacklogTasks } from "@/lib/data/tasks";
import { addDays, toDateKey } from "@/lib/format";

export const metadata: Metadata = { title: "Backlog" };

export default async function BacklogPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { channel } = await searchParams;
  const [all, channels] = await Promise.all([
    getBacklogTasks(),
    getChannels(),
  ]);

  const activeChannel = channel
    ? (channels.find((c) => c.id === channel) ?? null)
    : null;
  const tasks = activeChannel
    ? all.filter((t) => t.channel_id === activeChannel.id)
    : all;
  const bookmarks = await getBookmarks(activeChannel ? activeChannel.id : null);

  const now = new Date();
  return (
    <BacklogView
      tasks={tasks}
      channels={channels}
      todayKey={toDateKey(now)}
      tomorrowKey={toDateKey(addDays(now, 1))}
      activeChannel={activeChannel}
      bookmarks={bookmarks}
    />
  );
}
