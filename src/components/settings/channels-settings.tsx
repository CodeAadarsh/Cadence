"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChannelDialog } from "@/components/app/channel-dialog";
import { deleteChannel, updateChannel } from "@/lib/actions/channels";
import { CHANNEL_COLORS, type Channel } from "@/lib/types";
import { cn } from "@/lib/utils";

type Patch = { name?: string; color?: string; emoji?: string | null };

export function ChannelsSettings({ channels: initial }: { channels: Channel[] }) {
  const router = useRouter();
  const [channels, setChannels] = React.useState(initial);

  const [synced, setSynced] = React.useState(initial);
  if (initial !== synced) {
    setSynced(initial);
    setChannels(initial);
  }

  function save(id: string, patch: Patch) {
    setChannels((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    updateChannel({ id, ...patch }).then((r) => {
      if (!r.ok) {
        toast.error(r.error);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    setChannels((cs) => cs.filter((c) => c.id !== id));
    deleteChannel(id).then((r) => {
      if (!r.ok) toast.error(r.error);
      else toast.success("Channel deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {channels.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-2 rounded-lg border bg-card p-2"
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="size-6 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
                aria-label="Change color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex max-w-[184px] flex-wrap gap-2">
                {CHANNEL_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => save(c.id, { color: col })}
                    className={cn(
                      "size-6 rounded-full ring-ring ring-offset-2 ring-offset-background transition hover:scale-110",
                      c.color === col && "ring-2",
                    )}
                    style={{ backgroundColor: col }}
                    aria-label={col}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input
            defaultValue={c.emoji ?? ""}
            maxLength={2}
            onBlur={(e) => {
              const v = e.target.value || null;
              if (v !== c.emoji) save(c.id, { emoji: v });
            }}
            aria-label="Emoji"
            className="w-12 shrink-0 text-center"
          />
          <Input
            defaultValue={c.name}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== c.name) save(c.id, { name: v });
            }}
            aria-label="Channel name"
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => remove(c.id)}
            aria-label="Delete channel"
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      {channels.length === 0 && (
        <p className="px-1 py-2 text-sm text-muted-foreground">
          No channels yet.
        </p>
      )}
      <ChannelDialog>
        <Button variant="outline" className="mt-1 w-fit gap-2">
          <Plus className="size-4" />
          New channel
        </Button>
      </ChannelDialog>
    </div>
  );
}
