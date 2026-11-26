export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8" aria-busy="true">
      <div className="mb-8 h-9 w-64 animate-pulse rounded-lg bg-raised" />
      <div className="mb-10 h-64 animate-pulse rounded-2xl bg-raised" />
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-raised" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-72 w-48 shrink-0 animate-pulse rounded-xl bg-raised" />
        ))}
      </div>
    </div>
  );
}
