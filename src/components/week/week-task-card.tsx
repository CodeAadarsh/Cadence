"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Checkbox } from "@/components/ui/checkbox";
import { formatMinutesCompact } from "@/lib/format";
import type { TaskWithChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WeekCardView({
  task,
  onToggle,
  dragging,
  overlay,
}: {
  task: TaskWithChannel;
  onToggle?: (task: TaskWithChannel, done: boolean) => void;
  dragging?: boolean;
  overlay?: boolean;
}) {
  const done = task.status === "done";
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-2 shadow-sm transition-colors",
        dragging && "opacity-40",
        overlay && "rotate-2 cursor-grabbing shadow-lg",
        done && "bg-muted/40",
      )}
    >
      <div className="flex items-start gap-1.5">
        <Checkbox
          checked={done}
          onPointerDown={(e) => e.stopPropagation()}
          onCheckedChange={(v) => onToggle?.(task, Boolean(v))}
          className="mt-0.5 size-4 shrink-0 rounded-full"
          aria-label={done ? "Mark incomplete" : "Mark complete"}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "line-clamp-2 text-xs font-medium leading-snug",
              done && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            {task.channel && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: task.channel.color }}
              />
            )}
            {task.estimated_minutes > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {formatMinutesCompact(task.estimated_minutes)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeekTaskCard({
  task,
  onToggle,
}: {
  task: TaskWithChannel;
  onToggle?: (task: TaskWithChannel, done: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <WeekCardView task={task} onToggle={onToggle} dragging={isDragging} />
    </div>
  );
}
