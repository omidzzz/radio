import type { ReactElement } from "react";

/**
 * Shared RadiationEmblem component.
 * Consolidates the 5 nearly-identical inline SVG emblems previously duplicated
 * across pages (about, services, booking, forum, blog) with unique
 * gradient/filter IDs. Reduces HTML payload by ~15-30KB per page.
 */
interface RadiationEmblemProps {
  variant: "atom" | "services" | "reticle" | "network" | "constellation";
  className?: string;
}

const STYLES = `
@keyframes re-orbit-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes re-orbit-medium { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@keyframes re-orbit-fast { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes re-pulse-core { 0%, 100% { opacity: 0.9; transform: scale(1); } 50% { opacity: 1; transform: scale(1.07); } }
@keyframes re-pulse-halo { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.15); } }
@keyframes re-dash-spin { to { stroke-dashoffset: -160; } }
@keyframes re-particle { 0%, 100% { opacity: 0.5; transform: translate(0,0); } 25% { opacity: 1; transform: translate(4px,-5px); } 50% { opacity: 0.7; transform: translate(-3px,4px); } 75% { opacity: 1; transform: translate(5px,2px); } }
@keyframes re-electron { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
@keyframes re-float { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(3px, -6px); } 50% { transform: translate(-4px, 4px); } 75% { transform: translate(5px, 2px); } }
@keyframes re-node-pulse { 0%, 100% { opacity: 0.75; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } }
@keyframes re-dash-flow { to { stroke-dashoffset: -120; } }
@keyframes re-marker-pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

.re-orbit-1 { animation: re-orbit-slow 32s linear infinite; transform-origin: 340px 340px; }
.re-orbit-2 { animation: re-orbit-medium 24s linear infinite; transform-origin: 340px 340px; }
.re-orbit-3 { animation: re-orbit-fast 18s linear infinite; transform-origin: 340px 340px; }
.re-core-pulse { animation: re-pulse-core 4s ease-in-out infinite; transform-origin: 340px 340px; }
.re-halo-pulse { animation: re-pulse-halo 5s ease-in-out infinite; transform-origin: 340px 340px; }
.re-dash-spin { animation: re-dash-spin 20s linear infinite; }
.re-particle { animation: re-particle 7s ease-in-out infinite; }
.re-electron { animation: re-electron 3s ease-in-out infinite; }
.re-float { animation: re-float 7.5s ease-in-out infinite; }
.re-node-pulse { animation: re-node-pulse 3.2s ease-in-out infinite; }
.re-dash-flow { animation: re-dash-flow 16s linear infinite; }
.re-marker-pulse { animation: re-marker-pulse 2.5s ease-in-out infinite; }
`;

function CoreNucleus() {
  return (
    <g className="re-core-pulse">
      <circle cx="340" cy="340" r="66" fill="url(#re-coreGlow)" filter="url(#re-blurS)" />
      <circle cx="340" cy="340" r="46" fill="none" stroke="rgb(8,51,68)" strokeWidth="6" opacity="0.5" />
      <circle cx="340" cy="340" r="46" fill="none" stroke="rgb(76,155,122)" strokeWidth="1.2" opacity="0.9" />
      <circle cx="340" cy="340" r="34" fill="rgb(20,92,65)" opacity="0.95" />
      <circle cx="340" cy="340" r="34" fill="none" stroke="rgb(165,243,252)" strokeWidth="0.6" opacity="0.75" />
      <circle cx="340" cy="340" r="18" fill="rgb(147,211,183)" />
      <circle cx="340" cy="340" r="8" fill="rgb(240,253,255)" />
      <circle cx="340" cy="340" r="3" fill="white" />
    </g>
  );
}

function Particles() {
  return (
    <g fill="rgb(239,234,219)" opacity="0.8">
      <circle cx="316" cy="322" r="2" className="re-particle" />
      <circle cx="364" cy="326" r="1.6" className="re-particle" style={{ animationDelay: "1.2s" }} />
      <circle cx="352" cy="360" r="1.8" className="re-particle" style={{ animationDelay: "2.4s" }} />
      <circle cx="324" cy="356" r="1.5" className="re-particle" style={{ animationDelay: "0.8s" }} />
      <circle cx="340" cy="308" r="1.4" className="re-particle" style={{ animationDelay: "3.1s" }} />
    </g>
  );
}

function BaseRings() {
  return (
    <>
      <circle cx="340" cy="340" r="310" stroke="rgb(76,155,122)" strokeWidth="0.5" opacity="0.18" />
      <circle cx="340" cy="340" r="310" stroke="rgb(147,211,183)" strokeWidth="0.6" opacity="0.3" strokeDasharray="2 10" strokeLinecap="round" className="re-dash-spin" />
      <circle cx="340" cy="340" r="275" stroke="rgb(15,74,53)" strokeWidth="0.5" opacity="0.28" strokeDasharray="6 8" className="re-dash-spin" style={{ animationDuration: "30s" }} />
      <circle cx="340" cy="340" r="235" stroke="rgb(76,155,122)" strokeWidth="0.7" opacity="0.35" />
      <circle cx="340" cy="340" r="190" stroke="rgb(20,92,65)" strokeWidth="0.5" opacity="0.22" />
      <circle cx="340" cy="340" r="155" fill="url(#re-haloGlow)" filter="url(#re-blurM)" className="re-halo-pulse" />
    </>
  );
}

function AtomEmblem() {
  return (
    <>
      <rect x="0" y="0" width="680" height="680" fill="url(#re-bgGlow)" />
      <g stroke="rgb(15,74,53)" strokeWidth="0.5" opacity="0.16">
        <line x1="340" y1="30" x2="340" y2="650" />
        <line x1="30" y1="340" x2="650" y2="340" />
        <line x1="90" y1="90" x2="590" y2="590" />
        <line x1="590" y1="90" x2="90" y2="590" />
      </g>
      <BaseRings />
      <g className="re-orbit-1" opacity="0.85">
        <ellipse cx="340" cy="340" rx="255" ry="95" stroke="url(#re-cyan)" strokeWidth="1.2" opacity="0.55" transform="rotate(15 340 340)" />
        <circle cx="340" cy="85" r="6" fill="rgb(165,243,252)" className="re-electron" filter="url(#re-blurS)" />
        <circle cx="340" cy="595" r="4.5" fill="rgb(147,211,183)" className="re-electron" opacity="0.8" />
      </g>
      <g className="re-orbit-2" opacity="0.85">
        <ellipse cx="340" cy="340" rx="255" ry="95" stroke="url(#re-cyan)" strokeWidth="1.1" opacity="0.5" transform="rotate(-28 340 340)" />
        <circle cx="565" cy="340" r="5.5" fill="rgb(165,243,252)" className="re-electron" filter="url(#re-blurS)" />
        <circle cx="115" cy="340" r="4" fill="rgb(147,211,183)" className="re-electron" opacity="0.75" />
      </g>
      <g className="re-orbit-3" opacity="0.8">
        <ellipse cx="340" cy="340" rx="255" ry="95" stroke="url(#re-amber)" strokeWidth="1" opacity="0.45" transform="rotate(68 340 340)" />
        <circle cx="480" cy="180" r="5" fill="rgb(253,230,138)" className="re-electron" filter="url(#re-blurS)" />
      </g>
      <g className="re-orbit-1" opacity="0.75">
        <ellipse cx="340" cy="340" rx="210" ry="75" stroke="rgb(76,155,122)" strokeWidth="0.9" opacity="0.4" transform="rotate(105 340 340)" />
        <circle cx="200" cy="480" r="4.2" fill="rgb(165,243,252)" className="re-electron" />
      </g>
      <g opacity="0.5">
        <ellipse cx="340" cy="340" rx="160" ry="55" stroke="rgb(147,211,183)" strokeWidth="0.7" transform="rotate(40 340 340)" />
        <ellipse cx="340" cy="340" rx="160" ry="55" stroke="rgb(20,92,65)" strokeWidth="0.6" transform="rotate(-50 340 340)" />
      </g>
      <g stroke="rgb(76,155,122)" strokeWidth="1" opacity="0.5">
        <line x1="340" y1="28" x2="340" y2="58" />
        <line x1="340" y1="622" x2="340" y2="652" />
        <line x1="28" y1="340" x2="58" y2="340" />
        <line x1="622" y1="340" x2="652" y2="340" />
      </g>
      <CoreNucleus />
      <Particles />
    </>
  );
}

function ServicesEmblem() {
  return (
    <>
      <rect x="0" y="0" width="680" height="680" fill="url(#re-bgGlow)" />
      <g stroke="rgb(15,74,53)" strokeWidth="0.5" opacity="0.16">
        <line x1="340" y1="30" x2="340" y2="650" />
        <line x1="30" y1="340" x2="650" y2="340" />
      </g>
      <BaseRings />
      <g className="re-orbit-1" opacity="0.85">
        <ellipse cx="340" cy="340" rx="255" ry="95" stroke="url(#re-cyan)" strokeWidth="1.2" opacity="0.55" transform="rotate(15 340 340)" />
        <circle cx="340" cy="85" r="6" fill="rgb(165,243,252)" className="re-electron" filter="url(#re-blurS)" />
      </g>
      <g className="re-orbit-2" opacity="0.85">
        <ellipse cx="340" cy="340" rx="255" ry="95" stroke="url(#re-cyan)" strokeWidth="1.1" opacity="0.5" transform="rotate(-28 340 340)" />
        <circle cx="565" cy="340" r="5.5" fill="rgb(165,243,252)" className="re-electron" filter="url(#re-blurS)" />
      </g>
      <g className="re-orbit-3" opacity="0.8">
        <ellipse cx="340" cy="340" rx="255" ry="95" stroke="url(#re-amber)" strokeWidth="1" opacity="0.45" transform="rotate(68 340 340)" />
        <circle cx="480" cy="180" r="5" fill="rgb(253,230,138)" className="re-electron" filter="url(#re-blurS)" />
      </g>
      <CoreNucleus />
      <Particles />
    </>
  );
}

function ReticleEmblem() {
  return (
    <>
      <rect x="0" y="0" width="680" height="680" fill="url(#re-bgGlow)" />
      <circle cx="340" cy="340" r="310" stroke="rgb(76,155,122)" strokeWidth="0.5" opacity="0.18" />
      <circle cx="340" cy="340" r="310" stroke="rgb(147,211,183)" strokeWidth="0.6" opacity="0.28" strokeDasharray="3 12" strokeLinecap="round" className="re-dash-spin" />
      <circle cx="340" cy="340" r="270" stroke="rgb(15,74,53)" strokeWidth="0.5" opacity="0.25" strokeDasharray="8 10" className="re-dash-spin" style={{ animationDuration: "26s" }} />
      <circle cx="340" cy="340" r="160" fill="url(#re-haloGlow)" filter="url(#re-blurM)" className="re-halo-pulse" />
      <circle cx="340" cy="340" r="230" stroke="url(#re-cyan)" strokeWidth="1.2" opacity="0.55" />
      <circle cx="340" cy="340" r="185" stroke="rgb(76,155,122)" strokeWidth="0.9" opacity="0.45" />
      <circle cx="340" cy="340" r="140" stroke="url(#re-amber)" strokeWidth="1.1" opacity="0.5" />
      <circle cx="340" cy="340" r="95" stroke="rgb(147,211,183)" strokeWidth="1.4" opacity="0.6" />
      <g className="re-orbit-1" opacity="0.7">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line key={deg} x1="340" y1="48" x2="340" y2="68" stroke="rgb(147,211,183)" strokeWidth="1.5" transform={`rotate(${deg} 340 340)`} />
        ))}
      </g>
      <g className="re-orbit-2" opacity="0.8">
        <circle cx="340" cy="110" r="5" fill="rgb(165,243,252)" className="re-marker-pulse" filter="url(#re-blurS)" />
        <circle cx="570" cy="340" r="4.5" fill="rgb(147,211,183)" className="re-marker-pulse" />
        <circle cx="340" cy="570" r="5" fill="rgb(165,243,252)" className="re-marker-pulse" filter="url(#re-blurS)" />
        <circle cx="110" cy="340" r="4.5" fill="rgb(147,211,183)" className="re-marker-pulse" />
      </g>
      <g className="re-orbit-3" opacity="0.65">
        <path d="M 340 200 A 140 140 0 0 1 480 340" fill="none" stroke="url(#re-cyan)" strokeWidth="2" strokeLinecap="round" />
        <path d="M 340 480 A 140 140 0 0 1 200 340" fill="none" stroke="url(#re-amber)" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <g stroke="rgb(76,155,122)" strokeWidth="1" opacity="0.5">
        <line x1="340" y1="70" x2="340" y2="120" />
        <line x1="340" y1="560" x2="340" y2="610" />
        <line x1="70" y1="340" x2="120" y2="340" />
        <line x1="560" y1="340" x2="610" y2="340" />
      </g>
      <g stroke="rgb(76,155,122)" strokeWidth="1.5" opacity="0.55" fill="none">
        <path d="M 160 160 L 160 200 M 160 160 L 200 160" />
        <path d="M 520 160 L 520 200 M 520 160 L 480 160" />
        <path d="M 160 520 L 160 480 M 160 520 L 200 520" />
        <path d="M 520 520 L 520 480 M 520 520 L 480 520" />
      </g>
      <CoreNucleus />
      <Particles />
    </>
  );
}

function NetworkEmblem() {
  return (
    <>
      <rect x="0" y="0" width="680" height="680" fill="url(#re-bgGlow)" />
      <circle cx="340" cy="340" r="300" stroke="rgb(76,155,122)" strokeWidth="0.5" opacity="0.16" />
      <circle cx="340" cy="340" r="300" stroke="rgb(147,211,183)" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 11" strokeLinecap="round" className="re-dash-flow" />
      <circle cx="340" cy="340" r="250" stroke="rgb(15,74,53)" strokeWidth="0.5" opacity="0.22" />
      <circle cx="340" cy="340" r="155" fill="url(#re-haloGlow)" filter="url(#re-blurM)" className="re-halo-pulse" />
      <g stroke="url(#re-cyan)" strokeWidth="1.2" opacity="0.55" strokeLinecap="round">
        <line x1="340" y1="340" x2="180" y2="180" />
        <line x1="340" y1="340" x2="500" y2="170" />
        <line x1="340" y1="340" x2="520" y2="380" />
        <line x1="340" y1="340" x2="200" y2="480" />
        <line x1="340" y1="340" x2="160" y2="320" />
        <line x1="340" y1="340" x2="480" y2="500" />
      </g>
      <g stroke="rgb(76,155,122)" strokeWidth="0.7" opacity="0.3" strokeDasharray="4 6" className="re-dash-flow">
        <line x1="180" y1="180" x2="500" y2="170" />
        <line x1="500" y1="170" x2="520" y2="380" />
        <line x1="200" y1="480" x2="480" y2="500" />
        <line x1="160" y1="320" x2="180" y2="180" />
      </g>
      {[
        { cx: 180, cy: 180, r: 28, delay: "0s", amber: false },
        { cx: 500, cy: 170, r: 24, delay: "1.2s", amber: true },
        { cx: 520, cy: 380, r: 26, delay: "2.1s", amber: false },
        { cx: 480, cy: 500, r: 22, delay: "0.7s", amber: true },
        { cx: 200, cy: 480, r: 25, delay: "1.8s", amber: false },
        { cx: 160, cy: 320, r: 23, delay: "2.6s", amber: false },
      ].map((node) => (
        <g key={`${node.cx}-${node.cy}`} className="re-float" style={{ animationDelay: node.delay }}>
          <circle cx={node.cx} cy={node.cy} r={node.r} fill="rgb(8,51,68)" opacity="0.55" />
          <circle cx={node.cx} cy={node.cy} r={node.r} fill="none" stroke={node.amber ? "url(#re-amber)" : "url(#re-cyan)"} strokeWidth="1.4" opacity="0.75" />
          <circle cx={node.cx} cy={node.cy} r={node.r * 0.5} fill={node.amber ? "rgb(245,158,11)" : "rgb(76,155,122)"} opacity="0.85" className="re-node-pulse" />
          <circle cx={node.cx} cy={node.cy} r={node.r * 0.2} fill={node.amber ? "rgb(253,230,138)" : "rgb(165,243,252)"} />
        </g>
      ))}
      <CoreNucleus />
      <Particles />
    </>
  );
}

function ConstellationEmblem() {
  return (
    <>
      <rect x="0" y="0" width="680" height="680" fill="url(#re-bgGlow)" />
      <circle cx="340" cy="340" r="305" stroke="rgb(76,155,122)" strokeWidth="0.5" opacity="0.16" />
      <circle cx="340" cy="340" r="305" stroke="rgb(147,211,183)" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 12" strokeLinecap="round" className="re-dash-flow" />
      <circle cx="340" cy="340" r="255" stroke="rgb(15,74,53)" strokeWidth="0.5" opacity="0.22" />
      <circle cx="340" cy="340" r="150" fill="url(#re-haloGlow)" filter="url(#re-blurM)" className="re-halo-pulse" />
      <g stroke="url(#re-cyan)" strokeWidth="1.1" opacity="0.5" strokeLinecap="round">
        <line x1="340" y1="340" x2="175" y2="175" />
        <line x1="340" y1="340" x2="505" y2="160" />
        <line x1="340" y1="340" x2="530" y2="370" />
        <line x1="340" y1="340" x2="190" y2="490" />
        <line x1="340" y1="340" x2="150" y2="330" />
        <line x1="340" y1="340" x2="490" y2="510" />
      </g>
      <g stroke="rgb(76,155,122)" strokeWidth="0.6" opacity="0.28" strokeDasharray="4 7" className="re-dash-flow">
        <line x1="175" y1="175" x2="505" y2="160" />
        <line x1="505" y1="160" x2="530" y2="370" />
        <line x1="190" y1="490" x2="490" y2="510" />
      </g>
      {[
        { x: 145, y: 145, w: 60, h: 72, delay: "0s", amber: false },
        { x: 475, y: 130, w: 55, h: 66, delay: "1.1s", amber: true },
        { x: 500, y: 340, w: 58, h: 70, delay: "2s", amber: false },
        { x: 460, y: 480, w: 52, h: 62, delay: "0.6s", amber: true },
        { x: 160, y: 460, w: 56, h: 68, delay: "1.7s", amber: false },
        { x: 120, y: 300, w: 54, h: 66, delay: "2.5s", amber: false },
      ].map((doc) => (
        <g key={`${doc.x}-${doc.y}`} className="re-float" style={{ animationDelay: doc.delay }}>
          <rect x={doc.x} y={doc.y} width={doc.w} height={doc.h} rx="5" fill="rgb(8,51,68)" opacity="0.65" />
          <rect x={doc.x} y={doc.y} width={doc.w} height={doc.h} rx="5" fill="none" stroke={doc.amber ? "url(#re-amber)" : "url(#re-cyan)"} strokeWidth="1.4" opacity="0.8" />
          <line x1={doc.x + 12} y1={doc.y + 20} x2={doc.x + doc.w - 12} y2={doc.y + 20} stroke={doc.amber ? "rgb(253,230,138)" : "rgb(147,211,183)"} strokeWidth="1.1" opacity="0.55" />
          <line x1={doc.x + 12} y1={doc.y + 33} x2={doc.x + doc.w - 12} y2={doc.y + 33} stroke={doc.amber ? "rgb(253,230,138)" : "rgb(147,211,183)"} strokeWidth="1.1" opacity="0.4" />
          <circle cx={doc.x + doc.w / 2} cy={doc.y + doc.h - 12} r="4.5" fill={doc.amber ? "rgb(245,158,11)" : "rgb(76,155,122)"} className="re-node-pulse" />
        </g>
      ))}
      <CoreNucleus />
      <Particles />
    </>
  );
}

const VARIANTS: Record<
  RadiationEmblemProps["variant"],
  () => ReactElement
> = {
  atom: AtomEmblem,
  services: ServicesEmblem,
  reticle: ReticleEmblem,
  network: NetworkEmblem,
  constellation: ConstellationEmblem,
};

export default function RadiationEmblem({ variant, className = "" }: RadiationEmblemProps) {
  const Emblem = VARIANTS[variant];

  return (
    <svg
      viewBox="0 0 680 680"
      className={`relative h-full w-full ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="re-bgGlow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgb(6,42,51)" stopOpacity="0.55" />
          <stop offset="55%" stopColor="rgb(4,26,32)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="re-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(147,211,183)" stopOpacity="0.9" />
          <stop offset="50%" stopColor="rgb(76,155,122)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="rgb(20,92,65)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="re-amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(253,230,138)" stopOpacity="0.85" />
          <stop offset="60%" stopColor="rgb(245,158,11)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgb(180,83,9)" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="re-coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="1" />
          <stop offset="18%" stopColor="rgb(239,234,219)" stopOpacity="1" />
          <stop offset="45%" stopColor="rgb(76,155,122)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="rgb(15,74,53)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="re-haloGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(76,155,122)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="rgb(76,155,122)" stopOpacity="0" />
        </radialGradient>
        <filter id="re-blurS" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="re-blurM" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="re-softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{STYLES}</style>
      </defs>
      <Emblem />
    </svg>
  );
}