import Reveal from "@/components/ui/Reveal";
import ChapterHead from "@/components/ui/ChapterHead";
import SeamlessMarquee from "@/components/ui/SeamlessMarquee";

interface CertificationBandProps {
  isFa: boolean;
}

/**
 * Credentials band.
 *
 * Deliberately excludes the marks already carried by TrustStrip near the
 * top of the page (DICOM / HIPAA / ACR / ISO 9001). This band shows the
 * distinctive accreditations and names what each one actually covers.
 */
const certs = [
  {
    key: "jci",
    label: "JCI",
    sub: (isFa: boolean) =>
      isFa ? "اعتباربخشی بیمارستانی" : "Hospital accreditation",
    Icon: RibbonIcon,
  },
  {
    key: "iaea",
    label: "IAEA",
    sub: (isFa: boolean) => (isFa ? "ایمنی پرتو" : "Radiation safety"),
    Icon: AtomIcon,
  },
  {
    key: "iso27001",
    label: "ISO 27001",
    sub: (isFa: boolean) => (isFa ? "امنیت اطلاعات" : "Information security"),
    Icon: ShieldIcon,
  },
  {
    key: "iso45001",
    label: "ISO 45001",
    sub: (isFa: boolean) => (isFa ? "ایمنی شغلی" : "Occupational safety"),
    Icon: HelmetIcon,
  },
];

export default function CertificationBand({ isFa }: CertificationBandProps) {
  return (
    <section className="mod-certification content-visibility relative bg-bg section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <ChapterHead
            index="06"
            label={
              isFa ? "گواهینامه‌ها و استانداردها" : "Certifications & Standards"
            }
            variant="panel"
            title={
              isFa
                ? "زیر نظر استانداردهای جهانی"
                : "Held to global standards"
            }
            lede={
              isFa
                ? "هر فرآیند کلینیک — از تصویربرداری تا حفاظت اطلاعات بیمار — با یک استاندارد بین‌المللی سنجیده می‌شود."
                : "Every clinical process — from imaging to patient-data protection — is measured against an international standard."
            }
          />
        </Reveal>
      </div>

      {/* Infinite CSS marquee — GPU transform, works in both LTR and RTL */}
      <div className="relative mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent sm:w-24" />

        <SeamlessMarquee className="px-4 sm:px-12" duration={36}>
          {certs.map((c) => (
            <div key={c.key} className="px-3">
              <div className="stamp group flex shrink-0 items-center gap-4 px-6 py-4">
                <span className="reticle relative flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-surface text-primary">
                  <c.Icon />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="mono text-sm font-bold uppercase tracking-widest text-text-primary">
                    {c.label}
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-muted">
                    {c.sub(isFa)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </SeamlessMarquee>
      </div>
    </section>
  );
}

const iconProps = {
  viewBox: "0 0 40 40",
  fill: "none",
  className: "h-5 w-5",
  stroke: "currentColor",
  strokeWidth: 1.5,
  "aria-hidden": true,
} as const;

/** Award ribbon — accreditation */
function RibbonIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="20" cy="16" r="9.5" strokeOpacity="0.85" />
      <path
        d="M15 24.5 11.5 35l8.5-4.5 8.5 4.5L25 24.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 16l2.5 2.5 5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

/** Atom — radiation / nuclear safety */
function AtomIcon() {
  return (
    <svg {...iconProps}>
      <ellipse cx="20" cy="20" rx="14" ry="5.5" strokeOpacity="0.8" />
      <ellipse
        cx="20"
        cy="20"
        rx="14"
        ry="5.5"
        strokeOpacity="0.5"
        transform="rotate(60 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="14"
        ry="5.5"
        strokeOpacity="0.5"
        transform="rotate(-60 20 20)"
      />
      <circle cx="20" cy="20" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Shield with keyhole — information security */
function ShieldIcon() {
  return (
    <svg {...iconProps}>
      <path
        d="M20 5 8 9.5v8.5c0 8 5 14.5 12 17 7-2.5 12-9 12-17V9.5z"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
      <circle cx="20" cy="18" r="3" strokeWidth="1.6" />
      <path d="M20 21v5" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

/** Safety helmet — occupational health & safety */
function HelmetIcon() {
  return (
    <svg {...iconProps}>
      <path
        d="M7 24a13 13 0 0 1 26 0"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      <path d="M5 24h30" strokeLinecap="round" strokeOpacity="0.7" />
      <path
        d="M20 11v5"
        strokeLinecap="round"
        strokeOpacity="0.55"
        strokeWidth="1.3"
      />
      <path
        d="M20 24v6"
        strokeLinecap="round"
        strokeOpacity="0.35"
        strokeWidth="1.3"
      />
    </svg>
  );
}

