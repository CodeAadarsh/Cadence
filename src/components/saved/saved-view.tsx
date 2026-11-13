"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Bookmark,
  BookmarkMinus,
  CalendarPlus,
  Check,
  CircleDashed,
  Clock,
  Sun,
} from "lucide-react";

import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { ChannelTag, EstimateTag, PriorityFlag } from "@/components/tasks/task-meta";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { clearSavedTasks, setTaskSaved } from "@/lib/actions/saved";
import { scheduleTask, toggleTaskComplete } from "@/lib/actions/tasks";
import type { Channel, TaskWithChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  tasks: TaskWithChannel[];
  channels: Channel[];
  todayKey: string;
  tomorrowKey: string;
};

type Bucket = "in_progress" | "later" | "completed";

const BUCKETS: { key: Bucket; label: string; icon: typeof Clock }[] = [
  { key: "in_progress", label: "In progress", icon: Clock },
  { key: "later", label: "Later", icon: CircleDashed },
  { key: "completed", label: "Completed", icon: Check },
];

function bucketOf(task: TaskWithChannel): Bucket {
  if (task.status === "done") return "completed";
  if (task.status === "in_progress" || task.planned_date) return "in_progress";
  return "later";
}

export function SavedView({ tasks: initial, channels, todayKey, tomorrowKey }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = React.useState(initial);
  const [selected, setSelected] = React.useState<TaskWithChannel | null>(null);
  const [, startAction] = React.useTransition();

  const signature = React.useMemo(
    () => initial.map((t) => `${t.id}:${t.status}:${t.planned_date}:${t.title}`).join("|"),
    [initial],
  );
  const [synced, setSynced] = React.useState(signature);
  if (signature !== synced) {
    setSynced(signature);
    setTasks(initial);
  }

  function unsave(task: TaskWithChannel) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    startAction(async () => {
      const res = await setTaskSaved(task.id, false);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      } else {
        toast.success("Removed from saved");
      }
    });
  }

  function toggleDone(task: TaskWithChannel, done: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: done ? "done" : "planned" } : t,
      ),
    );
    startAction(async () => {
      const res = await toggleTaskComplete(task.id, done);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      }
    });
  }

  function schedule(task: TaskWithChannel, date: string, label: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, planned_date: date, status: "planned" } : t,
      ),
    );
    startAction(async () => {
      const res = await scheduleTask(task.id, date);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      } else {
        toast.success(`Scheduled for ${label}`);
      }
    });
  }

  function clearAll() {
    const previous = tasks;
    setTasks([]);
    startAction(async () => {
      const res = await clearSavedTasks();
      if (!res.ok) {
        toast.error(res.error);
        setTasks(previous);
      } else {
        toast.success(`Cleared ${res.data.cleared} saved item${res.data.cleared === 1 ? "" : "s"}`);
        router.refresh();
      }
    });
  }

  const grouped = React.useMemo(() => {
    const out: Record<Bucket, TaskWithChannel[]> = {
      in_progress: [],
      later: [],
      completed: [],
    };
    for (const t of tasks) out[bucketOf(t)].push(t);
    return out;
  }, [tasks]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Bookmark className="size-5 text-amber-500" />
            Saved
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tasks.length === 0
              ? "Nothing saved yet"
              : `${tasks.length} item${tasks.length === 1 ? "" : "s"} saved for later`}
          </p>
        </div>
        {tasks.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <BookmarkMinus className="size-3.5" />
            Clear all
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-7 flex flex-col gap-7">
          {BUCKETS.map(({ key, label, icon: Icon }) => {
            const items = grouped[key];
            if (!items.length) return null;
            return (
              <section key={key}>
                <h2 className="flex items-center gap-1.5 px-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Icon className="size-3.5" />
                  {label}
                  <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] tabular-nums">
                    {items.length}
                  </span>
                </h2>
                <motion.ul layout className="mt-2.5 flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {items.map((task) => (
                      <SavedRow
                        key={task.id}
                        task={task}
                        onOpen={setSelected}
                        onUnsave={unsave}
                        onToggleDone={toggleDone}
                        onScheduleToday={
                          task.planned_date === todayKey
                            ? undefined
                            : () => schedule(task, todayKey, "today")
                        }
                        onScheduleTomorrow={() =>
                          schedule(task, tomorrowKey, "tomorrow")
                        }
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </section>
            );
          })}
        </div>
      )}

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

function SavedRow({
  task,
  onOpen,
  onUnsave,
  onToggleDone,
  onScheduleToday,
  onScheduleTomorrow,
}: {
  task: TaskWithChannel;
  onOpen: (task: TaskWithChannel) => void;
  onUnsave: (task: TaskWithChannel) => void;
  onToggleDone: (task: TaskWithChannel, done: boolean) => void;
  onScheduleToday?: () => void;
  onScheduleTomorrow: () => void;
}) {
  const done = task.status === "done";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
      className="group flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-border hover:shadow-md"
    >
      <Checkbox
        checked={done}
        onCheckedChange={(v) => onToggleDone(task, Boolean(v))}
        className="size-5 shrink-0 rounded-full"
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      />

      <button
        type="button"
        onClick={() => onOpen(task)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "truncate text-sm font-medium",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          <ChannelTag channel={task.channel} />
          <EstimateTag
            estimated={task.estimated_minutes}
            actual={task.actual_minutes}
          />
          <PriorityFlag priority={task.priority} />
          {task.planned_date && (
            <span className="text-xs text-muted-foreground">
              {new Date(task.planned_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {onScheduleToday && !done && (
          <button
            type="button"
            aria-label="Schedule for today"
            onClick={onScheduleToday}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Sun className="size-3.5" />
          </button>
        )}
        {!done && (
          <button
            type="button"
            aria-label="Schedule for tomorrow"
            onClick={onScheduleTomorrow}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <CalendarPlus className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          aria-label="Remove from saved"
          onClick={() => onUnsave(task)}
          className="flex size-7 items-center justify-center rounded-md text-amber-500 transition-colors hover:bg-amber-500/10"
        >
          <Bookmark className="size-3.5 fill-current" />
        </button>
      </div>
    </motion.li>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-amber-500/10">
        <Bookmark className="size-5 text-amber-500" />
      </div>
      <p className="mt-3 text-sm font-medium">Nothing saved yet</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Hit the bookmark icon on any task to keep it here — a quick shortlist
        that survives your daily plan.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href="/today">Go to today</Link>
      </Button>
    </motion.div>
  );
}
