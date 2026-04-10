import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-active-notion rounded-2xl", className)} />
  );
}

export function CardListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 bg-card border border-border-notion rounded-3xl">
          <Skeleton className="h-5 w-2/3 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-8 bg-card border border-border-notion rounded-[40px]">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="p-4 sm:p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-16 w-64 mb-4" />
        <Skeleton className="h-8 w-48 mb-12" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-8 bg-card border border-border-notion rounded-[40px]">
              <Skeleton className="h-14 w-14 rounded-2xl mb-6" />
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
