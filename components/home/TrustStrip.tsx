interface TrustStripProps {
  isFa: boolean;
}

const trustMarks = [
  {
    key: "dicom",
    label: (isFa: boolean) => (isFa ? "مطابق استاندارد DICOM" : "DICOM Compliant"),
    svg: (
      <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
      <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
      <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
      <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="20" cy="20" r="13" strokeOpacity="0.85" />
        <circle cx="20" cy="20" r="8" strokeOpacity="0.3" strokeDasharray="3 3" />
        <path d="M20 13v7l4.5 3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

/**
 * Credential strip — a telemetry status bar: LED-marked cells divided by
 * hairlines, scrolling horizontally on small screens. Reads like the
 * "system checks" row at the top of a console, not a pill list.
 */
export default function TrustStrip({ isFa }: TrustStripProps) {
  return (
    <section className="mod-truststrip border-y border-[var(--color-border)] bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-start gap-0 overflow-x-auto py-3.5 [scrollbar-width:none] sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {trustMarks.map((mark) => (
            <li
              key={mark.key}
              className="status-cell flex shrink-0 items-center gap-2.5 px-4 first:ps-0 sm:px-6"
            >
              <span className="status-led" aria-hidden="true" />
              <span className="hidden text-secondary sm:block" aria-hidden="true">
                {mark.svg}
              </span>
              <span className="readout__label whitespace-nowrap text-text-secondary">
                {mark.label(isFa)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}