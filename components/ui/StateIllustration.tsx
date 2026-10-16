interface StateIllustrationProps {
  /**
   * "not-found" = the scan point missed the target,
   * "error" = the beam line is interrupted.
   */
  variant: "not-found" | "error";
  className?: string;
}

/**
 * Static illustration for empty/error states.
 *
 * Deliberately animation-free: these pages exist to calm the visitor down,
 * and a looping graphic would do the opposite (and burn GPU on a page the
 * user is about to leave anyway).
 */
export default function StateIllustration({
  variant,
  className = "",
}: StateIllustrationProps) {
  const accent = variant === "error" ? "#f87171" : "#6e1e2e";

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Concentric field rings */}
      <circle cx="120" cy="120" r="104" stroke={accent} strokeOpacity="0.1" strokeDasharray="4 10" />
      <circle cx="120" cy="120" r="84" stroke={accent} strokeOpacity="0.16" />
      <circle cx="120" cy="120" r="62" stroke={accent} strokeOpacity="0.22" strokeDasharray="3 7" />
      <circle cx="120" cy="120" r="40" stroke={accent} strokeOpacity="0.28" />

      {/* Crosshair */}
      <path
        d="M120 4v26M120 210v26M4 120h26M210 120h26"
        stroke={accent}
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Planning grid ticks on the axes */}
      {[-64, -32, 32, 64].map((offset) => (
        <g key={offset} stroke={accent} strokeOpacity="0.2" strokeLinecap="round">
          <path d={`M${120 + offset} 112v16`} />
          <path d={`M112 ${120 + offset}h16`} />
        </g>
      ))}

      {variant === "not-found" ? (
        <>
          {/* Scan point outside the field — the target is missing */}
          <circle cx="176" cy="176" r="7" fill="none" stroke={accent} strokeWidth="1.6" />
          <circle cx="176" cy="176" r="2.6" fill={accent} />
          <path
            d="M176 176 120 120"
            stroke={accent}
            strokeOpacity="0.4"
            strokeDasharray="3 5"
          />
          <path
            d="M120 120l-10 10m20-10l-10-10"
            stroke={accent}
            strokeOpacity="0.6"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* Beam line interrupted by a fault gap */}
          <path
            d="M28 120h74M138 120h74"
            stroke={accent}
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M120 106v18"
            stroke={accent}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="120" cy="136" r="2.6" fill={accent} />
        </>
      )}
    </svg>
  );
}
