"use client";

import * as React from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark,
  CalendarPlus,
  Clock,
  Flag,
  Hash,
  Inbox,
  Pause,
  Play,
  Plus,
  Sun,
  Trash2,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTask, moveTaskToBacklog, scheduleTask, updateTask } from "@/lib/actions/tasks";
import { setTaskSaved } from "@/lib/actions/saved";
import {
  addSubtask,
  deleteSubtask,
  getSubtasks,
  toggleSubtask,
} from "@/lib/actions/subtasks";
import { getTimerState, startTimer, stopTimer } from "@/lib/actions/time";
import { formatMinutes, formatMinutesCompact } from "@/lib/format";
import type {
  Channel,
  Subtask,
  TaskPriority,
  TaskWithChannel,
} from "@/lib/types";
import { PRIORITIES } from "@/lib/types";
import { cn } from "@/lib/utils";

const ESTIMATES = [0, 15, 30, 45, 60, 90, 120, 180];

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
};
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  none: "text-muted-foreground",
  low: "text-sky-500",
  medium: "text-amber-500",
  high: "text-rose-500",
};

function formatClock(total: number) {
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function TaskDetailSheet({
  task,
  channels,
  todayKey,
  tomorrowKey,
  onOpenChange,
}: {
  task: TaskWithChannel | null;
  channels: Channel[];
  todayKey: string;
  tomorrowKey: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [current, setCurrent] = React.useState<TaskWithChannel | null>(task);
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = React.useState("");
  const [, startAction] = React.useTransition();

  const [timer, setTimer] = React.useState({
    running: false,
    startedAt: null as string | null,
    trackedSeconds: 0,
    actualMinutes: 0,
  });
  const [tick, setTick] = React.useState(0);

  // Reset the editor during render when a different task is opened, so the
  // sheet never shows the previous task's title for a frame.
  const [openedId, setOpenedId] = React.useState<string | null>(
    task?.id ?? null,
  );
  if ((task?.id ?? null) !== openedId) {
    setOpenedId(task?.id ?? null);
    setCurrent(task);
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setSubtasks([]);
    setTimer({
      running: false,
      startedAt: null,
      trackedSeconds: 0,
      actualMinutes: 0,
    });
  }

  React.useEffect(() => {
    if (!task) return;
    let active = true;
    void getSubtasks(task.id).then((s) => active && setSubtasks(s));
    void getTimerState(task.id).then((s) => active && setTimer(s));
    return () => {
      active = false;
    };
  }, [task]);

  React.useEffect(() => {
    if (!timer.running) return;
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [timer.running]);

  if (!current) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const taskId = current.id;

  function patch(fields: Parameters<typeof updateTask>[0]) {
    startAction(async () => {
      const res = await updateTask(fields);
      if (!res.ok) toast.error(res.error);
    });
  }

  function setChannel(channelId: string | null) {
    setCurrent((c) =>
      c
        ? { ...c, channel_id: channelId, channel: channels.find((ch) => ch.id === channelId) ?? null }
        : c,
    );
    patch({ id: taskId, channelId });
  }
  function setPriority(priority: TaskPriority) {
    setCurrent((c) => (c ? { ...c, priority } : c));
    patch({ id: taskId, priority });
  }
  function setEstimate(estimatedMinutes: number) {
    setCurrent((c) => (c ? { ...c, estimated_minutes: estimatedMinutes } : c));
    patch({ id: taskId, estimatedMinutes });
  }
  function setDone(done: boolean) {
    setCurrent((c) => (c ? { ...c, status: done ? "done" : "planned" } : c));
    patch({ id: taskId, status: done ? "done" : "planned" });
  }

  function schedule(date: string, label: string) {
    setCurrent((c) => (c ? { ...c, planned_date: date, status: c.status === "done" ? "done" : "planned" } : c));
    startAction(async () => {
      const res = await scheduleTask(taskId, date);
      if (!res.ok) toast.error(res.error);
      else toast.success(`Scheduled for ${label}`);
    });
  }
  function toBacklog() {
    setCurrent((c) => (c ? { ...c, planned_date: null, status: "backlog" } : c));
    startAction(async () => {
      const res = await moveTaskToBacklog(taskId);
      if (!res.ok) toast.error(res.error);
      else toast.success("Moved to backlog");
    });
  }

  function saveTitle() {
    if (!current) return;
    const t = title.trim();
    if (!t || t === current.title) return;
    setCurrent((c) => (c ? { ...c, title: t } : c));
    patch({ id: taskId, title: t });
  }
  function saveNotes() {
    if (!current) return;
    if (notes === (current.notes ?? "")) return;
    setCurrent((c) => (c ? { ...c, notes } : c));
    patch({ id: taskId, notes: notes || null });
  }

  function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault();
    const t = newSubtask.trim();
    if (!t) return;
    setNewSubtask("");
    const temp: Subtask = {
      id: `temp-${crypto.randomUUID()}`,
      task_id: taskId,
      user_id: "",
      title: t,
      done: false,
      position: (subtasks.at(-1)?.position ?? 0) + 1000,
      created_at: new Date().toISOString(),
    };
    setSubtasks((s) => [...s, temp]);
    startAction(async () => {
      const res = await addSubtask(taskId, t);
      if (res.ok) setSubtasks((s) => s.map((x) => (x.id === temp.id ? res.data : x)));
      else {
        setSubtasks((s) => s.filter((x) => x.id !== temp.id));
        toast.error(res.error);
      }
    });
  }
  function handleToggleSubtask(id: string, done: boolean) {
    setSubtasks((s) => s.map((x) => (x.id === id ? { ...x, done } : x)));
    startAction(async () => {
      const res = await toggleSubtask(id, done);
      if (!res.ok) toast.error(res.error);
    });
  }
  function handleDeleteSubtask(id: string) {
    setSubtasks((s) => s.filter((x) => x.id !== id));
    startAction(async () => {
      await deleteSubtask(id);
    });
  }

  function toggleTimer() {
    if (timer.running) {
      const elapsed = timer.startedAt
        ? (Date.now() - new Date(timer.startedAt).getTime()) / 1000
        : 0;
      const newTracked = timer.trackedSeconds + elapsed;
      setTimer((t) => ({ ...t, running: false, startedAt: null, trackedSeconds: newTracked }));
      startAction(async () => {
        const res = await stopTimer(taskId);
        if (res.ok) setTimer((t) => ({ ...t, actualMinutes: res.data.actualMinutes }));
      });
    } else {
      const startedAt = new Date().toISOString();
      setTimer((t) => ({ ...t, running: true, startedAt }));
      setCurrent((c) => (c ? { ...c, status: c.status === "done" ? "done" : "in_progress" } : c));
      startAction(async () => {
        const res = await startTimer(taskId);
        if (!res.ok) toast.error(res.error);
      });
    }
  }

  function handleDelete() {
    onOpenChange(false);
    startAction(async () => {
      const res = await deleteTask(taskId);
      if (!res.ok) toast.error(res.error);
      else toast.success("Task deleted");
    });
  }

  // A running stopwatch has to read the wall clock while rendering; `tick`
  // (bumped once a second) is what actually drives the re-render.
  void tick;
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const liveElapsed =
    timer.trackedSeconds +
    (timer.running && timer.startedAt
      ? (nowMs - new Date(timer.startedAt).getTime()) / 1000
      : 0);

  const done = current.status === "done";
  const saved = Boolean(current.saved_at);

  function toggleSaved() {
    const next = !saved;
    setCurrent((c) =>
      c ? { ...c, saved_at: next ? new Date().toISOString() : null } : c,
    );
    startAction(async () => {
      const res = await setTaskSaved(taskId, next);
      if (!res.ok) toast.error(res.error);
      else toast.success(next ? "Saved for later" : "Removed from saved");
    });
  }
  const doneSubtasks = subtasks.filter((s) => s.done).length;
  const scheduledLabel = current.planned_date
    ? new Date(current.planned_date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Backlog";

  return (
    <Sheet open={Boolean(task)} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md"
      >
        <SheetHeader className="space-y-0 border-b p-4">
          <SheetTitle className="sr-only">Task details</SheetTitle>
          <div className="flex items-start gap-2.5">
            <Checkbox
              checked={done}
              onCheckedChange={(v) => setDone(Boolean(v))}
              className="mt-1 size-5 shrink-0 rounded-full"
            />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className={cn(
                "h-auto border-0 px-0 text-base font-semibold shadow-none focus-visible:ring-0 dark:bg-transparent",
                done && "text-muted-foreground line-through",
              )}
            />
            <button
              type="button"
              aria-label={saved ? "Remove from saved" : "Save for later"}
              aria-pressed={saved}
              onClick={toggleSaved}
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                saved
                  ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Bookmark className={cn("size-4", saved && "fill-current")} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-5 p-4">
          {/* Properties */}
          <div className="grid grid-cols-2 gap-2">
            <Prop label="Channel">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted">
                    {current.channel ? (
                      <>
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: current.channel.color }} />
                        <span className="truncate">{current.channel.name}</span>
                      </>
                    ) : (
                      <>
                        <Hash className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">None</span>
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => setChannel(null)}>
                    <Hash className="size-4 text-muted-foreground" /> No channel
                  </DropdownMenuItem>
                  {channels.map((c) => (
                    <DropdownMenuItem key={c.id} onClick={() => setChannel(c.id)}>
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Prop>

            <Prop label="Priority">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted">
                    <Flag className={cn("size-3.5", PRIORITY_COLOR[current.priority])} />
                    <span className={current.priority === "none" ? "text-muted-foreground" : ""}>
                      {PRIORITY_LABEL[current.priority]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  {PRIORITIES.map((p) => (
                    <DropdownMenuItem key={p} onClick={() => setPriority(p)}>
                      <Flag className={cn("size-4", PRIORITY_COLOR[p])} />
                      {PRIORITY_LABEL[p]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Prop>

            <Prop label="Estimate">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className={current.estimated_minutes ? "" : "text-muted-foreground"}>
                      {current.estimated_minutes ? formatMinutes(current.estimated_minutes) : "None"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  {ESTIMATES.map((m) => (
                    <DropdownMenuItem key={m} onClick={() => setEstimate(m)}>
                      <Clock className="size-4 text-muted-foreground" />
                      {m === 0 ? "No estimate" : formatMinutes(m)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Prop>

            <Prop label="Scheduled">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted">
                    <CalendarPlus className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{scheduledLabel}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44">
                  <DropdownMenuItem onClick={() => schedule(todayKey, "today")}>
                    <Sun className="size-4" /> Today
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => schedule(tomorrowKey, "tomorrow")}>
                    <CalendarPlus className="size-4" /> Tomorrow
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toBacklog}>
                    <Inbox className="size-4" /> Backlog
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Prop>
          </div>

          {/* Timer */}
          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums">
                  {formatClock(liveElapsed)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatMinutesCompact(timer.actualMinutes)} tracked
                  {current.estimated_minutes
                    ? ` · ${formatMinutes(current.estimated_minutes)} est`
                    : ""}
                </p>
              </div>
              <Button
                type="button"
                onClick={toggleTimer}
                variant={timer.running ? "secondary" : "default"}
                className="gap-2"
              >
                {timer.running ? (
                  <>
                    <Pause className="size-4 fill-current" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="size-4 fill-current" /> Start
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Add notes, links, or context…"
              className="min-h-24 resize-none"
            />
          </div>

          <Separator />

          {/* Subtasks */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Subtasks</p>
              {subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {doneSubtasks}/{subtasks.length}
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-1">
              <AnimatePresence initial={false}>
                {subtasks.map((s) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-muted/60"
                  >
                    <Checkbox
                      checked={s.done}
                      onCheckedChange={(v) => handleToggleSubtask(s.id, Boolean(v))}
                      className="size-4 rounded-full"
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        s.done && "text-muted-foreground line-through",
                      )}
                    >
                      {s.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(s.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Delete subtask"
                    >
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <form onSubmit={handleAddSubtask} className="mt-1 flex items-center gap-2 px-1">
              <Plus className="size-4 text-muted-foreground" />
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask…"
                className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
            </form>
          </div>

          <Separator />

          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" /> Delete task
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Prop({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
