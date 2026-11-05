/**
 * Shared ParticleBackground component.
 * Consolidates the identical 5-circle particle SVG patterns previously
 * duplicated across about, services, booking, forum, blog, and contact pages
 * with unique pattern IDs (particles, particles-blog, particles-services, etc).
 */
interface ParticleBackgroundProps {
  /** Unique pattern ID to prevent collisions when multiple instances render */
  id?: string;
  className?: string;
  opacity?: number;
}

export default function ParticleBackground({
  id = "particles",
  className = "",
  opacity = 0.12,
}: ParticleBackgroundProps) {
  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          {/* Primary particles — varied sizes for depth */}
          <circle cx="15" cy="20" r="1" fill="currentColor" className="text-primary" />
          <circle cx="60" cy="45" r="0.6" fill="currentColor" className="text-primary" />
          <circle cx="85" cy="12" r="0.8" fill="currentColor" className="text-secondary" />
          <circle cx="35" cy="80" r="0.5" fill="currentColor" className="text-primary" />
          <circle cx="92" cy="70" r="0.7" fill="currentColor" className="text-secondary" />
          <circle cx="50" cy="50" r="0.4" fill="currentColor" className="text-primary" />
          <circle cx="10" cy="60" r="0.6" fill="currentColor" className="text-primary" />
          <circle cx="75" cy="90" r="0.5" fill="currentColor" className="text-secondary" />
          {/* Subtle connecting lines for network effect */}
          <line x1="15" y1="20" x2="60" y2="45" stroke="currentColor" className="text-primary" strokeWidth="0.2" opacity="0.3" />
          <line x1="60" y1="45" x2="85" y2="12" stroke="currentColor" className="text-secondary" strokeWidth="0.15" opacity="0.2" />
          <line x1="35" y1="80" x2="50" y2="50" stroke="currentColor" className="text-primary" strokeWidth="0.2" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
