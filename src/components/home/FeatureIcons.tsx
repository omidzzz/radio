import type { ReactNode } from "react";

/**
 * Minimal line-art icons for the features section.
 * Single-color (currentColor) so each card's gradient tints them consistently.
 */
export const featureSvgs: Record<string, ReactNode> = {
  MRI: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="h-10 w-10"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle
        cx="40"
        cy="40"
        r="30"
        strokeOpacity="0.15"
        strokeDasharray="3 5"
      />
      <circle cx="40" cy="40" r="26" strokeOpacity="0.3" />
      <circle cx="40" cy="40" r="20" strokeWidth="1.8" />
      <circle
        cx="40"
        cy="40"
        r="14"
        strokeOpacity="0.25"
        strokeDasharray="2 3"
      />
      <circle cx="40" cy="40" r="8" strokeOpacity="0.4" />
      <ellipse
        cx="40"
        cy="38"
        rx="6"
        ry="9"
        strokeOpacity="0.5"
        strokeWidth="1.2"
      />
      <path
        d="M40 16v8M40 56v8M18 40h8M54 40h8"
        strokeOpacity="0.3"
        strokeWidth="1.2"
      />
      <circle cx="40" cy="40" r="2.5" fill="currentColor" stroke="none" />
      <text
        x="40"
        y="72"
        textAnchor="middle"
        fontSize="5"
        fill="currentColor"
        fillOpacity="0.4"
        fontFamily="monospace"
        letterSpacing="0.5"
      >
        3.0T
      </text>
    </svg>
  ),
  CT: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="h-10 w-10"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle
        cx="40"
        cy="40"
        r="26"
        strokeOpacity="0.2"
        strokeDasharray="4 6"
      />
      <circle cx="40" cy="40" r="23" strokeWidth="1.8" />
      <circle cx="40" cy="40" r="14" strokeOpacity="0.35" />
      <circle cx="40" cy="40" r="9" strokeOpacity="0.5" strokeWidth="1.2" />
      <path
        d="M40 18v8M40 54v8M18 40h8M52 40h8"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      <path
        d="M28 28a16 16 0 0 1 24 0"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M28 52a16 16 0 0 0 24 0"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <circle cx="40" cy="40" r="3" fill="currentColor" stroke="none" />
      <rect
        x="33"
        y="12"
        width="14"
        height="5"
        rx="1.5"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
      <text
        x="40"
        y="72"
        textAnchor="middle"
        fontSize="5"
        fill="currentColor"
        fillOpacity="0.4"
        fontFamily="monospace"
        letterSpacing="0.5"
      >
        SLICE
      </text>
    </svg>
  ),
  US: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="h-10 w-10"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M28 18h24a4 4 0 0 1 4 4v6c0 8-4 14-8 18l-4 4a6 6 0 0 1-8 0l-4-4c-4-4-8-10-8-18v-6a4 4 0 0 1 4-4z"
        strokeLinejoin="round"
      />
      <path d="M40 12v6" strokeOpacity="0.4" strokeWidth="1.2" />
      <path d="M36 8v4M44 8v4" strokeOpacity="0.25" strokeWidth="1" />
      <path
        d="M34 32l-8 20M46 32l8 20"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M30 42h20M32 48h16M34 54h12"
        strokeOpacity="0.25"
        strokeWidth="0.8"
      />
      <circle cx="40" cy="40" r="2" fill="currentColor" stroke="none" />
      <text
        x="40"
        y="72"
        textAnchor="middle"
        fontSize="5"
        fill="currentColor"
        fillOpacity="0.4"
        fontFamily="monospace"
        letterSpacing="0.5"
      >
        DOPPLER
      </text>
    </svg>
  ),
};
