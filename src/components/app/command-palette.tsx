"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  CalendarRange,
  CornerDownLeft,
  Hash,
  Inbox,
  Loader2,
  Plus,
  Search,
  Settings,
  Sun,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createTask } from "@/lib/actions/tasks";
import { searchTasks } from "@/lib/actions/search";
import { toDateKey } from "@/lib/format";
import type { Channel, TaskWithChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Sun;
  group: string;
  accent?: string;
  run: () => void | Promise<void>;
};

const NAV = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/week", label: "Week", icon: CalendarRange },
  { href: "/backlog", label: "Backlog", icon: Inbox },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const OPEN_PALETTE_EVENT = "cadence:open-palette";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}

export function CommandPalette({ channels }: { channels: Channel[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  // Results are tagged with the query that produced them, so "is a search in
  // flight" is derived rather than tracked as separate state.
  const [found, setFound] = React.useState<{
    query: string;
    items: TaskWithChannel[];
  }>({ query: "", items: [] });
  const [pending, setPending] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) setWasOpen(open);
  if (open && !wasOpen) {
    setQuery("");
    setActive(0);
    setFound({ query: "", items: [] });
  }

  // Debounced task search. Only the async callback writes state.
  React.useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2) return;
    let live = true;
    const t = setTimeout(() => {
      searchTasks(q)
        .then((items) => live && setFound({ query: q, items }))
        .catch(() => live && setFound({ query: q, items: [] }));
    }, 180);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query, open]);

  const close = React.useCallback(() => setOpen(false), []);


  const capture = React.useCallback(
    async (title: string, where: "today" | "backlog") => {
      setPending(true);
      const res = await createTask({
        title,
        plannedDate: where === "today" ? toDateKey(new Date()) : null,
      });
      setPending(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        where === "today" ? "Added to today" : "Captured to backlog",
      );
      close();
      router.refresh();
    },
    [close, router],
  );

  const q = query.trim();
  const results = React.useMemo(
    () => (found.query === q ? found.items : []),
    [found, q],
  );
  const searching = q.length >= 2 && found.query !== q;

  const items = React.useMemo<Item[]>(() => {
    const out: Item[] = [];

    if (q) {
      out.push({
        id: "capture-today",
        label: `Add "${q}" to today`,
        hint: "Enter",
        icon: Plus,
        group: "Capture",
        accent: "text-primary",
        run: () => capture(q, "today"),
      });
      out.push({
        id: "capture-backlog",
        label: `Save "${q}" to backlog`,
        icon: Inbox,
        group: "Capture",
        run: () => capture(q, "backlog"),
      });
    }

    for (const t of results) {
      out.push({
        id: `task-${t.id}`,
        label: t.title,
        hint: t.channel?.name,
        icon: Search,
        group: "Tasks",
        run: () => {
          close();
          router.push(
            t.planned_date ? `/today?date=${t.planned_date}` : "/backlog",
          );
        },
      });
    }

    const lower = q.toLowerCase();
    for (const n of NAV) {
      if (q && !n.label.toLowerCase().includes(lower)) continue;
      out.push({
        id: `nav-${n.href}`,
        label: n.label,
        icon: n.icon,
        group: "Go to",
        run: () => {
          close();
          router.push(n.href);
        },
      });
    }

    for (const c of channels) {
      if (q && !c.name.toLowerCase().includes(lower)) continue;
      out.push({
        id: `channel-${c.id}`,
        label: c.name,
        hint: "channel",
        icon: Hash,
        group: "Channels",
        run: () => {
          close();
          router.push(`/backlog?channel=${c.id}`);
        },
      });
    }

    return out;
  }, [q, results, channels, capture, close, router]);

  const clamped = Math.min(active, Math.max(0, items.length - 1));

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${clamped}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [clamped]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (items.length ? (i + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      void items[clamped]?.run();
    }
  }

  let lastGroup = "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>

        <div className="flex items-center gap-2.5 border-b px-4">
          {pending || searching ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="size-4 shrink-0 text-muted-foreground" />
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search tasks, jump to a view, or capture something…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          className="scrollbar-thin max-h-80 overflow-y-auto p-1.5"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {items.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 py-8 text-center text-sm text-muted-foreground"
              >
                Start typing to capture a task or jump somewhere.
              </motion.p>
            ) : (
              items.map((item, i) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                const Icon = item.icon;
                const isActive = i === clamped;
                return (
                  <React.Fragment key={item.id}>
                    {showGroup && (
                      <p className="px-2.5 pb-1 pt-2.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.group}
                      </p>
                    )}
                    <button
                      type="button"
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => void item.run()}
                      className={cn(
                        "relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="palette-active"
                          className="absolute inset-0 rounded-lg bg-muted"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <Icon
                        className={cn(
                          "relative size-4 shrink-0",
                          item.accent ?? "",
                        )}
                      />
                      <span className="relative truncate">{item.label}</span>
                      {item.hint && (
                        <span className="relative ml-auto shrink-0 text-xs text-muted-foreground">
                          {item.hint}
                        </span>
                      )}
                      {isActive && !item.hint && (
                        <CornerDownLeft className="relative ml-auto size-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 border-t bg-muted/30 px-4 py-2 text-[0.7rem] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1">↑</kbd>
            <kbd className="rounded border bg-background px-1">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1">↵</kbd>
            select
          </span>
          <span className="ml-auto flex items-center gap-1">
            <ArrowRight className="size-3" />
            {items.length} result{items.length === 1 ? "" : "s"}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
