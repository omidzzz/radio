import Reveal from "@/components/ui/Reveal";
import ChapterHead from "@/components/ui/ChapterHead";

interface EquipmentProps {
  isFa: boolean;
}

export default function Equipment({ isFa }: EquipmentProps) {
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
    <section className="mod-equipment content-visibility band-dark section-pad">
      <div className="grain-pattern pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
        {/* Detailed MRI illustration — static blueprint panel */}
        <Reveal variant="left" className="h-full">
          <div className="mod-frame-blueprint group relative mx-auto flex aspect-[4/3] w-full max-w-lg items-center justify-center p-6">

            <svg
              viewBox="0 0 420 300"
              fill="none"
              className="relative h-full w-full text-highlight"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              {/* Outer ring */}
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
                <rect x="145" y="132" width="230" height="14" rx="5" fill="currentColor" fillOpacity="0.06" />
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
                <circle cx="320" cy="258" r="4" strokeOpacity="0.5" fill="currentColor" fillOpacity="0.3" />
                <circle cx="338" cy="258" r="4" strokeOpacity="0.4" />
                <circle cx="356" cy="258" r="4" strokeOpacity="0.4" />
                <rect x="372" y="254" width="18" height="8" rx="2" strokeOpacity="0.45" />

                {/* Label */}
                <text x="150" y="268" textAnchor="middle" fill="currentColor" fillOpacity="0.45" fontSize="11" fontFamily="system-ui" letterSpacing="1.5">
                  3.0T WIDE-BORE MRI
                </text>
              </svg>
          </div>
        </Reveal>

        {/* Copy + specs */}
        <div>
          <Reveal variant="right">
            <ChapterHead
              align="start"
              tone="dark"
              index="03"
              label={isFa ? "دستگاه‌های ما" : "Our Equipment"}
              variant="panel"
              title={
                isFa
                  ? "فناوری که به آن اعتماد می‌کنید"
                  : "Technology worth trusting"
              }
              lede={
                isFa
                  ? "دستگاه‌های ما استانداردهای بالینی روز دنیا را رعایت می‌کنند تا تصاویری واضح و قابل اتکا برای پزشک شما فراهم شود."
                  : "Our scanners are calibrated to current clinical standards, producing clear, dependable images your doctor can act on."
              }
            />
          </Reveal>

          {/* Spec datasheet — dotted-leader rows, label … value */}
          <dl className="mod-frame-ledger mt-8 border-t border-[var(--color-rule-strong)] pt-4">
            {specs.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="leader-row group">
                  <dt className="readout__label text-muted transition-colors group-hover:text-highlight">
                    {s.label}
                  </dt>
                  <span className="leader-row__fill" aria-hidden="true" />
                  <dd className="tnum text-lg font-semibold text-text-on-dark">
                    {s.value}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}