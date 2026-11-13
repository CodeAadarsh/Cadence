"use client";

import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import { formatMinutes } from "@/lib/format";
import type { ChannelSlice } from "@/lib/data/analytics";

export function ChannelDonut({
  data,
  total,
}: {
  data: ChannelSlice[];
  total: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <PieChart
        data={data}
        size={190}
        innerRadius={66}
        cornerRadius={4}
        padAngle={0.02}
      >
        {data.map((slice, i) => (
          <PieSlice key={slice.label} index={i} />
        ))}
        <PieCenter defaultLabel="Focus">
          {({ isHovered, value, label }) => (
            <div className="text-center">
              <p className="text-base font-semibold">
                {formatMinutes(isHovered ? value : total)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isHovered ? label : "Total focus"}
              </p>
            </div>
          )}
        </PieCenter>
      </PieChart>
      <ul className="flex w-full flex-col gap-1.5 sm:w-40">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="flex-1 truncate text-muted-foreground">
              {slice.label}
            </span>
            <span className="font-medium tabular-nums">
              {formatMinutes(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
