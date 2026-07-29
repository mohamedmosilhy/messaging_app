import { Skeleton } from "@/app/components/ui/skeleton";

export function ConversationSkeleton() {
  return (
    <div
      aria-label="Loading conversation"
      className="flex h-full min-h-0 flex-col"
      role="status"
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 p-5">
        <Skeleton className="h-14 w-3/5 rounded-2xl" />
        <Skeleton className="ml-auto h-20 w-2/3 rounded-2xl" />
        <Skeleton className="h-12 w-1/2 rounded-2xl" />
        <Skeleton className="ml-auto h-14 w-2/5 rounded-2xl" />
      </div>
      <div className="border-t p-3">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
      <span className="sr-only">Loading conversation</span>
    </div>
  );
}
