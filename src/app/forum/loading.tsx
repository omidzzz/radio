export default function ForumLoading() {
  return (
    <div className="relative bg-bg min-h-screen">
      {/* Page Header Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-soft via-white to-soft">
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="h-4 w-24 rounded-lg bg-slate-200 animate-pulse" />
          <div className="mt-6 h-10 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
          <div className="mt-4 h-5 w-1/2 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </section>

      {/* Topic list & post cards skeleton */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Category pills */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="h-9 w-20 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-9 w-16 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
        </div>

        <div className="space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="h-4 w-32 rounded-lg bg-slate-200" />
              </div>
              <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
              <div className="h-4 w-full rounded-lg bg-slate-200" />
              <div className="h-4 w-5/6 rounded-lg bg-slate-200" />
              <div className="flex gap-2 pt-1">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="h-8 w-20 rounded-lg bg-slate-200" />
                <div className="h-8 w-16 rounded-lg bg-slate-200" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="mt-10 flex justify-center gap-3">
          <div className="h-9 w-28 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-9 w-12 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-slate-200 animate-pulse" />
        </div>
      </section>
    </div>
  );
}
