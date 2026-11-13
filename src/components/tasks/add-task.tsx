"use client";

import * as React from "react";
import { Clock, Hash, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatMinutesCompact } from "@/lib/format";
import type { Channel } from "@/lib/types";

const ESTIMATES = [0, 15, 30, 45, 60, 90, 120];

export type NewTaskInput = {
  title: string;
  channelId: string | null;
  estimatedMinutes: number;
};

export function AddTask({
  channels,
  onAdd,
  placeholder = "Add a task…",
  defaultChannelId = null,
}: {
  channels: Channel[];
  onAdd: (input: NewTaskInput) => void;
  placeholder?: string;
  defaultChannelId?: string | null;
}) {
  const [title, setTitle] = React.useState("");
  const [channelId, setChannelId] = React.useState<string | null>(
    defaultChannelId,
  );
  const [estimate, setEstimate] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const channel = channels.find((c) => c.id === channelId) ?? null;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({ title: trimmed, channelId, estimatedMinutes: estimate });
    setTitle("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-xl border border-dashed bg-card/50 px-2.5 py-2 transition-colors focus-within:border-solid focus-within:border-primary/40 focus-within:bg-card"
    >
      <Plus className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted",
              channel ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {channel ? (
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: channel.color }}
              />
            ) : (
              <Hash className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {channel ? channel.name : "Channel"}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setChannelId(null)}>
            <Hash className="size-4 text-muted-foreground" />
            No channel
          </DropdownMenuItem>
          {channels.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setChannelId(c.id)}>
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted",
              estimate ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Clock className="size-3.5" />
            <span className="hidden sm:inline">
              {estimate ? formatMinutesCompact(estimate) : "Est"}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {ESTIMATES.map((m) => (
            <DropdownMenuItem key={m} onClick={() => setEstimate(m)}>
              <Clock className="size-4 text-muted-foreground" />
              {m === 0 ? "No estimate" : formatMinutesCompact(m)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </form>
  );
}
