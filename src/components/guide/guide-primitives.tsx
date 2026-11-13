"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Inline keyboard chip, e.g. <Kbd>⌘</Kbd><Kbd>K</Kbd> */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 align-middle font-sans text-[0.7rem] font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-4 pb-7 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {n}
        </span>
        <span className="absolute top-7 h-full w-px bg-border" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Callout({
  tone = "tip",
  title,
  children,
}: {
  tone?: "tip" | "warn" | "try";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    tip: "border-sky-500/25 bg-sky-500/5",
    warn: "border-amber-500/30 bg-amber-500/5",
    try: "border-primary/25 bg-primary/5",
  }[tone];
  const labelColor = {
    tip: "text-sky-600 dark:text-sky-400",
    warn: "text-amber-600 dark:text-amber-400",
    try: "text-primary",
  }[tone];

  return (
    <div className={cn("rounded-xl border px-4 py-3", styles)}>
      <p className={cn("text-xs font-semibold uppercase tracking-wider", labelColor)}>
        {title}
      </p>
      <div className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

/** A faux app chrome used to illustrate a feature without a screenshot. */
export function Demo({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-background shadow-sm">
      {label && (
        <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-1.5">
          <span className="size-2 rounded-full bg-rose-400/70" />
          <span className="size-2 rounded-full bg-amber-400/70" />
          <span className="size-2 rounded-full bg-emerald-400/70" />
          <span className="ml-1.5 text-[0.7rem] font-medium text-muted-foreground">
            {label}
          </span>
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}

export function DemoTask({
  title,
  color,
  channel,
  est,
  done,
  saved,
  priority,
}: {
  title: string;
  color?: string;
  channel?: string;
  est?: string;
  done?: boolean;
  saved?: boolean;
  priority?: "high" | "medium";
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card px-2.5 py-2 text-sm shadow-sm">
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          done && "border-primary bg-primary",
        )}
      >
        {done && (
          <svg viewBox="0 0 24 24" className="size-2.5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <span className={cn("min-w-0 flex-1 truncate", done && "text-muted-foreground line-through")}>
        {title}
      </span>
      {priority && (
        <span
          className={cn(
            "shrink-0 text-xs",
            priority === "high" ? "text-rose-500" : "text-amber-500",
          )}
        >
          ⚑
        </span>
      )}
      {channel && (
        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
          <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
          {channel}
        </span>
      )}
      {est && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{est}</span>}
      {saved && <span className="shrink-0 text-xs text-amber-500">🔖</span>}
    </div>
  );
}
