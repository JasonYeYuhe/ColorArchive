export default function Loading() {
  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero skeleton */}
        <div className="animate-pulse space-y-3 py-8">
          <div className="mx-auto h-8 w-64 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="mx-auto h-4 w-96 rounded bg-neutral-100 dark:bg-neutral-800/60" />
        </div>

        {/* Filter toolbar skeleton */}
        <div className="animate-pulse rounded-[1.75rem] border border-black/5 bg-white/60 p-5 dark:border-white/5 dark:bg-white/5">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
            <div className="h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            <div className="flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 w-20 shrink-0 rounded-full bg-neutral-100 dark:bg-neutral-800" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="mt-2 h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
