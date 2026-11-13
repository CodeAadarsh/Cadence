"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Inbox, X } from "lucide-react";

import { AddTask } from "@/components/tasks/add-task";
import { BookmarkBar } from "@/components/bookmarks/bookmark-bar";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { useTaskList } from "@/components/tasks/use-task-list";
import { formatMinutes } from "@/lib/format";
import type { Bookmark, Channel, TaskWithChannel } from "@/lib/types";

type Props = {
  tasks: TaskWithChannel[];
  channels: Channel[];
  todayKey: string;
  tomorrowKey: string;
  activeChannel: Channel | null;
  bookmarks: Bookmark[];
};

export function BacklogView({
  tasks: initialTasks,
  channels,
  todayKey,
  tomorrowKey,
  activeChannel,
  bookmarks,
}: Props) {
  const { tasks, add, toggle, remove, reorder, schedule, toggleSaved } =
    useTaskList(initialTasks, { plannedDate: null, channels });
  const [selected, setSelected] = useState<TaskWithChannel | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const totalEstimate = tasks.reduce((s, t) => s + t.estimated_minutes, 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Backlog</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} ·{" "}
            {formatMinutes(totalEstimate)}
          </p>
        </div>
        {activeChannel && (
          <Link
            href="/backlog"
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm transition-colors hover:bg-muted"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: activeChannel.color }}
            />
            {activeChannel.name}
            <X className="size-3.5 text-muted-foreground" />
          </Link>
        )}
      </div>

      <div className="mt-4">
        <BookmarkBar bookmarks={bookmarks} channel={activeChannel} />
      </div>

      <div className="mt-5">
        <AddTask
          channels={channels}
          onAdd={add}
          placeholder="Add to backlog…"
          defaultChannelId={activeChannel?.id ?? null}
        />
      </div>

      <div className="mt-3">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">Backlog is clear</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Capture ideas and future work here, then schedule them when
              you&apos;re ready.
            </p>
          </motion.div>
        ) : (
          <DndContext
            id="backlog-board"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={reorder}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <motion.ul layout className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onOpen={setSelected}
                      onToggleComplete={toggle}
                      onDelete={remove}
                      onScheduleToday={(id) => schedule(id, todayKey, "today")}
                      onScheduleTomorrow={(id) =>
                        schedule(id, tomorrowKey, "tomorrow")
                      }
                      onToggleSaved={toggleSaved}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <TaskDetailSheet
        task={selected}
        channels={channels}
        todayKey={todayKey}
        tomorrowKey={tomorrowKey}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
