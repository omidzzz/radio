import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import PowerOnGantry from "@/components/ui/PowerOnGantry";
import SectionHeader from "@/components/ui/SectionHeader";

interface EquipmentProps {
  isFa: boolean;
  modalities?: string[];
}

export default function Equipment({ isFa, modalities = [] }: EquipmentProps) {
  const specs = [
    { label: isFa ? "قدرت میدان مغناطیسی" : "Field Strength", value: "3.0 T" },
    {
      label: isFa ? "قطر دهانه دستگاه" : "Bore Diameter",
      value: isFa ? "۷۰ سانتی‌متر" : "70 cm wide-bore",
    },
    {
      label: isFa ? "میانگین زمان اسکن" : "Avg. Scan Time",
      value: isFa ? "۱۸ تا ۳۵ دقیقه" : "18–35 min",
    },
    {
      label: isFa ? "دقت تفکیک برش" : "Slice Resolution",
      value: isFa ? "۰.۵ میلی‌متر" : "0.5 mm",
    },
  ];

  return (
    <section className="content-visibility band-dark section-pad">
      <div className="pointer-events-none absolute inset-x-0 top-[30%] hidden h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent lg:block" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
        {/* Detailed MRI illustration — 3D tilt on hover */}
        <Reveal variant="left" className="h-full">
          <TiltCard className="h-full" maxTilt={5}>
            <PowerOnGantry className="rounded-3xl">
            <div className="group relative mx-auto flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-200 hover:border-primary/30 hover:bg-white/[0.05]">
              <div className="pointer-events-none absolute hidden h-56 w-56 rounded-full bg-primary/20 blur-3xl lg:block" />

              <svg
                viewBox="0 0 420 300"
                fill="none"
                className="relative h-full w-full text-highlight"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                {/* Outer ring — rotation is desktop-only (see .gantry-spin CSS) */}
                <g className="gantry-spin">
                  <circle cx="150" cy="140" r="108" strokeOpacity="0.15" strokeDasharray="4 10" />
                  <circle cx="150" cy="140" r="102" strokeOpacity="0.25" />
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 150 + Math.cos(rad) * 98;
                    const y1 = 140 + Math.sin(rad) * 98;
                    const x2 = 150 + Math.cos(rad) * 108;
                    const y2 = 140 + Math.sin(rad) * 108;
                    return (
                      <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeOpacity="0.35" strokeWidth="1.2" />
                    );
                  })}
                </g>

                {/* Main gantry body */}
                <circle cx="150" cy="140" r="88" strokeOpacity="0.9" strokeWidth="2" />
                <circle cx="150" cy="140" r="72" strokeOpacity="0.5" />
                <circle cx="150" cy="140" r="52" strokeOpacity="0.85" strokeWidth="1.8" />

                {/* Inner bore glow */}
                <circle cx="150" cy="140" r="38" strokeOpacity="0.3" fill="currentColor" fillOpacity="0.04" />
                <circle cx="150" cy="140" r="28" strokeOpacity="0.6" />
                <circle cx="150" cy="140" r="12" strokeOpacity="0.9" fill="currentColor" fillOpacity="0.08" />

                {/* Horizontal table / bed */}
                <rect x="145" y="132" width="230" height="14" rx="5" strokeOpacity="0.9" strokeWidth="1.6" />
                <rect x="145" y="132" width="230" height="14" rx="5" fill="currentColor" fillOpacity="0.06" className="table-glow" />
                {/* Table rails */}
                <path d="M145 132h230M145 146h230" strokeOpacity="0.25" strokeWidth="0.8" />
                {/* Table foot */}
                <rect x="355" y="146" width="14" height="55" rx="3" strokeOpacity="0.55" />
                <rect x="350" y="198" width="24" height="6" rx="2" strokeOpacity="0.4" />

                {/* Head coil / support */}
                <path d="M200 132q20-16 40 0" strokeOpacity="0.7" strokeLinecap="round" />
                <path d="M208 128q12-10 24 0" strokeOpacity="0.4" strokeLinecap="round" />

                {/* Control console */}
                <rect x="300" y="200" width="100" height="70" rx="6" strokeOpacity="0.85" strokeWidth="1.5" />
                <rect x="300" y="200" width="100" height="70" rx="6" fill="currentColor" fillOpacity="0.04" />
                {/* Screen */}
                <rect x="310" y="210" width="80" height="36" rx="3" strokeOpacity="0.6" fill="currentColor" fillOpacity="0.08" />
                {/* Waveform on screen */}
                <path d="M318 228l8-10 6 14 7-18 6 10 8-6 8 8 7-4 8 6" strokeOpacity="0.9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
                {/* Buttons */}
                <circle cx="320" cy="258" r="4" strokeOpacity="0.5" className="status-pulse" fill="currentColor" fillOpacity="0.3" />
                <circle cx="338" cy="258" r="4" strokeOpacity="0.4" />
                <circle cx="356" cy="258" r="4" strokeOpacity="0.4" />
                <rect x="372" y="254" width="18" height="8" rx="2" strokeOpacity="0.45" />

                {/* Status lights on gantry */}
                <circle cx="95" cy="70" r="3.5" fill="currentColor" fillOpacity="0.7" className="status-pulse" stroke="none" />
                <circle cx="205" cy="70" r="3.5" fill="currentColor" fillOpacity="0.5" stroke="none" />
                <circle cx="95" cy="210" r="3.5" fill="currentColor" fillOpacity="0.45" stroke="none" />

                {/* Beam-on indicator — pulsing treatment status */}
                <circle cx="150" cy="70" r="4" fill="currentColor" fillOpacity="0.9" className="beam-on" stroke="none" />
                <text x="162" y="73" fill="currentColor" fillOpacity="0.6" fontSize="8" fontFamily="system-ui" letterSpacing="1.2">
                  BEAM ON
                </text>

                {/* Crosshair markers */}
                <path d="M150 52v12M150 216v12M62 140h12M226 140h12" strokeOpacity="0.35" strokeLinecap="round" />

                {/* Scanning beam (animated) */}
                <rect className="scan-beam" x="60" y="100" width="40" height="80" fill="url(#beamGradient)" stroke="none" opacity="0.5" />

                {/* Gradient definition for beam */}
                <defs>
                  <linearGradient id="beamGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                    <stop offset="50%" stopColor="currentColor" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Label */}
                <text x="150" y="268" textAnchor="middle" fill="currentColor" fillOpacity="0.45" fontSize="11" fontFamily="system-ui" letterSpacing="1.5">
                  3.0T WIDE-BORE MRI
                </text>
              </svg>
            </div>
            </PowerOnGantry>
          </TiltCard>
        </Reveal>

        {/* Copy + specs */}
        <div>
          <Reveal variant="right">
            <SectionHeader
              align="start"
              tone="dark"
              eyebrow={isFa ? "دستگاه‌های ما" : "Our Equipment"}
              title={
                isFa
                  ? "فناوری که به آن اعتماد می‌کنید"
                  : "Technology worth trusting"
              }
              subtitle={
                isFa
                  ? "دستگاه‌های ما استانداردهای بالینی روز دنیا را رعایت می‌کنند تا تصاویری واضح و قابل اتکا برای پزشک شما فراهم شود."
                  : "Our scanners are calibrated to current clinical standards, producing clear, dependable images your doctor can act on."
              }
            />
          </Reveal>

          <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 sm:gap-6">
            {specs.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="cursor-default">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {s.label}
                  </dt>
                  <dd className="mt-1.5 text-xl font-semibold text-white">
                    {s.value}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>

          {modalities.length > 0 && (
            <Reveal delay={150} className="mt-8">
              <ul className="flex flex-wrap items-center gap-2">
                {modalities.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors duration-300 hover:border-primary/50 hover:text-white"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}