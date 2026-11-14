import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="flex h-full flex-col px-4 py-6 sm:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-2.5 h-4 w-40" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>

      <div className="mt-6 grid min-h-0 flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, col) => (
          <div key={col} className="flex flex-col rounded-xl border bg-card/50 p-2">
            <div className="flex items-center justify-between px-1 pb-2">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: (col % 3) + 1 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="mt-2 h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
