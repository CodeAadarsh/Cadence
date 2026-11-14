import {
  HeaderSkeleton,
  PageShell,
  TaskListSkeleton,
} from "@/components/skeletons/parts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <HeaderSkeleton actions={1} />
      <div className="mt-7 flex flex-col gap-7">
        {[3, 2].map((rows, i) => (
          <section key={i}>
            <Skeleton className="h-3.5 w-28" />
            <div className="mt-2.5">
              <TaskListSkeleton rows={rows} />
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
