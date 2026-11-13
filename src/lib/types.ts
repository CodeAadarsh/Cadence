import type { Database } from "@/lib/supabase/database.types";

export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];

export type Channel = Database["public"]["Tables"]["channels"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
export type DailyPlan = Database["public"]["Tables"]["daily_plans"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

export type TaskWithChannel = Task & { channel: Channel | null };
export type TaskWithDetails = TaskWithChannel & { subtasks: Subtask[] };

export const TASK_STATUSES: TaskStatus[] = [
  "backlog",
  "planned",
  "in_progress",
  "done",
  "cancelled",
];

export const PRIORITIES: TaskPriority[] = ["none", "low", "medium", "high"];

/** Curated palette for channels — vivid but harmonious. */
export const CHANNEL_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#64748b", // slate
];
