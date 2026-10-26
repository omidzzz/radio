/**
 * PlanningBand — vertical side tag block that frames slide content.
 *
 * Renders a full-height band along the logical start edge (left in LTR,
 * right in RTL) with a theme-aware tint and a hairline border on its
 * logical end edge. Intended for the "Planning Table" slide concept.
 *
 * The band stays transparent so the curved theme motif behind it remains crisp.
 */
interface PlanningBandProps {
  className?: string;
  width?: "w-[12%]" | "w-[15%]" | "w-[18%]" | "w-[20%]";
  hideBorder?: boolean;
}

export default function PlanningBand({
  className = "",
  width = "w-[15%]",
  hideBorder = false,
}: PlanningBandProps) {
  return (
    <div
      className={`absolute inset-y-0 left-0 z-10 ${width} bg-transparent ${
        hideBorder ? "" : "border-r border-border"
      } pointer-events-none ${className}`.trim()}
    />
  );
}
