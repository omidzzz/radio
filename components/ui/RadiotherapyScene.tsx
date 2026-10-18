"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Pulse {
  id: number;
  xPct: number;
  yPct: number;
}

interface BeamPulse {
  id: number;
  progress: number;
}

export default function RadiotherapyScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseIdRef = useRef(0);
  const beamPulseIdRef = useRef(0);
  const fireTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beamPulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hot, setHot] = useState(false);
  const [firing, setFiring] = useState(false);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [beamPulses, setBeamPulses] = useState<BeamPulse[]>([]);
  const [mu, setMu] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (firing) {
      const id = setInterval(() => {
        setMu((m) => Math.min(m + Math.floor(20 + Math.random() * 30), 9999));
      }, 200);
      return () => clearInterval(id);
    }
    return undefined;
  }, [firing]);

  useEffect(() => {
    if (firing) {
      beamPulseIntervalRef.current = setInterval(() => {
        const id = ++beamPulseIdRef.current;
        setBeamPulses((prev) => [...prev, { id, progress: 0 }]);
        let progress = 0;
        const animInterval = setInterval(() => {
          progress += 2;
          setBeamPulses((prev) =>
            prev.map((p) => (p.id === id ? { ...p, progress } : p)),
          );
          if (progress >= 100) {
            clearInterval(animInterval);
            setBeamPulses((prev) => prev.filter((p) => p.id !== id));
          }
        }, 30);
      }, 400);
      return () => {
        if (beamPulseIntervalRef.current) {
          clearInterval(beamPulseIntervalRef.current);
        }
      };
    }
    return undefined;
  }, [firing]);

  useEffect(() => {
    return () => {
      if (fireTimeoutRef.current) clearTimeout(fireTimeoutRef.current);
      if (beamPulseIntervalRef.current)
        clearInterval(beamPulseIntervalRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - py) * 8, ry: (px - 0.5) * 12 });
    setPointer({ x: px * 100, y: py * 100 });
  }, []);

  const handleEnter = useCallback(() => setHot(true), []);
  const handleLeave = useCallback(() => {
    setHot(false);
    setPointer(null);
    setTilt({ rx: 0, ry: 0 });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const id = ++pulseIdRef.current;
    setPulses((p) => [...p, { id, xPct, yPct }]);
    setTimeout(() => {
      setPulses((p) => p.filter((pulse) => pulse.id !== id));
    }, 1000);

    setFiring(true);
    setMu(0);
    if (fireTimeoutRef.current) clearTimeout(fireTimeoutRef.current);
    fireTimeoutRef.current = setTimeout(() => {
      setFiring(false);
      setBeamPulses([]);
    }, 1200);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const gantryAngle = String(Math.round((elapsed * 4.5) % 360)).padStart(
    3,
    "0",
  );
  const collimatorAngle = String(Math.round((elapsed * 2.7) % 360)).padStart(
    3,
    "0",
  );
  const coordX = pointer
    ? String(Math.round(pointer.x)).padStart(2, "0")
    : "--";
  const coordY = pointer
    ? String(Math.round(pointer.y)).padStart(2, "0")
    : "--";

  const px = pointer ? pointer.x / 100 - 0.5 : 0;
  const py = pointer ? pointer.y / 100 - 0.5 : 0;

  const getWavefrontRadius = (progress: number) => 8 + (progress / 100) * 80;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className="relative h-72 w-full cursor-crosshair select-none overflow-hidden bg-[#050d12] sm:h-96 lg:h-full lg:min-h-[420px]"
      style={{ perspective: "1200px" }}
    >
      {/* === BACKGROUND === */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(26,115,82,0.15),transparent_55%),radial-gradient(ellipse_at_80%_85%,rgba(139,92,246,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050d12] via-[#071520] to-[#0a1a24]" />
      <div className="absolute bottom-0 left-1/2 h-1/3 w-3/4 -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(26,115,82,0.06),transparent)]" />

      {/* Parallax grid */}
      <div
        className="absolute -inset-8 opacity-[0.06] transition-transform duration-300 ease-out"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          transform: `translate(${-px * 14}px, ${-py * 14}px)`,
        }}
      />

      {/* Ambient glow blobs */}
      <div
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-[100px] transition-transform duration-300 ease-out"
        style={{ transform: `translate(${px * 18}px, ${py * 18}px)` }}
      />
      <div
        className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-secondary/15 blur-[120px] transition-transform duration-300 ease-out"
        style={{ transform: `translate(${px * 22}px, ${py * 22}px)` }}
      />

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Scanning sweep */}
      <div className="pointer-events-none absolute -left-1/3 inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/12 to-transparent mix-blend-screen sweep" />

      {/* Corner HUD brackets */}
      {[
        "left-3 top-3 border-l border-t",
        "right-3 top-3 border-r border-t",
        "left-3 bottom-3 border-l border-b",
        "right-3 bottom-3 border-r border-b",
      ].map((pos) => (
        <div
          key={pos}
          className={`pointer-events-none absolute h-5 w-5 border-primary/30 ${pos}`}
        />
      ))}

      {/* ===== 3D SCENE ===== */}
      <div
        className="relative h-full w-full transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <svg
          viewBox="0 0 500 360"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          <defs>
            {/* === METALLIC GRADIENTS === */}
            <linearGradient id="metalDark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a4a" />
              <stop offset="50%" stopColor="#0f2a38" />
              <stop offset="100%" stopColor="#081a24" />
            </linearGradient>
            <linearGradient id="metalMid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2a4a5a" />
              <stop offset="50%" stopColor="#1a3a48" />
              <stop offset="100%" stopColor="#0a2a38" />
            </linearGradient>
            <linearGradient id="metalLight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a7a8a" />
              <stop offset="50%" stopColor="#2a5a6a" />
              <stop offset="100%" stopColor="#1a3a48" />
            </linearGradient>
            <linearGradient id="gantryGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a8a9a" />
              <stop offset="30%" stopColor="#1a5a6a" />
              <stop offset="70%" stopColor="#0a3a48" />
              <stop offset="100%" stopColor="#062a34" />
            </linearGradient>
            <linearGradient id="couchGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8a9aaa" />
              <stop offset="40%" stopColor="#5a6a7a" />
              <stop offset="100%" stopColor="#3a4a5a" />
            </linearGradient>
            <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>

            {/* === PATIENT PHANTOM GRADIENTS === */}
            <linearGradient id="phantomBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a7a8a" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#2a4a5a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#132832" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="phantomGown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fb4c2" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2a4a5a" stopOpacity="0.22" />
            </linearGradient>
            <radialGradient id="phantomHead" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#6f9aab" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#2f5566" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#132832" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="isodoseCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>

            {/* === GLOW FILTERS === */}
            <radialGradient id="isocenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5fd3a6" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#4c9b7a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4c9b7a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="strongGlow"
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="beamGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="dropShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="2"
                dy="4"
                stdDeviation="4"
                floodColor="#000"
                floodOpacity="0.5"
              />
            </filter>

            {/* === CARBON FIBER PATTERN === */}
            <pattern
              id="carbon"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill="#3a4a5a" />
              <path
                d="M0 0 L8 8 M8 0 L0 8"
                stroke="#4a5a6a"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
              <circle cx="4" cy="4" r="1.5" fill="#2a3a4a" fillOpacity="0.5" />
            </pattern>

            {/* === IMMOBILISATION MASK MESH PATTERN === */}
            <pattern
              id="maskMesh"
              width="4.5"
              height="4.5"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(20)"
            >
              <rect width="4.5" height="4.5" fill="transparent" />
              <circle
                cx="2.25"
                cy="2.25"
                r="1.7"
                fill="none"
                stroke="#bff3ff"
                strokeOpacity="0.35"
                strokeWidth="0.35"
              />
            </pattern>

            {/* === SCAN CONTOUR PATTERN (body digitisation) === */}
            <pattern
              id="scanContours"
              width="10"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="3"
                x2="10"
                y2="3"
                stroke="#5fd3a6"
                strokeOpacity="0.15"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>

          {/* === FLOOR / BASE === */}
          <ellipse
            cx="250"
            cy="300"
            rx="190"
            ry="18"
            fill="#050d12"
            opacity="0.7"
          />
          <ellipse
            cx="250"
            cy="300"
            rx="190"
            ry="18"
            stroke="#4c9b7a"
            strokeOpacity="0.08"
            strokeWidth="1"
          />

          {/* === PEDESTAL / STAND (Fixed) === */}
          <g filter="url(#dropShadow)">
            {/* Base plate */}
            <path
              d="M370 280 L410 280 L420 300 L360 300 Z"
              fill="#0a1a24"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="1.2"
            />
            <path
              d="M375 282 L405 282 L412 296 L368 296 Z"
              fill="url(#metalDark)"
            />
            {/* Main column */}
            <rect
              x="375"
              y="110"
              width="30"
              height="170"
              rx="2"
              fill="url(#metalMid)"
              stroke="#4c9b7a"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            {/* Column accents */}
            <line
              x1="380"
              y1="120"
              x2="400"
              y2="120"
              stroke="#4c9b7a"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />
            <line
              x1="380"
              y1="140"
              x2="400"
              y2="140"
              stroke="#4c9b7a"
              strokeOpacity="0.15"
              strokeWidth="0.8"
            />
            {/* Ventilation grille */}
            <rect
              x="380"
              y="150"
              width="20"
              height="80"
              rx="1"
              fill="#0a1a24"
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1="382"
                y1={158 + i * 12}
                x2="398"
                y2={158 + i * 12}
                stroke="#1a3a48"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
            ))}
            {/* Control panel / touchscreen */}
            <rect
              x="382"
              y="240"
              width="16"
              height="12"
              rx="1"
              fill="#071520"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
            <text
              x="385"
              y="247"
              fontSize="2.5"
              fill="#4c9b7a"
              fillOpacity="0.6"
              fontFamily="monospace"
            >
              ON
            </text>
            <circle
              cx="393"
              cy="245"
              r="1.5"
              fill="#4c9b7a"
              fillOpacity="0.5"
            />
            {/* Status LEDs */}
            <circle
              cx="383"
              cy="124"
              r="2.5"
              fill="#4c9b7a"
              fillOpacity="0.9"
              className="breathe"
              filter="url(#glow)"
            />
            <circle
              cx="390"
              cy="124"
              r="2.5"
              fill="#a78bfa"
              fillOpacity="0.7"
            />
            <circle
              cx="397"
              cy="124"
              r="2.5"
              fill="#4c9b7a"
              fillOpacity="0.4"
            />
            {/* Brand label */}
            <text
              x="382"
              y="134"
              fontSize="2.8"
              fill="#4c9b7a"
              fillOpacity="0.3"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              RAD
            </text>
            {/* Cable conduit */}
            <path
              d="M380 280 Q360 295 320 300"
              stroke="#0a1a24"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M395 280 Q400 292 420 302"
              stroke="#0a1a24"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>

          {/* === ROTATING GANTRY (C-arm ring) === */}
          <g className="spin-slow" style={{ transformOrigin: "255px 160px" }}>
            {/* Outer thick ring */}
            <path
              d="M255 58 A102 102 0 0 1 357 160 A102 102 0 0 1 255 262 A102 102 0 0 1 153 160 A102 102 0 0 1 255 58"
              stroke="url(#gantryGrad)"
              strokeOpacity="0.8"
              strokeWidth="18"
              fill="none"
              filter="url(#glow)"
            />
            {/* Inner bearing track */}
            <path
              d="M255 70 A90 90 0 0 1 345 160 A90 90 0 0 1 255 250 A90 90 0 0 1 165 160 A90 90 0 0 1 255 70"
              stroke="#5fd3a6"
              strokeOpacity="0.2"
              strokeWidth="2"
              fill="none"
            />
            {/* Gear teeth (rotating) */}
            <path
              d="M255 70 A90 90 0 0 1 345 160 A90 90 0 0 1 255 250 A90 90 0 0 1 165 160 A90 90 0 0 1 255 70"
              stroke="#4c9b7a"
              strokeOpacity="0.1"
              strokeWidth="4"
              strokeDasharray="4 6"
              fill="none"
            />
            {/* Tick marks every 5° */}
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = (i / 72) * 2 * Math.PI - Math.PI / 2;
              const isMajor = i % 6 === 0;
              const inner = isMajor ? 82 : 88;
              const outer = isMajor ? 100 : 96;
              const x1 = 255 + Math.cos(angle) * inner;
              const y1 = 160 + Math.sin(angle) * inner;
              const x2 = 255 + Math.cos(angle) * outer;
              const y2 = 160 + Math.sin(angle) * outer;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#5fd3a6"
                  strokeOpacity={isMajor ? 0.6 : 0.2}
                  strokeWidth={isMajor ? 2.5 : 1}
                />
              );
            })}
            {/* Degree labels */}
            {[0, 90, 180, 270].map((deg) => {
              const rad = (deg / 180) * Math.PI - Math.PI / 2;
              const x = 255 + Math.cos(rad) * 112;
              const y = 160 + Math.sin(rad) * 112 + 4;
              return (
                <text
                  key={deg}
                  x={x}
                  y={y}
                  fontSize="5"
                  fill="#5fd3a6"
                  fillOpacity="0.4"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {deg}°
                </text>
              );
            })}
            {/* Bearing hubs */}
            <circle
              cx="255"
              cy="58"
              r="14"
              fill="url(#metalDark)"
              stroke="#4c9b7a"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <circle
              cx="255"
              cy="262"
              r="14"
              fill="url(#metalDark)"
              stroke="#4c9b7a"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <circle cx="255" cy="58" r="5" fill="#5fd3a6" fillOpacity="0.5" />
            <circle cx="255" cy="262" r="5" fill="#5fd3a6" fillOpacity="0.5" />
            {/* Gantry angle indicator */}
            <polygon
              points="255,50 249,62 261,62"
              fill="#fbbf24"
              filter="url(#glow)"
            />
            <text
              x="255"
              y="48"
              fontSize="4"
              fill="#fbbf24"
              fillOpacity="0.8"
              fontFamily="monospace"
              textAnchor="middle"
              className="breathe"
            >
              {gantryAngle}°
            </text>
          </g>

          {/* === COUNTER-ROTATING INNER RING === */}
          <g
            className="spin-reverse"
            style={{ transformOrigin: "255px 160px" }}
          >
            <circle
              cx="255"
              cy="160"
              r="72"
              stroke="#5fd3a6"
              strokeOpacity="0.15"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
            <circle
              cx="255"
              cy="160"
              r="72"
              stroke="#4c9b7a"
              strokeOpacity="0.05"
              strokeWidth="5"
              strokeDasharray="2 12"
            />
          </g>

          {/* === ORBITING PARTICLES (Bokeh) === */}
          <g className="spin-slower" style={{ transformOrigin: "255px 160px" }}>
            <circle cx="255" cy="58" r="4" fill="#5fd3a6" filter="url(#glow)" />
            <circle
              cx="255"
              cy="262"
              r="3"
              fill="#a78bfa"
              filter="url(#glow)"
            />
          </g>
          <g
            className="spin-mid-reverse"
            style={{ transformOrigin: "255px 160px" }}
          >
            <circle
              cx="357"
              cy="160"
              r="3.5"
              fill="#a78bfa"
              filter="url(#glow)"
            />
            <circle
              cx="153"
              cy="160"
              r="2.8"
              fill="#5fd3a6"
              filter="url(#glow)"
            />
          </g>
          <g className="spin-fast" style={{ transformOrigin: "255px 160px" }}>
            <circle
              cx="312"
              cy="88"
              r="2.2"
              fill="#5fd3a6"
              fillOpacity="0.8"
              filter="url(#glow)"
            />
            <circle
              cx="198"
              cy="232"
              r="2"
              fill="#a78bfa"
              fillOpacity="0.7"
              filter="url(#glow)"
            />
            <circle
              cx="325"
              cy="225"
              r="1.8"
              fill="#5fd3a6"
              fillOpacity="0.6"
              filter="url(#glow)"
            />
            <circle
              cx="185"
              cy="95"
              r="1.5"
              fill="#a78bfa"
              fillOpacity="0.5"
              filter="url(#glow)"
            />
          </g>

          {/* === ISOCENTER & BORE === */}
          <circle
            cx="255"
            cy="160"
            r="130"
            fill="url(#isocenterGlow)"
            className="breathe"
          />
          <circle
            cx="255"
            cy="160"
            r="54"
            stroke="#a5f3fc"
            strokeOpacity="0.4"
            strokeWidth="2"
          />
          <circle cx="255" cy="160" r="54" fill="#062a34" fillOpacity="0.6" />
          <circle
            cx="255"
            cy="160"
            r="46"
            stroke="#4c9b7a"
            strokeOpacity="0.2"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <circle cx="255" cy="160" r="38" fill="#0a1a24" fillOpacity="0.4" />

          {/* Room lasers */}
          <line
            x1="180"
            y1="160"
            x2="330"
            y2="160"
            stroke="#f472b6"
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeDasharray="5 5"
          />
          <line
            x1="255"
            y1="100"
            x2="255"
            y2="220"
            stroke="#f472b6"
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeDasharray="5 5"
          />
          <circle cx="255" cy="160" r="20" fill="url(#isocenterGlow)" />
          <circle
            cx="255"
            cy="160"
            r="6"
            fill={firing ? "#fbbf24" : "#5fd3a6"}
            filter="url(#strongGlow)"
            className="breathe"
          />
          <circle cx="255" cy="160" r="2.5" fill="#fff" fillOpacity="0.9" />

          {/* === DOSE WAVEFRONTS (Expanding from isocenter) === */}
          {beamPulses.map((pulse) => {
            const r = getWavefrontRadius(pulse.progress);
            const opacity = 1 - pulse.progress / 100;
            return (
              <circle
                key={pulse.id}
                cx="255"
                cy="160"
                r={r}
                stroke="#fbbf24"
                strokeOpacity={opacity * 0.6}
                strokeWidth={2.5 - (pulse.progress / 100) * 2}
                fill="none"
              />
            );
          })}

          {/* === FIXED TREATMENT HEAD (Ultra-detailed) === */}
          <g filter="url(#dropShadow)">
            {/* Head main base plate */}
            <rect
              x="215"
              y="20"
              width="80"
              height="90"
              rx="6"
              fill="url(#metalMid)"
              stroke="#4c9b7a"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            <rect
              x="218"
              y="23"
              width="74"
              height="84"
              rx="4"
              fill="#0a1a24"
              opacity="0.4"
            />

            {/* === Waveguide (Electron guide) === */}
            <rect
              x="250"
              y="30"
              width="10"
              height="40"
              rx="1"
              fill="url(#metalLight)"
              stroke="#5fd3a6"
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <rect x="248" y="30" width="14" height="4" rx="1" fill="#1a3a48" />
            <rect x="248" y="66" width="14" height="4" rx="1" fill="#1a3a48" />
            <text
              x="255"
              y="50"
              fontSize="3"
              fill="#4c9b7a"
              fillOpacity="0.3"
              fontFamily="monospace"
              textAnchor="middle"
              transform="rotate(-90 255 50)"
            >
              WAVEGUIDE
            </text>

            {/* === Bending Magnet === */}
            <rect
              x="220"
              y="35"
              width="30"
              height="25"
              rx="4"
              fill="url(#metalDark)"
              stroke="#4c9b7a"
              strokeOpacity="0.4"
              strokeWidth="1.2"
            />
            <rect
              x="225"
              y="40"
              width="20"
              height="15"
              rx="2"
              fill="#071520"
              stroke="#5fd3a6"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />
            <circle cx="235" cy="47" r="3" fill="#4c9b7a" fillOpacity="0.3" />
            <text
              x="235"
              y="55"
              fontSize="2.5"
              fill="#4c9b7a"
              fillOpacity="0.3"
              fontFamily="monospace"
              textAnchor="middle"
            >
              BEND
            </text>

            {/* === Target / Primary Collimator === */}
            <rect
              x="245"
              y="70"
              width="20"
              height="10"
              rx="2"
              fill="url(#metalDark)"
              stroke="#fbbf24"
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <rect
              x="250"
              y="73"
              width="10"
              height="4"
              rx="1"
              fill={firing ? "#fbbf24" : "#4c9b7a"}
              fillOpacity={firing ? 0.8 : 0.2}
              filter={firing ? "url(#glow)" : "none"}
            />
            <text
              x="255"
              y="68"
              fontSize="2.5"
              fill="#fbbf24"
              fillOpacity="0.4"
              fontFamily="monospace"
              textAnchor="middle"
            >
              TARGET
            </text>

            {/* === MLC Housing === */}
            <rect
              x="222"
              y="82"
              width="66"
              height="22"
              rx="2"
              fill="url(#metalDark)"
              stroke="#4c9b7a"
              strokeOpacity="0.5"
              strokeWidth="1.2"
            />
            {/* MLC Leaves (Dense grid) */}
            {Array.from({ length: 30 }).map((_, i) => {
              const side = i < 15 ? -1 : 1;
              const idx = i < 15 ? i : i - 15;
              const xPos = 226 + idx * 4 + (side === -1 ? 0 : 2);
              const yPos = 86;
              const width = 1.8;
              const height = 14;
              const delay = idx * 0.05 + (side === -1 ? 0 : 0.3);
              const isFiring = firing && Math.random() > 0.4;
              return (
                <rect
                  key={i}
                  x={xPos}
                  y={yPos}
                  width={width}
                  height={height}
                  rx="0.5"
                  fill={isFiring ? "#fbbf24" : "#5fd3a6"}
                  fillOpacity={isFiring ? 0.9 : 0.5}
                  className="leaf"
                  style={{
                    animationDelay: `${delay}s`,
                    transformOrigin: `${xPos + width / 2}px ${
                      yPos + height / 2
                    }px`,
                  }}
                />
              );
            })}
            <text
              x="255"
              y="82"
              fontSize="2.5"
              fill="#4c9b7a"
              fillOpacity="0.3"
              fontFamily="monospace"
              textAnchor="middle"
            >
              MLC 120
            </text>

            {/* === X / Y Jaws === */}
            <rect
              x="232"
              y="104"
              width="10"
              height="4"
              rx="0.5"
              fill="#0a1a24"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
            <rect
              x="268"
              y="104"
              width="10"
              height="4"
              rx="0.5"
              fill="#0a1a24"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
            <rect
              x="242"
              y="104"
              width="26"
              height="2"
              rx="0.5"
              fill="#0a1a24"
              stroke="#4c9b7a"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />

            {/* === Accessory Tray / Light Field === */}
            <rect
              x="230"
              y="110"
              width="50"
              height="6"
              rx="1"
              fill="#0a1a24"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
            <circle cx="255" cy="113" r="2" fill="#4c9b7a" fillOpacity="0.4" />
            <line
              x1="230"
              y1="113"
              x2="280"
              y2="113"
              stroke="#4c9b7a"
              strokeOpacity="0.15"
              strokeWidth="0.5"
            />

            {/* === Status Panel (Radiation symbol / display) === */}
            <rect
              x="218"
              y="25"
              width="30"
              height="20"
              rx="2"
              fill="#071520"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
            <text
              x="223"
              y="38"
              fontSize="8"
              fill="#fbbf24"
              fillOpacity="0.8"
              fontFamily="sans-serif"
            >
              ☢
            </text>
            <text
              x="235"
              y="40"
              fontSize="2.5"
              fill="#4c9b7a"
              fillOpacity="0.4"
              fontFamily="monospace"
            >
              RAD
            </text>
            <circle cx="223" cy="44" r="1.2" fill="#4c9b7a" fillOpacity="0.6" />
            <circle cx="228" cy="44" r="1.2" fill="#a78bfa" fillOpacity="0.5" />
            <circle cx="233" cy="44" r="1.2" fill="#4c9b7a" fillOpacity="0.3" />
          </g>

          {/* === REALISTIC BEAM (Targeting the Head at Isocenter) === */}
          <g>
            {/* Beam cone - precisely targeting the head at x=255, y=234 */}
            <path
              d="M255 116 L190 234 L280 234 Z"
              fill={firing ? "url(#beamGrad)" : "none"}
              stroke={firing ? "#fbbf24" : "#5fd3a6"}
              strokeOpacity={firing ? 0.4 : 0.05}
              strokeWidth={firing ? 1.5 : 0.8}
              filter={firing ? "url(#beamGlow)" : "none"}
            />
            {/* Central axis - perfectly vertical, centered on the head */}
            <line
              x1="255"
              y1="116"
              x2="255"
              y2="234"
              stroke={firing ? "#fbbf24" : "#5fd3a6"}
              strokeOpacity={firing ? 0.9 : 0.15}
              strokeWidth={firing ? 2.5 : 1}
              strokeDasharray={firing ? "8 6" : "4 6"}
              filter={firing ? "url(#glow)" : "none"}
            />
            {/* Field edges */}
            <line
              x1="255"
              y1="116"
              x2="190"
              y2="234"
              stroke="#5fd3a6"
              strokeOpacity="0.15"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <line
              x1="255"
              y1="116"
              x2="280"
              y2="234"
              stroke="#5fd3a6"
              strokeOpacity="0.15"
              strokeWidth="1"
              strokeDasharray="3 5"
            />

            {/* Floating radiation symbols along the beam */}
            {firing &&
              [1, 2, 3].map((i) => (
                <text
                  key={`rad-${i}`}
                  x={255}
                  y={116 + i * 30}
                  fontSize="6"
                  fill="#fbbf24"
                  fillOpacity={0.6 - i * 0.15}
                  fontFamily="sans-serif"
                  className="float-particle"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  ☢
                </text>
              ))}

            {/* Target hotspot perfectly centered on the head */}
            {firing && (
              <ellipse
                cx="255"
                cy="234"
                rx="22"
                ry="7"
                fill="#fbbf24"
                fillOpacity="0.4"
                filter="url(#strongGlow)"
                className="beam-pulse"
              />
            )}
          </g>

          {/* === IMAGING SYSTEMS (kV & EPID) === */}
          <g opacity="0.85">
            {/* kV Source */}
            <path
              d="M135 160 L100 160 L100 125 L115 125"
              stroke="#4c9b7a"
              strokeOpacity="0.4"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <rect
              x="105"
              y="110"
              width="28"
              height="22"
              rx="3"
              fill="url(#metalDark)"
              stroke="#4c9b7a"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
            <rect
              x="112"
              y="116"
              width="14"
              height="10"
              rx="1"
              fill="#062a34"
              stroke="#5fd3a6"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />
            <circle cx="119" cy="121" r="3" fill="#5fd3a6" fillOpacity="0.5" />
            <text
              x="110"
              y="126"
              fontSize="2.8"
              fill="#4c9b7a"
              fillOpacity="0.3"
              fontFamily="monospace"
            >
              kV
            </text>

            {/* EPID Detector */}
            <path
              d="M375 160 L410 160 L410 195 L395 195"
              stroke="#4c9b7a"
              strokeOpacity="0.4"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <rect
              x="380"
              y="185"
              width="34"
              height="20"
              rx="2"
              fill="url(#metalDark)"
              stroke="#4c9b7a"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
            <rect
              x="388"
              y="190"
              width="18"
              height="10"
              rx="1"
              fill="#062a34"
              stroke="#5fd3a6"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />
            <text
              x="382"
              y="198"
              fontSize="2.8"
              fill="#4c9b7a"
              fillOpacity="0.3"
              fontFamily="monospace"
            >
              EPID
            </text>
          </g>

          {/* === TREATMENT COUCH (Carbon Fiber) === */}
          <g filter="url(#dropShadow)">
            {/* Pedestal base */}
            <path
              d="M130 280 L210 280 L220 300 L120 300 Z"
              fill="#0a1a24"
              stroke="#4c9b7a"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            {/* Vertical column */}
            <rect
              x="145"
              y="250"
              width="30"
              height="30"
              rx="2"
              fill="url(#metalMid)"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="1.2"
            />
            <line
              x1="150"
              y1="260"
              x2="170"
              y2="260"
              stroke="#4c9b7a"
              strokeOpacity="0.15"
              strokeWidth="0.8"
            />
            <line
              x1="150"
              y1="270"
              x2="170"
              y2="270"
              stroke="#4c9b7a"
              strokeOpacity="0.15"
              strokeWidth="0.8"
            />
            {/* Couch top (Carbon fiber table) */}
            <rect
              x="40"
              y="240"
              width="320"
              height="12"
              rx="3"
              fill="url(#carbon)"
              stroke="#4c9b7a"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            <rect
              x="40"
              y="240"
              width="320"
              height="12"
              rx="3"
              fill="url(#carbon)"
              stroke="#5fd3a6"
              strokeOpacity="0.1"
              strokeWidth="0.5"
            />
            {/* Carbon fiber weave overlay (visual enhancement) */}
            <rect
              x="40"
              y="240"
              width="320"
              height="12"
              rx="3"
              fill="url(#carbon)"
              opacity="0.6"
            />
            {/* Side rails */}
            <line
              x1="44"
              y1="240"
              x2="356"
              y2="240"
              stroke="#fff"
              strokeOpacity="0.08"
              strokeWidth="0.8"
            />
            <line
              x1="44"
              y1="252"
              x2="356"
              y2="252"
              stroke="#fff"
              strokeOpacity="0.05"
              strokeWidth="0.8"
            />

            {/* Index marks (laser alignment) */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line
                key={i}
                x1={100 + i * 40}
                y1="244"
                x2={100 + i * 40}
                y2="250"
                stroke="#5fd3a6"
                strokeOpacity="0.25"
                strokeWidth="1.2"
              />
            ))}
            {/* Position labels */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <text
                key={`pos-${i}`}
                x={100 + i * 40}
                y="256"
                fontSize="2.5"
                fill="#4c9b7a"
                fillOpacity="0.15"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {i * 5}
              </text>
            ))}
            {/* Couch movement indicator */}
            <rect
              x="0"
              y="245"
              width="18"
              height="4"
              rx="2"
              fill="#fbbf24"
              fillOpacity="0.8"
              className="couch-slide"
            />
          </g>

          {/* === PATIENT PHANTOM (redesigned: contoured body, gown, mask, isodose) === */}
          <g>
            {/* --- soft contact shadow on the couch beneath the phantom --- */}
            <ellipse
              cx="205"
              cy="243"
              rx="130"
              ry="5"
              fill="#000"
              opacity="0.25"
            />

            {/* --- torso silhouette, tapered chest -> waist, drawn as one continuous contour --- */}
            <path
              d="M60 234
                 C 62 226, 78 220, 96 220
                 C 118 219, 138 224, 158 227
                 C 180 230, 202 230, 220 231
                 C 226 231.5, 231 232.5, 234 234
                 C 231 235.5, 226 236.5, 220 237
                 C 202 238, 180 238, 158 235
                 C 138 232.5, 118 229, 96 230
                 C 78 230.5, 62 240, 60 234 Z"
              fill="url(#phantomBody)"
              stroke="#7dd3e8"
              strokeOpacity="0.25"
              strokeWidth="1"
              className="breathe-body"
              style={{ transformOrigin: "140px 230px" }}
            />

            {/* gown drape folds over the torso */}
            <path
              d="M70 226 C 100 220 150 221 205 227"
              fill="none"
              stroke="#dff6ff"
              strokeOpacity="0.12"
              strokeWidth="1.4"
            />
            <path
              d="M75 236 C 110 240 160 239 218 233"
              fill="none"
              stroke="#04141c"
              strokeOpacity="0.25"
              strokeWidth="1.2"
            />
            <path
              d="M100 222 C 104 226 104 232 100 238"
              fill="none"
              stroke="#04141c"
              strokeOpacity="0.18"
              strokeWidth="0.8"
            />
            <path
              d="M150 223 C 154 227 154 231 150 236"
              fill="none"
              stroke="#04141c"
              strokeOpacity="0.15"
              strokeWidth="0.8"
            />
            {/* gown V-neckline near the chest */}
            <path
              d="M200 226 L212 231 L200 235"
              fill="none"
              stroke="#dff6ff"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />

            {/* forearm + hand resting alongside the body */}
            <path
              d="M95 220 C 88 214 86 206 90 200"
              fill="none"
              stroke="#4a7a8a"
              strokeOpacity="0.35"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <ellipse
              cx="90"
              cy="199"
              rx="4.5"
              ry="3.2"
              fill="#2f5566"
              fillOpacity="0.4"
            />

            {/* --- chest-wall dot markers (setup tattoos) --- */}
            <circle cx="205" cy="226" r="1" fill="#fbbf24" fillOpacity="0.8" />
            <circle
              cx="180"
              cy="222"
              r="0.8"
              fill="#a78bfa"
              fillOpacity="0.6"
            />
            <circle
              cx="185"
              cy="234"
              r="0.8"
              fill="#a78bfa"
              fillOpacity="0.6"
            />

            {/* --- neck, tapered cylinder into the shoulders --- */}
            <path
              d="M218 232 C 222 227 230 224 236 224 C 242 224 248 227 250 232 C 248 235 242 236 236 236 C 230 236 222 235 218 232 Z"
              fill="url(#phantomBody)"
              stroke="#7dd3e8"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />

            {/* --- headrest cradle --- */}
            <path
              d="M246 224 L292 224 C 296 224 298 226 298 229 L298 236 C 298 239 296 241 292 241 L246 241 Z"
              fill="#3a4a5a"
              stroke="#4c9b7a"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />
            <ellipse
              cx="292"
              cy="232"
              rx="7"
              ry="8.5"
              fill="#3a4a5a"
              stroke="#4c9b7a"
              strokeOpacity="0.15"
              strokeWidth="0.5"
            />

            {/* --- head, realistic oval with jaw taper, tilted for a 3/4 side profile --- */}
            <path
              d="M243 233
                 C 242 224, 246 214, 256 210
                 C 266 206, 277 209, 281 218
                 C 284 225, 283 233, 279 239
                 C 276 244, 270 248, 263 248
                 C 255 248, 248 244, 245 238
                 C 244 237, 243 235, 243 233 Z"
              fill="url(#phantomHead)"
              stroke="#8fdcee"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            {/* brow / nose bridge subtle contour line for dimensionality */}
            <path
              d="M247 222 C 252 219 259 218 265 220"
              fill="none"
              stroke="#dff6ff"
              strokeOpacity="0.18"
              strokeWidth="0.7"
            />
            <path
              d="M276 224 C 278 228 277 233 273 237"
              fill="none"
              stroke="#04141c"
              strokeOpacity="0.2"
              strokeWidth="0.7"
            />
            {/* closed, resting eye line */}
            <path
              d="M256 226 C 259 227.5 262 227.5 265 226"
              fill="none"
              stroke="#04141c"
              strokeOpacity="0.35"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            {/* ear */}
            <ellipse
              cx="248"
              cy="230"
              rx="2.4"
              ry="4"
              fill="#1f3d4a"
              fillOpacity="0.4"
            />

            {/* --- thermoplastic immobilisation mask over the face, mesh texture + clip anchors --- */}
            <path
              d="M243 233
                 C 242 224, 246 214, 256 210
                 C 266 206, 277 209, 281 218
                 C 284 225, 283 233, 279 239
                 C 276 244, 270 248, 263 248
                 C 255 248, 248 244, 245 238 Z"
              fill="url(#maskMesh)"
              stroke="#bff3ff"
              strokeOpacity="0.5"
              strokeWidth="0.9"
              strokeDasharray="1.2 1.4"
            />
            {/* mask frame clips into the headrest base, three-point fixation */}
            <circle
              cx="246"
              cy="216"
              r="1.6"
              fill="none"
              stroke="#bff3ff"
              strokeOpacity="0.6"
              strokeWidth="0.6"
            />
            <circle
              cx="280"
              cy="219"
              r="1.6"
              fill="none"
              stroke="#bff3ff"
              strokeOpacity="0.6"
              strokeWidth="0.6"
            />
            <circle
              cx="263"
              cy="247"
              r="1.6"
              fill="none"
              stroke="#bff3ff"
              strokeOpacity="0.6"
              strokeWidth="0.6"
            />
            <path
              d="M246 216 L236 224"
              stroke="#bff3ff"
              strokeOpacity="0.3"
              strokeWidth="0.6"
            />
            <path
              d="M280 219 L288 226"
              stroke="#bff3ff"
              strokeOpacity="0.3"
              strokeWidth="0.6"
            />

            {/* laser cross-hair alignment tick on the mask, confirming setup at isocenter */}
            <line
              x1="259"
              y1="223"
              x2="259"
              y2="229"
              stroke="#f472b6"
              strokeOpacity="0.5"
              strokeWidth="0.6"
            />
            <line
              x1="256"
              y1="226"
              x2="262"
              y2="226"
              stroke="#f472b6"
              strokeOpacity="0.5"
              strokeWidth="0.6"
            />

            {/* --- isodose contour rings around the tumour target, standard treatment-plan colour wash --- */}
            <ellipse
              cx="259"
              cy="226"
              rx="19"
              ry="12"
              fill="none"
              stroke="#f87171"
              strokeOpacity="0.28"
              strokeWidth="0.8"
            />
            <ellipse
              cx="259"
              cy="226"
              rx="13"
              ry="8.5"
              fill="none"
              stroke="#fb923c"
              strokeOpacity="0.35"
              strokeWidth="0.8"
            />
            <ellipse
              cx="259"
              cy="226"
              rx="8"
              ry="5.5"
              fill="none"
              stroke="#fde047"
              strokeOpacity="0.45"
              strokeWidth="0.8"
            />

            {/* tumour / target volume, pulsing beacon exactly at isocenter */}
            <ellipse
              cx="259"
              cy="226"
              rx="4.5"
              ry="3"
              fill="url(#isodoseCore)"
              className="breathe"
              style={{ animationDelay: "0.5s" }}
            />
            <circle
              cx="259"
              cy="226"
              r="1.4"
              fill="#fff7d6"
              fillOpacity="0.9"
            />

            {/* fine digitisation contour lines sweeping across the whole phantom, ties it to the HUD/scan aesthetic */}
            <path
              d="M65 224 C 120 216 190 218 250 220"
              fill="none"
              stroke="#5fd3a6"
              strokeOpacity="0.08"
              strokeWidth="0.6"
            />
            <path
              d="M65 240 C 120 244 190 242 250 240"
              fill="none"
              stroke="#5fd3a6"
              strokeOpacity="0.06"
              strokeWidth="0.6"
            />

            {/* respiration monitor readout, floating just above the chest */}
            <g transform="translate(150 205)" opacity="0.75">
              <rect
                x="-16"
                y="-8"
                width="32"
                height="12"
                rx="1.5"
                fill="#071520"
                stroke="#4c9b7a"
                strokeOpacity="0.3"
                strokeWidth="0.6"
              />
              <polyline
                points="-13,-2 -9,-2 -7,-6 -4,2 -1,-4 2,-2 13,-2"
                fill="none"
                stroke="#4ade80"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="resp-trace"
              />
              <text
                x="-13"
                y="5.5"
                fontSize="2.4"
                fill="#4ade80"
                fillOpacity="0.7"
                fontFamily="monospace"
              >
                RESP OK
              </text>
            </g>
          </g>

          {/* === SUPPORT ARM (Stand to Gantry connection) === */}
          <path
            d="M380 160 L355 160"
            stroke="#4c9b7a"
            strokeOpacity="0.3"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle
            cx="367"
            cy="160"
            r="8"
            fill="url(#metalDark)"
            stroke="#4c9b7a"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <circle cx="367" cy="160" r="3" fill="#4c9b7a" fillOpacity="0.5" />

          {/* === FLOOR MARKINGS === */}
          <line
            x1="0"
            y1="295"
            x2="500"
            y2="295"
            stroke="#4c9b7a"
            strokeOpacity="0.05"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="305"
            x2="500"
            y2="305"
            stroke="#4c9b7a"
            strokeOpacity="0.03"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="290"
            x2="500"
            y2="290"
            stroke="#4c9b7a"
            strokeOpacity="0.02"
            strokeWidth="0.5"
          />

          {/* Extra safety / warning labels on the wall */}
          <text
            x="20"
            y="30"
            fontSize="4"
            fill="#4c9b7a"
            fillOpacity="0.1"
            fontFamily="monospace"
          >
            RADIATION AREA
          </text>
          <text
            x="20"
            y="38"
            fontSize="3"
            fill="#fbbf24"
            fillOpacity="0.08"
            fontFamily="monospace"
          >
            ☢ KEEP CLEAR ☢
          </text>
          <line
            x1="20"
            y1="42"
            x2="120"
            y2="42"
            stroke="#4c9b7a"
            strokeOpacity="0.05"
            strokeWidth="0.5"
          />
        </svg>

        {/* === HUD OVERLAY (Live data) === */}
        <div
          dir="ltr"
          className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] leading-relaxed tracking-widest"
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                firing ? "bg-amber-400 animate-ping" : "bg-primary"
              } ${hot ? "animate-pulse" : ""}`}
            />
            <span className={firing ? "text-amber-300" : "text-emerald-200/70"}>
              {firing ? "BEAM ON" : hot ? "READY" : "STANDBY"}
            </span>
            {firing && (
              <span className="text-amber-400/60 animate-pulse">●</span>
            )}
          </div>
          <div className="mt-1.5 text-emerald-200/50">GANTRY {gantryAngle}°</div>
          <div className="text-emerald-200/50">COLL {collimatorAngle}°</div>
          <div className="text-emerald-200/40">ISO 100 cm</div>
          <div className="mt-1 text-emerald-200/40">
            X:{coordX} Y:{coordY}
          </div>
          {firing && (
            <div className="mt-1 text-amber-300/80 font-bold">
              MU {String(mu).padStart(4, "0")}
            </div>
          )}
        </div>

        <div
          dir="ltr"
          className="pointer-events-none absolute bottom-4 right-4 font-mono text-[10px] tracking-widest text-emerald-200/50 text-right"
        >
          <div>
            SESSION {mm}:{ss}
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-2">
            <span className="text-emerald-200/40">DOSE</span>
            <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-white/8">
              <span
                className="dose-bar absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-secondary to-amber-400"
                style={{ animationDuration: firing ? "4s" : "8s" }}
              />
            </span>
          </div>
          <div className="mt-1 text-emerald-200/30 text-[8px]">MLC 120 · 6 MV</div>
          <div className="mt-0.5 text-emerald-200/20 text-[8px]">
            {firing ? "DOSE RATE 400 MU/min" : "BEAM OFF"}
          </div>
          <div className="mt-0.5 text-emerald-200/15 text-[7px]">SYS: ONLINE</div>
        </div>
      </div>

      {/* === CLICK RIPPLES === */}
      {pulses.map((p) => (
        <span
          key={p.id}
          className="ripple pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300/80"
          style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
        />
      ))}

      {/* === CURSOR RETICLE === */}
      {pointer && (
        <div
          className="pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
          style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
        >
          <svg
            viewBox="0 0 40 40"
            fill="none"
            className="h-full w-full drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]"
          >
            <circle
              cx="20"
              cy="20"
              r="12"
              stroke={firing ? "#fbbf24" : "#5fd3a6"}
              strokeOpacity="0.7"
              strokeWidth="1.2"
            />
            <circle
              cx="20"
              cy="20"
              r="12"
              stroke={firing ? "#fbbf24" : "#5fd3a6"}
              strokeOpacity="0.15"
              strokeWidth="4"
            />
            <path
              d="M20 2v8M20 30v8M2 20h8M30 20h8"
              stroke={firing ? "#fbbf24" : "#5fd3a6"}
              strokeOpacity="0.8"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle
              cx="20"
              cy="20"
              r="2"
              fill={firing ? "#fbbf24" : "#5fd3a6"}
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#5fd3a6"
              strokeOpacity="0.08"
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
          </svg>
        </div>
      )}

      {/* === HINT LABEL === */}
      <div
        dir="rtl"
        className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-[11px] text-emerald-100/70 backdrop-blur-sm transition-opacity duration-300 ${
          hot && !firing ? "opacity-100" : "opacity-0"
        }`}
      >
        برای شبیه‌سازی تابش کلیک کنید
      </div>

      {/* === EDGE FADE === */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-[#050d12]/0 to-transparent lg:block" />

      <style jsx>{`
        .spin-slow {
          animation: spin 28s linear infinite;
        }
        .spin-slower {
          animation: spin 40s linear infinite;
        }
        .spin-fast {
          animation: spin 14s linear infinite;
        }
        .spin-reverse {
          animation: spin-rev 20s linear infinite;
        }
        .spin-mid-reverse {
          animation: spin-rev 30s linear infinite;
        }
        .breathe {
          animation: breathe 3.6s ease-in-out infinite;
        }
        .breathe-body {
          animation: breatheBody 4.2s ease-in-out infinite;
        }
        .resp-trace {
          animation: respTrace 2.4s linear infinite;
          stroke-dasharray: 40;
        }
        .beam-pulse {
          animation: beamPulse 0.5s ease-in-out infinite alternate;
        }
        .sweep {
          animation: sweep 6s ease-in-out infinite;
        }
        .leaf {
          animation: leaf-breathe 2.8s ease-in-out infinite;
        }
        .couch-slide {
          animation: couch 8s ease-in-out infinite;
        }
        .dose-bar {
          width: 0%;
          animation: dose-fill 8s linear infinite;
        }
        .ripple {
          animation: ripple 0.9s ease-out forwards;
        }
        .float-particle {
          animation: floatUp 2s ease-out infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-rev {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes breathe {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.06);
          }
        }
        @keyframes breatheBody {
          0%,
          100% {
            transform: scaleY(1) scaleX(1);
          }
          50% {
            transform: scaleY(1.025) scaleX(1.008);
          }
        }
        @keyframes respTrace {
          0% {
            stroke-dashoffset: 40;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes beamPulse {
          0% {
            opacity: 0.4;
            transform: scale(1);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.2);
          }
        }
        @keyframes sweep {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(420%);
          }
        }
        @keyframes leaf-breathe {
          0%,
          100% {
            transform: scaleY(1);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(2.2);
            opacity: 0.9;
          }
        }
        @keyframes couch {
          0%,
          100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(250px);
          }
        }
        @keyframes dose-fill {
          0% {
            width: 0%;
          }
          85% {
            width: 100%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(7);
            opacity: 0;
          }
        }
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.5);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-10px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
