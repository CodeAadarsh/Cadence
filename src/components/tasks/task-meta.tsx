import { Clock, Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMinutesCompact } from "@/lib/format";
import type { Channel, TaskPriority } from "@/lib/types";

const PRIORITY_STYLE: Record<TaskPriority, string | null> = {
  none: null,
  low: "text-sky-500",
  medium: "text-amber-500",
  high: "text-rose-500",
};

export function ChannelTag({ channel }: { channel: Channel | null }) {
  if (!channel) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: channel.color }}
      />
      {channel.name}
    </span>
  );
}

export function EstimateTag({
  estimated,
  actual,
}: {
  estimated: number;
  actual: number;
}) {
  if (!estimated && !actual) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3" />
      {actual > 0 ? (
        <span>
          {formatMinutesCompact(actual)}
          <span className="text-muted-foreground/50">
            {" / "}
            {formatMinutesCompact(estimated)}
          </span>
        </span>
      ) : (
        formatMinutesCompact(estimated)
      )}
    </span>
  );
}

export function PriorityFlag({ priority }: { priority: TaskPriority }) {
  const style = PRIORITY_STYLE[priority];
  if (!style) return null;
  return <Flag className={cn("size-3 fill-current", style)} />;
}
