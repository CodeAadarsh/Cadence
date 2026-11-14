import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shared loading primitives. These mirror the real layouts closely enough that
 * streamed content replaces them without shifting anything on screen.
 */

export function PageShell({
  width = "max-w-3xl",
  children,
}: {
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full px-4 py-6 sm:px-6 sm:py-8", width)}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

export function HeaderSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2.5 h-4 w-56" />
      </div>
      {actions > 0 && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} className="size-8 rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}

const ROW_WIDTHS = ["w-56", "w-72", "w-44", "w-64", "w-52", "w-60"];

export function TaskRowSkeleton({ i = 0 }: { i?: number }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-3">
      <Skeleton className="size-5 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className={cn("h-4", ROW_WIDTHS[i % ROW_WIDTHS.length])} />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

export function TaskListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <TaskRowSkeleton key={i} i={i} />
      ))}
    </div>
  );
}

export function AddBoxSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed px-3 py-3.5">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function ProgressCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
    </div>
  );
}
