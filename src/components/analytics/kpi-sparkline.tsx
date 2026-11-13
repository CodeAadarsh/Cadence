"use client";

import { AreaSparkline } from "@/components/charts/sparkline";

export function KpiSparkline({
  data,
  color = "var(--chart-1)",
}: {
  data: { value: number }[];
  color?: string;
}) {
  return (
    <AreaSparkline
      data={data}
      dataKey="value"
      height={34}
      color={color}
      fillOpacity={0.18}
      strokeWidth={2}
      className="w-full"
    />
  );
}
