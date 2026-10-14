/**
 * Blog list loading state.
 *
 * Mirrors the real page (PageHero band + card grid) and uses theme tokens
 * only — the previous version hardcoded slate/white, which flashed bright
 * in dark mode and used an outdated clipped-polygon hero.
 */
export default function BlogLoading() {
  const cards = [true, false, false, false];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {/* Hero band */}
      <div className="band-dark">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="h-7 w-40 motion-reduce:animate-none rounded-full bg-white/10" />
          <div className="mt-6 h-11 w-80 max-w-full motion-reduce:animate-none rounded-xl bg-white/10" />
          <div className="mt-5 h-5 w-[28rem] max-w-full motion-reduce:animate-none rounded-lg bg-white/[0.06]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* Card grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-7 md:grid-cols-2">
          {cards.map((featured, i) => (
            <div
              key={i}
              className={`surface-card overflow-hidden ${
                featured ? "md:col-span-2 md:flex" : ""
              }`}
            >
              <div
                className={`shrink-0 motion-reduce:animate-none bg-border/60 ${
                  featured ? "h-52 w-full md:h-auto md:w-[46%]" : "h-52 w-full sm:h-56"
                }`}
              />
              <div className="flex-1 p-6 sm:p-8">
                <div className="h-5 w-3/4 motion-reduce:animate-none rounded-lg bg-border/70" />
                <div className="mt-3 h-4 w-full motion-reduce:animate-none rounded-lg bg-border/50" />
                <div className="mt-2 h-4 w-2/3 motion-reduce:animate-none rounded-lg bg-border/50" />
                <div className="mt-6 flex items-center justify-between">
                  <div className="h-3 w-24 motion-reduce:animate-none rounded-lg bg-border/50" />
                  <div className="h-3 w-32 motion-reduce:animate-none rounded-lg bg-border/50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
