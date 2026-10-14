export default function BlogPostLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {/* Hero skeleton */}
      <section className="relative">
        <div
          className="absolute inset-0 bg-deep"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 82%, 70% 95%, 0 100%)" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-24 sm:px-6 lg:px-8 lg:pb-36 lg:pt-28">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-[16/9] w-full motion-reduce:animate-none bg-slate-700/40" />
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 md:p-10">
              <div className="h-6 w-32 motion-reduce:animate-none rounded-full bg-white/10" />
              <div className="mt-4 h-10 w-3/4 max-w-xl motion-reduce:animate-none rounded-lg bg-white/10" />
              <div className="mt-5 flex gap-4">
                <div className="h-4 w-24 motion-reduce:animate-none rounded bg-white/5" />
                <div className="h-4 w-28 motion-reduce:animate-none rounded bg-white/5" />
                <div className="h-4 w-20 motion-reduce:animate-none rounded bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body skeleton */}
      <section className="relative z-10 -mt-6 pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="rounded-[1.75rem] border border-border/60 bg-surface p-7 shadow-sm sm:p-9 md:p-11">
                <div className="space-y-4">
                  {[100, 96, 100, 88, 100, 72].map((w, i) => (
                    <div
                      key={i}
                      className="h-4 motion-reduce:animate-none rounded-lg bg-slate-200 dark:bg-white/5"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                  <div className="mt-8 h-40 w-full motion-reduce:animate-none rounded-xl bg-slate-200 dark:bg-white/5" />
                  <div className="mt-8 space-y-4">
                    {[100, 92, 60].map((w, i) => (
                      <div
                        key={i}
                        className="h-4 motion-reduce:animate-none rounded-lg bg-slate-200 dark:bg-white/5"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <aside className="hidden self-start lg:block">
              <div className="rounded-2xl border border-border/60 bg-surface/90 p-5 shadow-sm">
                <div className="mb-4 h-3.5 w-24 motion-reduce:animate-none rounded bg-slate-200 dark:bg-white/5" />
                <div className="space-y-3">
                  {[80, 65, 90, 70, 85].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 motion-reduce:animate-none rounded bg-slate-100 dark:bg-white/5"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}