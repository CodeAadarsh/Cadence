import { HeaderSkeleton, PageShell } from "@/components/skeletons/parts";
import { Skeleton } from "@/components/ui/skeleton";

function Panel({ className }: { className?: string }) {
  return (
    <div className={`rounded-xl border bg-card p-5 ${className ?? ""}`}>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-2 h-3 w-48" />
      <Skeleton className="mt-6 h-48 w-full rounded-lg" />
    </div>
  );
}

export default function Loading() {
  return (
    <PageShell width="max-w-5xl">
      <HeaderSkeleton actions={0} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-20" />
            <Skeleton className="mt-4 h-10 w-full rounded" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel />
        <Panel />
      </div>

      <div className="mt-4">
        <Panel />
      </div>
    </PageShell>
  );
}
