/**
 * Shared shaped wave divider used at the bottom of every hero slide,
 * so all slides transition into the page background identically.
 * Features a multi-layered wave with subtle energy-line accents.
 */
export default function HeroBottomDivider() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 leading-[0]">
      <svg
        className="relative block h-[70px] w-full sm:h-[90px] lg:h-[110px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0"/>
            <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.2"/>
            <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.3"/>
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Background fill wave */}
        <path
          fill="var(--color-bg)"
          d="M0,85 C180,65 360,105 540,90 C720,75 900,50 1080,78 C1260,106 1380,70 1440,68 L1440,120 L0,120 Z"
        />
        {/* Secondary subtle wave layer */}
        <path
          fill="var(--color-bg)"
          opacity="0.6"
          d="M0,90 C160,72 340,98 520,86 C700,74 880,58 1060,82 C1240,106 1360,76 1440,72 L1440,120 L0,120 Z"
        />
        {/* Energy line accent */}
        <path
          fill="none"
          stroke="url(#wave-accent)"
          strokeWidth="1.5"
          d="M0,85 C180,65 360,105 540,90 C720,75 900,50 1080,78 C1260,106 1380,70 1440,68"
        />
        {/* Subtle dose tick at center */}
        <circle cx="720" cy="82" r="2" fill="#22d3ee" opacity="0.4"/>
      </svg>
    </div>
  );
}