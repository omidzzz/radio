/**
 * Slice divider — a static DICOM-style "slice stack" separating two light
 * sections. Pure markup: no animation, no client JS, ~1KB.
 */
interface SliceDividerProps {
  /** Micro-copy in the middle of the divider (e.g. "SLICE · 0.5 mm") */
  label?: string;
}

export default function SliceDivider({ label = "SLICE · 0.5 mm" }: SliceDividerProps) {
  // Centre slice is brightest; the stack fades outward like a thickness ramp
  const slices = [0.18, 0.32, 0.5, 1, 0.5, 0.32, 0.18];

  return (
    <div
      className="pointer-events-none relative h-16 w-full overflow-hidden sm:h-20"
      aria-hidden="true"
    >
      {/* Hairline running through the section break */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Slice stack */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[3px]">
        {slices.map((opacity, i) => (
          <span
            key={i}
            className="block w-[3px] rounded-[1px] bg-primary"
            style={{ height: 18 + opacity * 14, opacity }}
          />
        ))}
      </div>

      {/* Micro-label, tucked beside the stack */}
      <span className="absolute left-1/2 top-1/2 hidden -translate-y-1/2 translate-x-12 font-mono text-[10px] tracking-[0.22em] text-muted sm:block">
        {label}
      </span>
    </div>
  );
}
