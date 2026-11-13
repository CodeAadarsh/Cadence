"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import {
  Bookmark,
  BookmarkMinus,
  CalendarPlus,
  GripVertical,
  Inbox,
  MoreHorizontal,
  Play,
  Square,
  Sun,
  Trash2,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TaskWithChannel } from "@/lib/types";

import { ChannelTag, EstimateTag, PriorityFlag } from "./task-meta";

export function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onMoveToBacklog,
  onScheduleToday,
  onScheduleTomorrow,
  onOpen,
  isTiming,
  onToggleTimer,
  onToggleSaved,
}: {
  task: TaskWithChannel;
  onToggleComplete: (task: TaskWithChannel, done: boolean) => void;
  onDelete: (id: string) => void;
  onMoveToBacklog?: (id: string) => void;
  onScheduleToday?: (id: string) => void;
  onScheduleTomorrow?: (id: string) => void;
  onOpen?: (task: TaskWithChannel) => void;
  isTiming?: boolean;
  onToggleTimer?: (task: TaskWithChannel) => void;
  onToggleSaved?: (task: TaskWithChannel, saved: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const done = task.status === "done";
  const saved = Boolean(task.saved_at);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative list-none",
        isDragging && "z-10",
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-card px-2.5 py-2.5 shadow-sm transition-colors",
          "hover:border-border hover:shadow-md",
          isDragging && "border-primary/40 shadow-lg",
          done && "bg-muted/40",
        )}
      >
        <button
          type="button"
          aria-label="Drag to reorder"
          className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/40 opacity-0 transition-opacity hover:text-muted-foreground group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <Checkbox
          checked={done}
          onCheckedChange={(v) => onToggleComplete(task, Boolean(v))}
          className="size-5 shrink-0 rounded-full"
          aria-label={done ? "Mark incomplete" : "Mark complete"}
        />

        <div
          className={cn(
            "min-w-0 flex-1",
            onOpen && "cursor-pointer",
          )}
          onClick={onOpen ? () => onOpen(task) : undefined}
        >
          <p
            className={cn(
              "truncate text-sm font-medium transition-colors",
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
          </div>
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-0.5 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
            saved ? "opacity-100" : "opacity-0",
          )}
        >
          {onToggleSaved && (
            <button
              type="button"
              aria-label={saved ? "Remove from saved" : "Save for later"}
              aria-pressed={saved}
              onClick={() => onToggleSaved(task, !saved)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                saved
                  ? "text-amber-500 hover:bg-amber-500/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Bookmark
                className={cn("size-3.5", saved && "fill-current")}
              />
            </button>
          )}

          {onToggleTimer && !done && (
            <button
              type="button"
              aria-label={isTiming ? "Stop timer" : "Start timer"}
              onClick={() => onToggleTimer(task)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                isTiming
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isTiming ? (
                <Square className="size-3.5 fill-current" />
              ) : (
                <Play className="size-3.5" />
              )}
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Task actions"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onToggleSaved && (
                <>
                  <DropdownMenuItem
                    onClick={() => onToggleSaved(task, !saved)}
                  >
                    {saved ? (
                      <BookmarkMinus className="size-4" />
                    ) : (
                      <Bookmark className="size-4" />
                    )}
                    {saved ? "Remove from saved" : "Save for later"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {onScheduleToday && (
                <DropdownMenuItem onClick={() => onScheduleToday(task.id)}>
                  <Sun className="size-4" />
                  Schedule for today
                </DropdownMenuItem>
              )}
              {onScheduleTomorrow && (
                <DropdownMenuItem onClick={() => onScheduleTomorrow(task.id)}>
                  <CalendarPlus className="size-4" />
                  Schedule for tomorrow
                </DropdownMenuItem>
              )}
              {(onScheduleToday || onScheduleTomorrow) && <DropdownMenuSeparator />}
              {onMoveToBacklog && task.planned_date && (
                <DropdownMenuItem onClick={() => onMoveToBacklog(task.id)}>
                  <Inbox className="size-4" />
                  Move to backlog
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isTiming && (
          <span className="absolute -left-px top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" />
        )}
      </motion.div>
    </li>
  );
}
