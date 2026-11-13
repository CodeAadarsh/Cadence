"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";

export type PlannedActualPoint = {
  name: string;
  planned: number;
  actual: number;
};

export function PlannedActualBarChart({ data }: { data: PlannedActualPoint[] }) {
  return (
    <div className="h-56 w-full">
      <BarChart data={data} xDataKey="name" className="h-full">
        <Grid horizontal />
        <Bar dataKey="planned" fill="var(--chart-3)" />
        <Bar dataKey="actual" fill="var(--chart-1)" />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}
