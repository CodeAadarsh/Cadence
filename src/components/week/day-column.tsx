"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { formatMinutes } from "@/lib/format";
import type { TaskWithChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CompactAdd } from "./compact-add";
import { WeekTaskCard } from "./week-task-card";

export function DayColumn({
  dayKey,
  weekday,
  dayNum,
  isToday,
  tasks,
  onToggle,
  onAdd,
}: {
  dayKey: string;
  weekday: string;
  dayNum: string;
  isToday: boolean;
  tasks: TaskWithChannel[];
  onToggle: (task: TaskWithChannel, done: boolean) => void;
  onAdd: (dayKey: string, title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });
  const total = tasks.reduce((s, t) => s + t.estimated_minutes, 0);
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-xl border bg-muted/20 transition-colors",
        isToday && "border-primary/40 bg-primary/[0.03]",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-center justify-between border-b px-2.5 py-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              isToday ? "text-primary" : "text-muted-foreground",
            )}
          >
            {weekday}
          </span>
          <span className="text-sm font-semibold">{dayNum}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {doneCount}/{tasks.length} · {formatMinutes(total)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="scrollbar-thin flex min-h-28 flex-1 flex-col gap-1.5 overflow-y-auto p-1.5"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <WeekTaskCard key={task.id} task={task} onToggle={onToggle} />
          ))}
        </SortableContext>
      </div>

      <div className="border-t p-1">
        <CompactAdd onAdd={(title) => onAdd(dayKey, title)} />
      </div>
    </div>
  );
}
