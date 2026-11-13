"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  Moon,
  PartyPopper,
  Pin,
  Sparkles,
  Target,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { completeShutdown, type RolloverAction } from "@/lib/actions/shutdown";
import { formatMinutes } from "@/lib/format";
import type { TaskWithChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "review" | "carry" | "reflect" | "done";

const ROLLOVER_OPTIONS: {
  value: RolloverAction;
  label: string;
  icon: typeof CalendarPlus;
}[] = [
  { value: "tomorrow", label: "Tomorrow", icon: CalendarPlus },
  { value: "backlog", label: "Backlog", icon: Inbox },
  { value: "keep", label: "Keep", icon: Pin },
];

const transition = { type: "spring" as const, stiffness: 380, damping: 32 };

export function ShutdownDialog({
  open,
  onOpenChange,
  dateKey,
  tomorrowKey,
  dateLabel,
  tasks,
  initialNotes,
  onCompleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  tomorrowKey: string;
  dateLabel: string;
  tasks: TaskWithChannel[];
  initialNotes: string | null;
  onCompleted?: () => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [notes, setNotes] = React.useState(initialNotes ?? "");
  const [choices, setChoices] = React.useState<Record<string, RolloverAction>>(
    {},
  );
  const [saving, setSaving] = React.useState(false);

  // The ritual reviews the day as it looked when it was opened; completing it
  // mutates the live list, so a snapshot keeps the steps stable.
  const [snapshot, setSnapshot] = React.useState<TaskWithChannel[]>([]);
  const [wasOpen, setWasOpen] = React.useState(false);

  if (open !== wasOpen) {
    setWasOpen(open);
  }
  if (open && !wasOpen) {
    setSnapshot(tasks);
    setIndex(0);
    setDirection(1);
    setNotes(initialNotes ?? "");
    setChoices(
      Object.fromEntries(
        tasks
          .filter((t) => t.status !== "done" && t.status !== "cancelled")
          .map((t) => [t.id, "tomorrow" as RolloverAction]),
      ),
    );
  }

  const done = React.useMemo(
    () => snapshot.filter((t) => t.status === "done"),
    [snapshot],
  );
  const unfinished = React.useMemo(
    () =>
      snapshot.filter((t) => t.status !== "done" && t.status !== "cancelled"),
    [snapshot],
  );

  const steps: Step[] = React.useMemo(
    () =>
      unfinished.length
        ? ["review", "carry", "reflect", "done"]
        : ["review", "reflect", "done"],
    [unfinished.length],
  );

  const step = steps[index] ?? "review";
  const plannedMinutes = snapshot.reduce((s, t) => s + t.estimated_minutes, 0);
  const trackedMinutes = snapshot.reduce(
    (s, t) => s + (t.actual_minutes ?? 0),
    0,
  );
  const completionRate = snapshot.length
    ? Math.round((done.length / snapshot.length) * 100)
    : 0;

  const goNext = () => {
    setDirection(1);
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const goBack = () => {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const setAll = (action: RolloverAction) =>
    setChoices(Object.fromEntries(unfinished.map((t) => [t.id, action])));

  async function finish() {
    setSaving(true);
    const rollovers = unfinished.map((t) => ({
      id: t.id,
      action: choices[t.id] ?? "tomorrow",
    }));
    const res = await completeShutdown({
      date: dateKey,
      nextDate: tomorrowKey,
      notes,
      rollovers,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const moved = res.data.moved;
    toast.success(
      moved ? `Day closed · ${moved} task${moved === 1 ? "" : "s"} carried over` : "Day closed",
    );
    setDirection(1);
    setIndex(steps.length - 1);
    onCompleted?.();
  }

  const movingCount = unfinished.filter(
    (t) => (choices[t.id] ?? "tomorrow") !== "keep",
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={step !== "done"}
      >
        <div className="relative isolate border-b bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-5">
          <DialogHeader className="gap-1">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Moon className="size-4" />
              </span>
              <DialogTitle className="text-base">Shut down the day</DialogTitle>
            </div>
            <DialogDescription className="text-xs">{dateLabel}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-center gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s}
                className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
              >
                <motion.span
                  className="block h-full rounded-full bg-primary"
                  initial={false}
                  animate={{ width: i <= index ? "100%" : "0%" }}
                  transition={transition}
                />
              </span>
            ))}
          </div>
        </div>

        <div className="relative min-h-[18rem]">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={transition}
              className="px-6 py-5"
            >
              {step === "review" && (
                <ReviewStep
                  done={done}
                  totalCount={tasks.length}
                  completionRate={completionRate}
                  plannedMinutes={plannedMinutes}
                  trackedMinutes={trackedMinutes}
                />
              )}

              {step === "carry" && (
                <CarryStep
                  tasks={unfinished}
                  choices={choices}
                  onChange={(id, action) =>
                    setChoices((c) => ({ ...c, [id]: action }))
                  }
                  onSetAll={setAll}
                />
              )}

              {step === "reflect" && (
                <ReflectStep
                  notes={notes}
                  onNotes={setNotes}
                  movingCount={movingCount}
                />
              )}

              {step === "done" && (
                <DoneStep
                  doneCount={done.length}
                  trackedMinutes={trackedMinutes}
                  movingCount={movingCount}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-6 py-3.5">
          {step === "done" ? (
            <Button
              className="ml-auto"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              Done for today
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={index === 0 ? () => onOpenChange(false) : goBack}
                disabled={saving}
              >
                {index === 0 ? "Not yet" : "Back"}
              </Button>
              <Button
                size="lg"
                onClick={step === "reflect" ? finish : goNext}
                disabled={saving}
              >
                {step === "reflect" ? (
                  saving ? (
                    "Closing…"
                  ) : (
                    <>
                      <Check className="size-4" />
                      Complete shutdown
                    </>
                  )
                ) : (
                  <>
                    Continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums leading-none">
        {value}
      </p>
    </div>
  );
}

function ReviewStep({
  done,
  totalCount,
  completionRate,
  plannedMinutes,
  trackedMinutes,
}: {
  done: TaskWithChannel[];
  totalCount: number;
  completionRate: number;
  plannedMinutes: number;
  trackedMinutes: number;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Sparkles className="size-4 text-primary" />
        Here&apos;s what you got done
      </h3>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat
          icon={CheckCircle2}
          label="Completed"
          value={`${done.length}/${totalCount}`}
        />
        <Stat icon={Target} label="Rate" value={`${completionRate}%`} />
        <Stat
          icon={Clock}
          label={trackedMinutes > 0 ? "Focused" : "Planned"}
          value={formatMinutes(trackedMinutes || plannedMinutes)}
        />
      </div>

      <div className="scrollbar-thin mt-4 max-h-44 overflow-y-auto">
        {done.length === 0 ? (
          <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing checked off today — that&apos;s okay. Closing the day still
            counts.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {done.map((task, i) => (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i, ...transition }}
                className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span className="truncate text-muted-foreground line-through">
                  {task.title}
                </span>
                {task.channel && (
                  <span
                    className="ml-auto size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: task.channel.color }}
                  />
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CarryStep({
  tasks,
  choices,
  onChange,
  onSetAll,
}: {
  tasks: TaskWithChannel[];
  choices: Record<string, RolloverAction>;
  onChange: (id: string, action: RolloverAction) => void;
  onSetAll: (action: RolloverAction) => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} left over
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Decide where each one goes so tomorrow starts clean.
          </p>
        </div>
        <Button
          variant="ghost"
          size="xs"
          className="shrink-0"
          onClick={() => onSetAll("tomorrow")}
        >
          All to tomorrow
        </Button>
      </div>

      <div className="scrollbar-thin mt-3 max-h-56 overflow-y-auto pr-0.5">
        <ul className="flex flex-col gap-2">
          {tasks.map((task, i) => {
            const value = choices[task.id] ?? "tomorrow";
            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, ...transition }}
                className="rounded-lg border bg-card px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  {task.channel && (
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: task.channel.color }}
                    />
                  )}
                  <span className="truncate text-sm">{task.title}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
                  {ROLLOVER_OPTIONS.map((opt) => {
                    const active = value === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(task.id, opt.value)}
                        className={cn(
                          "relative flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={`rollover-${task.id}`}
                            className="absolute inset-0 rounded-md bg-background shadow-sm"
                            transition={transition}
                          />
                        )}
                        <Icon className="relative size-3" />
                        <span className="relative">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ReflectStep({
  notes,
  onNotes,
  movingCount,
}: {
  notes: string;
  onNotes: (value: string) => void;
  movingCount: number;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">One note to your future self</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        What went well, what got in the way, what matters tomorrow.
      </p>
      <Textarea
        autoFocus
        value={notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Today I…"
        className="mt-3 min-h-36 resize-none"
      />
      {movingCount > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarPlus className="size-3.5" />
          {movingCount} unfinished task{movingCount === 1 ? "" : "s"} will be
          moved when you finish.
        </p>
      )}
    </div>
  );
}

function DoneStep({
  doneCount,
  trackedMinutes,
  movingCount,
}: {
  doneCount: number;
  trackedMinutes: number;
  movingCount: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <PartyPopper className="size-6" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 text-lg font-semibold"
      >
        Day complete
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="mt-1 max-w-xs text-sm text-muted-foreground"
      >
        {doneCount} task{doneCount === 1 ? "" : "s"} finished
        {trackedMinutes > 0 ? ` · ${formatMinutes(trackedMinutes)} focused` : ""}
        {movingCount > 0
          ? ` · ${movingCount} carried forward`
          : ". Nothing left hanging."}
      </motion.p>
    </div>
  );
}
