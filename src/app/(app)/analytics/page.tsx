import type { Metadata } from "next";
import { CheckCircle2, Clock, Flame, Target } from "lucide-react";

import { ChannelDonut } from "@/components/analytics/channel-donut";
import { FocusAreaChart } from "@/components/analytics/focus-area-chart";
import { KpiSparkline } from "@/components/analytics/kpi-sparkline";
import { PlannedActualBarChart } from "@/components/analytics/planned-actual-bar-chart";
import { getAnalytics } from "@/lib/data/analytics";
import { formatMinutes, fromDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const a = await getAnalytics();
  const barData = a.days.slice(-7).map((d) => ({
    name: fromDateKey(d.date).toLocaleDateString(undefined, { weekday: "short" }),
    planned: d.planned,
    actual: d.focus,
  }));
  const sparkCompleted = a.days.map((d) => ({ value: d.completed }));
  const sparkFocus = a.days.map((d) => ({ value: d.focus }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your last 14 days of focus and follow-through.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Completed" value={String(a.completedWeek)} sub="this week">
          <KpiSparkline data={sparkCompleted} />
        </StatCard>
        <StatCard icon={Clock} label="Focus time" value={formatMinutes(a.focusWeek)} sub="this week">
          <KpiSparkline data={sparkFocus} color="var(--chart-2)" />
        </StatCard>
        <StatCard icon={Target} label="Completion" value={`${a.completionRate}%`} sub="last 7 days" />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${a.streak} ${a.streak === 1 ? "day" : "days"}`}
          sub="in a row"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Focus over time" subtitle="Minutes tracked per day" className="lg:col-span-2">
          <FocusAreaChart data={a.days} />
        </Panel>
        <Panel title="Time by channel" subtitle="Where your focus went">
          {a.channels.length ? (
            <ChannelDonut data={a.channels} total={a.totalFocus} />
          ) : (
            <Empty />
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel
          title="Planned vs. actual"
          subtitle="Estimated vs. tracked minutes, last 7 days"
        >
          <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: "var(--chart-3)" }} />
              Planned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: "var(--chart-1)" }} />
              Actual
            </span>
          </div>
          <PlannedActualBarChart data={barData} />
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
      {children ? <div className="mt-3 h-9">{children}</div> : null}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Empty() {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
      No focus tracked yet
    </div>
  );
}
