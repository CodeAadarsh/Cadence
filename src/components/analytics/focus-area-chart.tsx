"use client";

import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import type { DayPoint } from "@/lib/data/analytics";

export function FocusAreaChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-56 w-full">
      <AreaChart data={data} xDataKey="date" className="h-full">
        <Grid horizontal />
        <Area
          dataKey="focus"
          fill="var(--chart-1)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}
