"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { positionBetween } from "@/components/tasks/ordering";
import { Button } from "@/components/ui/button";
import { createTask, moveTask, toggleTaskComplete } from "@/lib/actions/tasks";
import type { TaskWithChannel } from "@/lib/types";

import { DayColumn } from "./day-column";
import { WeekCardView } from "./week-task-card";

type Day = { key: string; weekday: string; dayNum: string; isToday: boolean };
type Columns = Record<string, TaskWithChannel[]>;

export function WeekBoard({
  days,
  initial,
  rangeLabel,
  prevWeekKey,
  nextWeekKey,
  thisWeekKey,
  isThisWeek,
}: {
  days: Day[];
  initial: Columns;
  rangeLabel: string;
  prevWeekKey: string;
  nextWeekKey: string;
  thisWeekKey: string;
  isThisWeek: boolean;
}) {
  const router = useRouter();
  const [cols, setCols] = React.useState<Columns>(initial);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  const dayKeys = React.useMemo(() => days.map((d) => d.key), [days]);

  const signature = React.useMemo(
    () =>
      Object.entries(initial)
        .map(
          ([k, arr]) =>
            `${k}:${arr.map((t) => `${t.id}@${t.position}:${t.status}:${t.title}`).join(",")}`,
        )
        .join("|"),
    [initial],
  );
  const [syncedSignature, setSyncedSignature] = React.useState(signature);
  if (signature !== syncedSignature) {
    setSyncedSignature(signature);
    setCols(initial);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function findContainer(id: string): string | null {
    if (dayKeys.includes(id)) return id;
    return dayKeys.find((k) => cols[k]?.some((t) => t.id === id)) ?? null;
  }

  const activeTask = activeId
    ? (Object.values(cols)
        .flat()
        .find((t) => t.id === activeId) ?? null)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeKey = String(active.id);
    const overKey = String(over.id);
    const from = findContainer(activeKey);
    const to = findContainer(overKey);
    if (!from || !to || from === to) return;

    setCols((prev) => {
      const fromArr = prev[from] ?? [];
      const toArr = prev[to] ?? [];
      const task = fromArr.find((t) => t.id === activeKey);
      if (!task) return prev;
      const overIsContainer = dayKeys.includes(overKey);
      const overIndex = overIsContainer
        ? toArr.length
        : toArr.findIndex((t) => t.id === overKey);
      const insertAt = overIndex < 0 ? toArr.length : overIndex;
      return {
        ...prev,
        [from]: fromArr.filter((t) => t.id !== activeKey),
        [to]: [
          ...toArr.slice(0, insertAt),
          { ...task, planned_date: to },
          ...toArr.slice(insertAt),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeKey = String(active.id);
    const overKey = String(over.id);
    const to = findContainer(activeKey);
    if (!to) return;

    const arr = [...(cols[to] ?? [])];
    const oldIndex = arr.findIndex((t) => t.id === activeKey);
    if (oldIndex < 0) return;
    const overIsContainer = dayKeys.includes(overKey);
    let newIndex = overIsContainer
      ? arr.length - 1
      : arr.findIndex((t) => t.id === overKey);
    if (newIndex < 0) newIndex = arr.length - 1;

    const moved = arrayMove(arr, oldIndex, newIndex);
    const idx = moved.findIndex((t) => t.id === activeKey);
    const position = positionBetween(
      moved[idx - 1]?.position,
      moved[idx + 1]?.position,
    );
    const done = moved[idx].status === "done";
    moved[idx] = { ...moved[idx], position, planned_date: to };
    setCols((prev) => ({ ...prev, [to]: moved }));

    startTransition(async () => {
      const res = await moveTask({
        id: activeKey,
        position,
        plannedDate: to,
        status: done ? "done" : "planned",
      });
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      }
    });
  }

  function handleAdd(dayKey: string, title: string) {
    const tempId = `temp-${crypto.randomUUID()}`;
    const last = (cols[dayKey] ?? []).at(-1);
    const optimistic: TaskWithChannel = {
      id: tempId,
      user_id: "",
      channel_id: null,
      title,
      notes: null,
      status: "planned",
      priority: "none",
      planned_date: dayKey,
      position: (last?.position ?? 0) + 1000,
      estimated_minutes: 0,
      actual_minutes: 0,
      saved_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      channel: null,
    };
    setCols((prev) => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] ?? []), optimistic],
    }));
    startTransition(async () => {
      const res = await createTask({
        title,
        plannedDate: dayKey,
        status: "planned",
      });
      if (!res.ok) {
        setCols((prev) => ({
          ...prev,
          [dayKey]: (prev[dayKey] ?? []).filter((t) => t.id !== tempId),
        }));
        toast.error(res.error);
      } else {
        setCols((prev) => ({
          ...prev,
          [dayKey]: (prev[dayKey] ?? []).map((t) =>
            t.id === tempId ? res.data : t,
          ),
        }));
      }
    });
  }

  function handleToggle(task: TaskWithChannel, done: boolean) {
    setCols((prev) => {
      const next: Columns = { ...prev };
      for (const k of dayKeys) {
        if (next[k]?.some((t) => t.id === task.id)) {
          next[k] = next[k].map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: done ? "done" : "planned",
                  completed_at: done ? new Date().toISOString() : null,
                }
              : t,
          );
        }
      }
      return next;
    });
    startTransition(async () => {
      const res = await toggleTaskComplete(task.id, done);
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Week</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{rangeLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Previous week">
            <Link href={`/week?start=${prevWeekKey}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          {!isThisWeek && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/week?start=${thisWeekKey}`}>This week</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" aria-label="Next week">
            <Link href={`/week?start=${nextWeekKey}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <DndContext
        id="week-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-5 min-h-0 flex-1 overflow-x-auto pb-2">
          <div className="grid h-full auto-cols-[minmax(170px,1fr)] grid-flow-col gap-2">
            {days.map((day) => (
              <DayColumn
                key={day.key}
                dayKey={day.key}
                weekday={day.weekday}
                dayNum={day.dayNum}
                isToday={day.isToday}
                tasks={cols[day.key] ?? []}
                onToggle={handleToggle}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <WeekCardView task={activeTask} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
