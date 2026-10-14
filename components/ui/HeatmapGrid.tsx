"use client";

import { useState } from "react";

type Palette = "brand" | "dose";

interface HeatmapGridProps {
  /** Number of columns */
  cols?: number;
  /** Number of rows */
  rows?: number;
  /** Cell size in pixels */
  cellSize?: number;
  /** Gap between cells in pixels */
  gap?: number;
  /** "brand" = single cyan hue, "dose" = treatment-planning colour wash */
  palette?: Palette;
  /** Accessible label, localised by the caller */
  label?: string;
  /** Additional className */
  className?: string;
}

/** Planning colour wash: cyan → teal → lime → amber → red */
const DOSE_STOPS: [number, number, number][] = [
  [6, 182, 212],
  [20, 184, 166],
  [132, 204, 22],
  [245, 158, 11],
  [239, 68, 68],
];

function doseColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (DOSE_STOPS.length - 1);
  const i = Math.min(DOSE_STOPS.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const [r1, g1, b1] = DOSE_STOPS[i];
  const [r2, g2, b2] = DOSE_STOPS[i + 1];
  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const b = Math.round(b1 + (b2 - b1) * f);
  // Low-dose cells stay translucent so the field reads like a plan overlay
  const alpha = 0.18 + clamped * 0.75;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/**
 * Hover support is probed once — touch devices skip the highlight
 * entirely instead of paying a re-render per tap.
 */
let hoverSupport: boolean | null = null;
function canHover(): boolean {
  if (hoverSupport === null) {
    hoverSupport =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches;
  }
  return hoverSupport;
}

/**
 * Heatmap grid used as an isodose / dose-distribution visualization.
 *
 * The field is the sum of two soft gaussian "targets" so it reads like a
 * real plan instead of a perfect bullseye. Cells react to the cursor on
 * hover-capable devices only; everything is pure CSS transitions, so the
 * component stays GPU-friendly and free of animation loops.
 */
export default function HeatmapGrid({
  cols = 12,
  rows = 8,
  cellSize = 12,
  gap = 3,
  palette = "brand",
  label = "Dose distribution heatmap",
  className = "",
}: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Two target volumes — primary centred, boost off-centre
    const sigma1 = Math.min(cols, rows) * 0.28;
    const sigma2 = Math.min(cols, rows) * 0.16;
    const primary = Math.exp(
      -(((col - cols * 0.5) ** 2 + (row - rows * 0.48) ** 2) /
        (2 * sigma1 * sigma1))
    );
    const boost =
      0.75 *
      Math.exp(
        -(((col - cols * 0.66) ** 2 + (row - rows * 0.62) ** 2) /
          (2 * sigma2 * sigma2))
      );
    const value = Math.min(1, primary + boost);

    return { index: i, value };
  });

  function cellColor(index: number): string {
    const value = cells[index].value;

    if (palette === "dose") {
      if (hoveredCell === null) return doseColor(value);
      const hoverRow = Math.floor(hoveredCell / cols);
      const hoverCol = hoveredCell % cols;
      const row = Math.floor(index / cols);
      const col = index % cols;
      const dist = Math.hypot(row - hoverRow, col - hoverCol);
      if (dist === 0) return doseColor(1);
      if (dist <= 2) return doseColor(Math.min(1, value + (0.7 - dist * 0.2)));
      return doseColor(value * 0.55);
    }

    if (hoveredCell === null) return `rgba(194, 55, 31, ${0.15 + value * 0.75})`;
    const hoverRow = Math.floor(hoveredCell / cols);
    const hoverCol = hoveredCell % cols;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const dist = Math.hypot(row - hoverRow, col - hoverCol);
    if (dist === 0) return "rgba(194, 55, 31, 1)";
    if (dist <= 2) return `rgba(194, 55, 31, ${0.7 - dist * 0.2})`;
    return `rgba(194, 55, 31, ${0.15 + value * 0.75})`;
  }

  return (
    <div
      className={`inline-grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap: `${gap}px`,
      }}
      role="img"
      aria-label={label}
    >
      {cells.map((cell) => (
        <div
          key={cell.index}
          className="heatmap-cell rounded-sm"
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: cellColor(cell.index),
          }}
          onMouseEnter={() => {
            if (!canHover()) return;
            setHoveredCell(cell.index);
          }}
          onMouseLeave={() => {
            if (!canHover()) return;
            setHoveredCell(null);
          }}
        />
      ))}
    </div>
  );
}

