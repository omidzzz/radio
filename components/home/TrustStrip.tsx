interface TrustStripProps {
  isFa: boolean;
}

const trustMarks = [
  {
    key: "dicom",
    label: (isFa: boolean) => (isFa ? "مطابق استاندارد DICOM" : "DICOM Compliant"),
    svg: (
      <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="7" y="7" width="26" height="26" rx="5" strokeOpacity="0.85" />
        <path d="M7 14h26" strokeOpacity="0.4" />
        <rect x="11" y="10" width="4" height="3" rx="0.5" strokeOpacity="0.3" />
        <rect x="16" y="10" width="4" height="3" rx="0.5" strokeOpacity="0.3" />
        {/* Waveform data visualization */}
        <path d="M10 25l3-5 2.5 4 2.5-7 3 5 2.5-3 3.5 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        <circle cx="10" cy="25" r="1" fill="currentColor" stroke="none" opacity="0.5" />
        <circle cx="26" cy="22" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: "hipaa",
    label: (isFa: boolean) => (isFa ? "امنیت اطلاعات HIPAA" : "HIPAA Secure"),
    svg: (
      <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 4.5 5 9.5v9c0 9.5 5.8 16.5 15 19 9.2-2.5 15-9.5 15-19v-9z" strokeLinejoin="round" />
        <path d="M14 20l3.5 3.5 7-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        <circle cx="20" cy="20" r="12" strokeOpacity="0.15" strokeDasharray="2 3" />
      </svg>
    ),
  },
  {
    key: "acr",
    label: (isFa: boolean) => (isFa ? "تایید شده ACR" : "ACR Accredited"),
    svg: (
      <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="15" r="9" strokeWidth="1.5" />
        <path d="M15 23l-3.5 11 8.5-4.5 8.5 4.5L25 23" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        <path d="M16.5 15l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="20" cy="15" r="13" strokeOpacity="0.12" strokeDasharray="3 4" />
      </svg>
    ),
  },
  {
    key: "iso",
    label: () => "ISO 9001:2015",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="13" strokeOpacity="0.85" />
        <circle cx="20" cy="20" r="8" strokeOpacity="0.3" strokeDasharray="3 3" />
        <path d="M20 13v7l4.5 3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function TrustStrip({ isFa }: TrustStripProps) {
  return (
    <section className="content-visibility relative bg-bg section-pad-tight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Static row on md+; single-line swipe on mobile (no Reveal stagger) */}
        <div className="flex items-center justify-start gap-3 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trustMarks.map((mark) => (
            <div
              key={mark.key}
              className="surface-chip group flex shrink-0 items-center gap-2.5 px-4 py-2.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-primary transition-colors duration-200 group-hover:bg-primary-fill group-hover:text-on-primary">
                {mark.svg}
              </span>
              <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
                {mark.label(isFa)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}