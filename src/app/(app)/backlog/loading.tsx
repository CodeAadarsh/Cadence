import {
  AddBoxSkeleton,
  HeaderSkeleton,
  PageShell,
  TaskListSkeleton,
} from "@/components/skeletons/parts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <HeaderSkeleton actions={1} />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-7 w-36 rounded-lg" />
        <Skeleton className="h-7 w-28 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
      <div className="mt-5">
        <AddBoxSkeleton />
      </div>
      <div className="mt-3">
        <TaskListSkeleton rows={6} />
      </div>
    </PageShell>
  );
}
