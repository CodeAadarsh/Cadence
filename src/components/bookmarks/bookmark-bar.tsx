"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ExternalLink, Link2, Pencil, Plus, StickyNote, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBookmark,
  deleteBookmark,
  updateBookmark,
} from "@/lib/actions/bookmarks";
import type { Bookmark, Channel } from "@/lib/types";
import { cn } from "@/lib/utils";

type Draft = {
  id?: string;
  title: string;
  url: string;
  note: string;
  emoji: string;
};

const EMPTY: Draft = { title: "", url: "", note: "", emoji: "" };

/**
 * Slack-style bookmark strip pinned under a channel header. Holds links and
 * short notes that belong to the channel rather than to any one task.
 */
export function BookmarkBar({
  bookmarks: initial,
  channel,
}: {
  bookmarks: Bookmark[];
  channel: Channel | null;
}) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = React.useState(initial);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);

  const signature = React.useMemo(
    () => initial.map((b) => `${b.id}:${b.title}:${b.url}:${b.note}`).join("|"),
    [initial],
  );
  const [synced, setSynced] = React.useState(signature);
  if (signature !== synced) {
    setSynced(signature);
    setBookmarks(initial);
  }

  async function submit() {
    if (!draft) return;
    const title = draft.title.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title,
      url: draft.url.trim() || null,
      note: draft.note.trim() || null,
      emoji: draft.emoji.trim() || null,
    };
    const res = draft.id
      ? await updateBookmark({ id: draft.id, ...payload })
      : await createBookmark({ ...payload, channelId: channel?.id ?? null });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(draft.id ? "Bookmark updated" : "Bookmark added");
    setDraft(null);
    router.refresh();
  }

  function remove(b: Bookmark) {
    setBookmarks((prev) => prev.filter((x) => x.id !== b.id));
    void deleteBookmark(b.id).then((res) => {
      if (!res.ok) toast.error(res.error);
      else toast.success("Bookmark removed");
      router.refresh();
    });
  }

  const scope = channel ? channel.name : "Backlog";

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <AnimatePresence initial={false}>
          {bookmarks.map((b) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="group/chip relative"
            >
              <BookmarkChip
                bookmark={b}
                onEdit={() =>
                  setDraft({
                    id: b.id,
                    title: b.title,
                    url: b.url ?? "",
                    note: b.note ?? "",
                    emoji: b.emoji ?? "",
                  })
                }
                onRemove={() => remove(b)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border border-dashed px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors",
            "hover:border-solid hover:bg-muted hover:text-foreground",
          )}
        >
          <Plus className="size-3" />
          {bookmarks.length === 0 ? "Add a bookmark" : "Add"}
        </button>
      </div>

      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "Edit bookmark" : "New bookmark"}
            </DialogTitle>
            <DialogDescription>
              Pinned to <span className="font-medium">{scope}</span> — keep a
              spec, dashboard or reminder one click away.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="w-16">
                <Label htmlFor="bm-emoji" className="text-xs">
                  Emoji
                </Label>
                <Input
                  id="bm-emoji"
                  value={draft?.emoji ?? ""}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, emoji: e.target.value } : d))
                  }
                  placeholder="🔗"
                  className="mt-1 text-center"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="bm-title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="bm-title"
                  autoFocus
                  value={draft?.title ?? ""}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, title: e.target.value } : d))
                  }
                  onKeyDown={(e) => e.key === "Enter" && void submit()}
                  placeholder="Design spec"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bm-url" className="text-xs">
                Link <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="bm-url"
                value={draft?.url ?? ""}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, url: e.target.value } : d))
                }
                onKeyDown={(e) => e.key === "Enter" && void submit()}
                placeholder="figma.com/file/…"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bm-note" className="text-xs">
                Note <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="bm-note"
                value={draft?.note ?? ""}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, note: e.target.value } : d))
                }
                placeholder="Why this matters…"
                className="mt-1 min-h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={saving}>
              {saving ? "Saving…" : draft?.id ? "Save changes" : "Add bookmark"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BookmarkChip({
  bookmark: b,
  onEdit,
  onRemove,
}: {
  bookmark: Bookmark;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const Icon = b.url ? Link2 : StickyNote;
  const content = (
    <>
      {b.emoji ? (
        <span className="text-sm leading-none">{b.emoji}</span>
      ) : (
        <Icon className="size-3 shrink-0 text-muted-foreground" />
      )}
      <span className="max-w-40 truncate">{b.title}</span>
      {b.url && (
        <ExternalLink className="size-2.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100" />
      )}
    </>
  );

  const base =
    "inline-flex items-center gap-1.5 rounded-lg border bg-card py-1 pl-2.5 pr-7 text-xs font-medium shadow-sm transition-colors hover:bg-muted";

  return (
    <>
      {b.url ? (
        <a
          href={b.url}
          target="_blank"
          rel="noopener noreferrer"
          title={b.note ?? b.url}
          className={base}
        >
          {content}
        </a>
      ) : (
        <button type="button" onClick={onEdit} title={b.note ?? ""} className={base}>
          {content}
        </button>
      )}

      <div className="absolute right-0.5 top-1/2 flex -translate-y-1/2 items-center opacity-0 transition-opacity group-hover/chip:opacity-100">
        <button
          type="button"
          aria-label="Edit bookmark"
          onClick={onEdit}
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-2.5" />
        </button>
        <button
          type="button"
          aria-label="Remove bookmark"
          onClick={onRemove}
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-2.5" />
        </button>
      </div>
    </>
  );
}
