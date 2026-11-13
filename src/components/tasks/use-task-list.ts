"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

import {
  createTask,
  deleteTask,
  moveTask,
  moveTaskToBacklog,
  scheduleTask,
  toggleTaskComplete,
} from "@/lib/actions/tasks";
import { setTaskSaved } from "@/lib/actions/saved";
import type { Channel, TaskWithChannel } from "@/lib/types";

import { positionBetween } from "./ordering";
import type { NewTaskInput } from "./add-task";

type Options = {
  plannedDate: string | null;
  channels: Channel[];
};

export function useTaskList(
  initialTasks: TaskWithChannel[],
  { plannedDate, channels }: Options,
) {
  const router = useRouter();
  const [tasks, setTasks] = React.useState(initialTasks);
  const [, startTransition] = React.useTransition();

  const signature = React.useMemo(
    () =>
      initialTasks
        .map(
          (t) =>
            `${t.id}:${t.status}:${t.position}:${t.estimated_minutes}:${t.actual_minutes}:${t.channel_id}:${t.priority}:${t.title}`,
        )
        .join("|"),
    [initialTasks],
  );

  // Re-sync from the server during render (not in an effect) so a refreshed
  // list never renders one frame of stale optimistic state.
  const [syncedSignature, setSyncedSignature] = React.useState(signature);
  if (signature !== syncedSignature) {
    setSyncedSignature(signature);
    setTasks(initialTasks);
  }

  function add(input: NewTaskInput) {
    const tempId = `temp-${crypto.randomUUID()}`;
    const channel = channels.find((c) => c.id === input.channelId) ?? null;
    const last = tasks.at(-1);
    const optimistic: TaskWithChannel = {
      id: tempId,
      user_id: "",
      channel_id: input.channelId,
      title: input.title,
      notes: null,
      status: plannedDate ? "planned" : "backlog",
      priority: "none",
      planned_date: plannedDate,
      position: (last?.position ?? 0) + 1000,
      estimated_minutes: input.estimatedMinutes,
      actual_minutes: 0,
      saved_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      channel,
    };
    setTasks((prev) => [...prev, optimistic]);
    startTransition(async () => {
      const res = await createTask({
        title: input.title,
        plannedDate,
        channelId: input.channelId,
        estimatedMinutes: input.estimatedMinutes,
        status: plannedDate ? "planned" : "backlog",
      });
      if (!res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        toast.error(res.error);
      } else {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? res.data : t)));
      }
    });
  }

  function toggle(task: TaskWithChannel, done: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: done ? "done" : plannedDate ? "planned" : "backlog",
              completed_at: done ? new Date().toISOString() : null,
            }
          : t,
      ),
    );
    startTransition(async () => {
      const res = await toggleTaskComplete(task.id, done);
      if (!res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        toast.error(res.error);
      }
    });
  }

  function remove(id: string) {
    const index = tasks.findIndex((t) => t.id === id);
    const removed = tasks[index];
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      const res = await deleteTask(id);
      if (!res.ok && removed) {
        setTasks((prev) => {
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, removed);
          return next;
        });
        toast.error(res.error);
      }
    });
  }

  function reorder(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(tasks, oldIndex, newIndex);
    const position = positionBetween(
      next[newIndex - 1]?.position,
      next[newIndex + 1]?.position,
    );
    next[newIndex] = { ...next[newIndex], position };
    setTasks(next);

    startTransition(async () => {
      const res = await moveTask({ id: String(active.id), position });
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      }
    });
  }

  function moveToBacklog(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      const res = await moveTaskToBacklog(id);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      } else {
        toast.success("Moved to backlog");
      }
    });
  }

  function schedule(id: string, date: string, label?: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      const res = await scheduleTask(id, date);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      } else {
        toast.success(label ? `Scheduled for ${label}` : "Scheduled");
      }
    });
  }

  function toggleSaved(task: TaskWithChannel, saved: boolean) {
    const savedAt = saved ? new Date().toISOString() : null;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, saved_at: savedAt } : t)),
    );
    startTransition(async () => {
      const res = await setTaskSaved(task.id, saved);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      } else {
        toast.success(saved ? "Saved for later" : "Removed from saved");
      }
    });
  }

  return {
    tasks,
    add,
    toggle,
    remove,
    reorder,
    moveToBacklog,
    schedule,
    toggleSaved,
  };
}
