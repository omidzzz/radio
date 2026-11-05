import ParticleBackground from "@/components/ui/ParticleBackground";

interface AmbientBackgroundProps {
  /** Unique id for the particle canvas instance */
  particleId?: string;
  /** Class applied to the particle layer (e.g. "text-muted") */
  particleClassName?: string;
  /** Class applied to the wrapper element */
  className?: string;
  /** Hide the third (centre) orb — used by simpler legal pages */
  hideCenterOrb?: boolean;
  /** Promote the orbs to their own compositor layer (translateZ) */
  promoteLayers?: boolean;
  /** Hide the centre orb on small screens (md:block) */
  centerOrbDesktopOnly?: boolean;
}

/**
 * Shared ambient background field used at the top of every inner page.
 * Renders three blurred colour orbs plus an optional particle layer
 * behind the page content.
 */
export default function AmbientBackground({
  particleId,
  particleClassName,
  className = "",
  hideCenterOrb = false,
  promoteLayers = false,
  centerOrbDesktopOnly = false,
}: AmbientBackgroundProps) {
  const layer = promoteLayers ? " [transform:translateZ(0)]" : "";
  const centerVisibility = centerOrbDesktopOnly ? " hidden md:block" : "";

  return (
    <div className={`pointer-events-none fixed inset-0 z-0 ${className}`.trim()}>
      <div
        className={`absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]${layer}`}
      />
      <div
        className={`absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]${layer}`}
      />
      {!hideCenterOrb && (
        <div
          className={`absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]${layer}${centerVisibility}`}
        />
      )}
      {particleId ? (
        <ParticleBackground id={particleId} className={particleClassName} />
      ) : null}
    </div>
  );
}