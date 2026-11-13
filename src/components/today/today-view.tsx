"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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
import { AnimatePresence } from "motion/react";
import { Check, ChevronLeft, ChevronRight, ListChecks, Moon } from "lucide-react";

import { AddTask } from "@/components/tasks/add-task";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { useTaskList } from "@/components/tasks/use-task-list";
import { ShutdownDialog } from "@/components/today/shutdown-dialog";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/format";
import type { Channel, TaskWithChannel } from "@/lib/types";

type Props = {
  dateKey: string;
  isToday: boolean;
  isPast: boolean;
  weekdayLabel: string;
  dateLabel: string;
  greeting: string;
  prevKey: string;
  nextKey: string;
  todayKey: string;
  tomorrowKey: string;
  nextDayKey: string;
  tasks: TaskWithChannel[];
  channels: Channel[];
  dayNotes: string | null;
  shutdownCompleted: boolean;
};

export function TodayView({
  dateKey,
  isToday,
  isPast,
  weekdayLabel,
  dateLabel,
  greeting,
  prevKey,
  nextKey,
  todayKey,
  tomorrowKey,
  nextDayKey,
  tasks: initialTasks,
  channels,
  dayNotes,
  shutdownCompleted,
}: Props) {
  const { tasks, add, toggle, remove, reorder, moveToBacklog, schedule, toggleSaved } =
    useTaskList(initialTasks, { plannedDate: dateKey, channels });
  const [selected, setSelected] = useState<TaskWithChannel | null>(null);
  const [shutdownOpen, setShutdownOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const totalEstimate = tasks.reduce((s, t) => s + t.estimated_minutes, 0);
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {weekdayLabel}
            </h1>
            {isToday && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Today
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {greeting} · {dateLabel}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Previous day">
            <Link href={`/today?date=${prevKey}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          {!isToday && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/today?date=${todayKey}`}>Today</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" aria-label="Next day">
            <Link href={`/today?date=${nextKey}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          {(isToday || isPast) && tasks.length > 0 && (
            <Button
              variant={shutdownCompleted ? "ghost" : "outline"}
              size="sm"
              className="ml-1"
              onClick={() => setShutdownOpen(true)}
            >
              {shutdownCompleted ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Day closed
                </>
              ) : (
                <>
                  <Moon className="size-3.5" />
                  Shut down
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {shutdownCompleted && dayNotes && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Moon className="size-3.5" />
            Shutdown note
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {dayNotes}
          </p>
        </motion.div>
      )}

      <div className="mt-5 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {completedCount} of {tasks.length} done
          </span>
          <span className="text-muted-foreground">
            {formatMinutes(totalEstimate)} planned
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      <div className="mt-6">
        <AddTask channels={channels} onAdd={add} />
      </div>

      <div className="mt-3">
        {tasks.length === 0 ? (
          <EmptyState isToday={isToday} />
        ) : (
          <DndContext
            id="today-board"
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
                      onMoveToBacklog={moveToBacklog}
                      onToggleSaved={toggleSaved}
                      onScheduleTomorrow={
                        isToday
                          ? (id) => schedule(id, tomorrowKey, "tomorrow")
                          : undefined
                      }
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

      <ShutdownDialog
        open={shutdownOpen}
        onOpenChange={setShutdownOpen}
        dateKey={dateKey}
        tomorrowKey={nextDayKey}
        dateLabel={`${weekdayLabel}, ${dateLabel}`}
        tasks={tasks}
        initialNotes={dayNotes}
      />
    </div>
  );
}

function EmptyState({ isToday }: { isToday: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <ListChecks className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-medium">
        {isToday ? "Plan your day" : "Nothing planned"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Add a task above, or pull one in from your backlog to get started.
      </p>
    </motion.div>
  );
}
