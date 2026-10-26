/**
 * HUDOverlay — decorative technical ornaments for slide backgrounds.
 *
 * Composes the existing radiotherapy motif vocabulary into an optional
 * overlay stack. All ornaments are pointer-events-none and desktop-only
 * (hidden lg:block) so they never interfere with touch / mobile reading.
 *
 * Props:
 *   grid        — faint PACS-style crosshair (planning-grid)
 *   rings       — isodose contour rings (corners)
 *   scanLine    — sweeping animated beam line
 *   orbs        — floating blurred depth orbs
 *   trefoil     — subtle radiation-symbol pattern
 */
interface HUDOverlayProps {
  grid?: boolean;
  rings?: boolean;
  scanLine?: boolean;
  orbs?: boolean;
  trefoil?: boolean;
  className?: string;
}

export default function HUDOverlay({
  grid = false,
  rings = false,
  scanLine = false,
  orbs = false,
  trefoil = false,
  className = "",
}: HUDOverlayProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 ${className}`.trim()}
      aria-hidden="true"
    >
      {grid && (
        <div className="planning-grid hidden lg:block" />
      )}

      {trefoil && (
        <div
          className="hidden lg:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23c9a24b' stroke-width='0.6'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {rings && (
        <>
          <div className="isodose-ring isodose-ring-1 absolute h-40 w-40 rounded-full border border-slate-300/60 dark:border-primary/20" />
          <div className="isodose-ring isodose-ring-2 absolute -inset-8 rounded-full border border-slate-300/40 dark:border-primary/15" />
          <div className="isodose-ring isodose-ring-3 absolute -inset-16 rounded-full border border-slate-200/50 dark:border-secondary/10" />
          <div className="isodose-ring isodose-ring-4 absolute -inset-24 rounded-full border border-slate-200/30 dark:border-primary/5" />
        </>
      )}

      {orbs && (
        <>
          <div
            className="float-bob pointer-events-none absolute left-[5%] top-[40%] h-64 w-64 rounded-full bg-gold/10 dark:bg-primary/15 blur-3xl hidden lg:block"
          />
        </>
      )}

      {scanLine && (
        <div className="scan-line absolute inset-0 hidden lg:block">
          <div className="h-1 w-full bg-primary/40 dark:bg-primary/60" />
        </div>
      )}
    </div>
  );
}
