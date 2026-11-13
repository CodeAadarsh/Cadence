"use client";

import * as React from "react";
import { Plus } from "lucide-react";

export function CompactAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = React.useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle("");
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-muted-foreground transition-colors focus-within:bg-card focus-within:text-foreground hover:text-foreground"
    >
      <Plus className="size-3.5 shrink-0" />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add"
        className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}
