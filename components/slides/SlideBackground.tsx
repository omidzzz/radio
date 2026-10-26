/**
 * SlideBackground — composable background layer for hero slides.
 *
 * Renders a non-unified background stack inside the parent section.
 * All layers are theme-aware via CSS custom properties and pointer-events-none,
 * so they never block interaction with content placed above them.
 *
 * Stack (back → front):
 *   A. Base band      — hero-palette-bg radial-gradient field (theme-aware)
 *   B. Accent blocks  — shared curve and frame, plus variant-specific chips
 *   C. Texture tags   — SVG patterns, rings, orbs, scan-line (variant-specific)
 *
 * Variants:
 *   "planning" — Clinical / structured. Left curved band + corner chips +
 *                trefoil + planning grid. Feels like a treatment workstation.
 *   "care"     — Warm / human. Bottom strip tag + floating orbs + corner
 *                gold accents. Feels patient-centric.
 *   "hud"      — Darkroom high-tech. Corner L-frames + glow rings +
 *                scan-line tag. Dramatic in dark mode.
 *
 * Usage (inside an existing <section>):
 *   <SlideBackground variant="planning" />
 *   <CursorGlow />
 *   { slide content goes here }
 */
import PlanningBand from "./PlanningBand";
import TagChip from "./TagChip";
import HUDOverlay from "./HUDOverlay";

interface SlideBackgroundProps {
  variant?: "planning" | "care" | "hud";
  className?: string;
}

export default function SlideBackground({
  variant = "planning",
  className = "",
}: SlideBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 ${className}`.trim()}
      aria-hidden="true"
    >
      {/* ─── A. Base band ─────────────────────────────────────────────── */}
      <div className="hero-palette-bg anim-fade-in absolute inset-0" />

      {/* Shared green-and-ivory edge and corner frame across every slide. */}
      <PlanningBand width="w-[18%]" />
      <div className="slide-frame absolute inset-6 z-10 hidden pointer-events-none lg:block" aria-hidden="true">
        <span className="slide-frame-corner slide-frame-top-left" />
        <span className="slide-frame-corner slide-frame-top-right" />
        <span className="slide-frame-corner slide-frame-bottom-left" />
        <span className="slide-frame-corner slide-frame-bottom-right" />
        <span className="slide-frame-rule slide-frame-rule-top" />
        <span className="slide-frame-rule slide-frame-rule-bottom" />
      </div>

      {/* ─── B. Accent blocks (variant-specific) ──────────────────────── */}
      {variant === "planning" && (
        <>
          {/* Corner tag chips — semantic labels */}
          <TagChip variant="gold" size="sm" className="absolute z-30 top-6 left-6">
            IMRT
          </TagChip>
          <TagChip variant="gold" size="sm" className="absolute z-30 top-6 left-[18%]">
            6 MV
          </TagChip>
        </>
      )}

      {variant === "care" && (
        <>
          {/* Top-left corner chip */}
          <TagChip variant="surface" size="sm" className="absolute z-30 top-6 left-6">
            CARE
          </TagChip>
        </>
      )}

      {variant === "hud" && (
        <>
          {/* Corner L-frame tags — top-left & bottom-right */}
          <div className="absolute top-0 left-0 h-[120px] w-[2px] bg-slate-300/40 dark:bg-primary/50 hidden lg:block" />
          <div className="absolute top-0 left-0 h-[2px] w-[120px] bg-slate-300/40 dark:bg-primary/50 hidden lg:block" />
          <div className="absolute bottom-0 right-0 h-[120px] w-[2px] bg-slate-300/40 dark:bg-primary/50 hidden lg:block" />
          <div className="absolute bottom-0 right-0 h-[2px] w-[120px] bg-slate-300/40 dark:bg-primary/50 hidden lg:block" />
        </>
      )}

      {/* ─── C. Texture tags (variant-specific) ───────────────────────── */}
      <HUDOverlay
        grid={variant === "planning"}
        rings={variant === "planning" || variant === "hud"}
        scanLine={variant === "hud"}
        orbs={variant === "care"}
        trefoil={variant === "planning"}
      />
    </div>
  );
}
