import {
  AddBoxSkeleton,
  HeaderSkeleton,
  PageShell,
  ProgressCardSkeleton,
  TaskListSkeleton,
} from "@/components/skeletons/parts";

export default function Loading() {
  return (
    <PageShell>
      <HeaderSkeleton actions={3} />
      <div className="mt-5">
        <ProgressCardSkeleton />
      </div>
      <div className="mt-6">
        <AddBoxSkeleton />
      </div>
      <div className="mt-3">
        <TaskListSkeleton rows={5} />
      </div>
    </PageShell>
  );
}
