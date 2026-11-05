export default function ForumPostLoading() {
  return (
    <div className="relative bg-bg min-h-screen">
      {/* Page Header Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-soft via-white to-soft">
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="h-4 w-24 rounded-lg bg-slate-200 animate-pulse" />
          <div className="mt-6 h-10 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="h-8 w-32 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-40 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-28 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Post + Replies Skeleton */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border bg-white p-8 shadow-sm space-y-4 animate-pulse">
          <div className="h-6 w-32 rounded-full bg-slate-200" />
          <div className="h-4 w-full rounded-lg bg-slate-200" />
          <div className="h-4 w-full rounded-lg bg-slate-200" />
          <div className="h-4 w-2/3 rounded-lg bg-slate-200" />
        </div>

        <div className="mt-12 space-y-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="h-4 w-32 rounded-lg bg-slate-200" />
              </div>
              <div className="h-4 w-full rounded-lg bg-slate-200" />
              <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}