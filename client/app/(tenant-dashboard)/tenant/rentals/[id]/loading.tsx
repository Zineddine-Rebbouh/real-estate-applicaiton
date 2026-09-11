import { Skeleton } from "@/components/ui/skeleton";

export default function RentalDetailLoading() {
  return (
    <div className="min-h-full bg-muted/20 pb-20 sm:pb-16 dark:bg-sidebar">
      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:px-6 space-y-6 sm:space-y-8">
        <Skeleton className="h-[420px] w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4 min-w-0">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
