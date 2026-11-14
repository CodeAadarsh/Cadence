import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-2xl px-5 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-7 w-32" />

      <div className="mt-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-3 w-56" />
        <div className="mt-4 rounded-xl border bg-card p-5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="mt-2 h-9 w-full rounded-lg" />
          <Skeleton className="mt-4 h-3.5 w-14" />
          <Skeleton className="mt-2 h-9 w-full rounded-lg" />
          <Skeleton className="mt-5 h-9 w-32 rounded-lg" />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
        <Skeleton className="size-9 rounded-lg" />
      </div>

      <div className="mt-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-3 w-52" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border bg-card p-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="size-7 shrink-0 rounded" />
            </div>
          ))}
          <Skeleton className="mt-1 h-9 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
