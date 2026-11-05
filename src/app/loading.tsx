/**
 * Route loading state — brand skeleton instead of a generic spinner.
 *
 * Static markup + one CSS keyframe on a 1px-tall bar: no JS, no layout
 * thrash, and it mirrors the real page rhythm so the swap-in feels calm.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-7 bg-bg px-4">
      {/* Gantry ring */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary [animation-duration:1.4s] motion-reduce:animate-none" />
        <div className="absolute inset-4 rounded-full border border-primary/25" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
        </div>
      </div>

      {/* Dose bar */}
      <div className="relative h-1 w-52 overflow-hidden rounded-full bg-border/70">
        <div className="dose-loading h-full w-2/5 rounded-full bg-gradient-to-r from-primary to-secondary" />
      </div>

      <p className="text-sm text-text-secondary">در حال بارگذاری…</p>
    </div>
  );
}
