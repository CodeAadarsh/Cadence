"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CHANNEL_COLORS } from "@/lib/types";
import { createChannel } from "@/lib/actions/channels";
import { cn } from "@/lib/utils";

export function ChannelDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState("");
  const [color, setColor] = React.useState<string>(CHANNEL_COLORS[0]);
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createChannel({
        name,
        color,
        emoji: emoji || null,
      });
      if (res.ok) {
        toast.success("Channel created");
        setOpen(false);
        setName("");
        setEmoji("");
        setColor(CHANNEL_COLORS[0]);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New channel</DialogTitle>
            <DialogDescription>
              Group related work, like a project or an area of focus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-5">
            <div className="flex gap-2">
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🎯"
                maxLength={2}
                aria-label="Emoji"
                className="w-14 text-center text-base"
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Channel name"
                autoFocus
                className="flex-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Color</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHANNEL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                    style={{ backgroundColor: c }}
                    className={cn(
                      "size-7 rounded-full ring-ring ring-offset-2 ring-offset-background transition-transform hover:scale-110",
                      color === c && "ring-2",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || !name.trim()}>
              Create channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
