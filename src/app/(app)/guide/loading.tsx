import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <div className="lg:flex lg:gap-10">
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-lg" />
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl border p-8">
            <Skeleton className="h-6 w-44 rounded-full" />
            <Skeleton className="mt-5 h-9 w-full max-w-xl" />
            <Skeleton className="mt-2.5 h-9 w-2/3" />
            <Skeleton className="mt-5 h-4 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <div className="mt-7 flex gap-2.5">
              <Skeleton className="h-10 w-40 rounded-lg" />
              <Skeleton className="h-10 w-44 rounded-lg" />
            </div>
          </div>

          {Array.from({ length: 2 }).map((_, s) => (
            <div key={s} className="border-b py-9">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-3 h-6 w-72" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
