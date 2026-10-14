import type { Metadata } from "next";
import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo";
import { medicalProcedureSchema, breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import { RadiationIcon } from "@/components/ui/icons";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import FAQ from "@/components/FAQ";
import ServiceCard from "@/components/services/ServiceCard";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Module-level icon constants â€” created once, reused every render
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const targetIcon = (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className="h-8 w-8"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="32" cy="32" r="22" strokeOpacity="0.3" />
    <circle cx="32" cy="32" r="14" />
    <circle cx="32" cy="32" r="5" fill="currentColor" stroke="none" />
    <path
      d="M32 8v6M32 50v6M8 32h6M50 32h6"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />
  </svg>
);

const brainIcon = (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className="h-8 w-8"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      d="M22 28c0-7 5-13 13-13s13 6 13 13c0 3.5-1.2 6.5-3.5 8.5 2.2 1.8 3.5 4.5 3.5 7.5 0 6-5 11-13 11s-13-5-13-11c0-3 1.3-5.7 3.5-7.5C23.2 34.5 22 31.5 22 28z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 24c2 .8 4 1.2 6 1.2s4-.4 6-1.2M26 32c3 1.2 6 1.8 8 1.8s5-.6 8-1.8"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />
  </svg>
);

const boltIcon = (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className="h-8 w-8"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M34 8L18 34h12l-4 22 20-28H34l4-20z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const shieldIcon = (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className="h-8 w-8"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    {/* Shield outline with gradient depth */}
    <path
      d="M32 6 14 12v14c0 13.5 8.2 23.5 18 28 9.8-4.5 18-14.5 18-28V12L32 6Z"
      strokeLinejoin="round"
    />
    {/* Inner shield ring */}
    <path
      d="M32 10 18 15v11.5c0 11 6.5 19.5 14 23 7.5-3.5 14-12 14-23V15L32 10Z"
      strokeOpacity="0.25"
      strokeDasharray="3 4"
    />
    {/* Checkmark */}
    <path
      d="M24 32l5.5 5.5L41 25"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    {/* Corner accents */}
    <path d="M32 6v4M32 54v4" strokeOpacity="0.2" strokeWidth="1" />
  </svg>
);

const wavesIcon = (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className="h-8 w-8"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    {/* Concentric ultrasound waves */}
    <path
      d="M22 10c9 4.5 9 11 0 15.5 9 4.5 9 11 0 15.5 9 4.5 9 11 0 15.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42 10c-9 4.5-9 11 0 15.5-9 4.5-9 11 0 15.5-9 4.5-9 11 0 15.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Beam center line */}
    <path d="M32 10v44" strokeOpacity="0.15" strokeWidth="0.8" />
    {/* Scan plane indicators */}
    <path d="M26 18h12M26 32h12M26 46h12" strokeLinecap="round" strokeOpacity="0.35" />
    {/* Transducer origin */}
    <circle cx="32" cy="10" r="2" fill="currentColor" stroke="none" opacity="0.4" />
  </svg>
);

const planningIcon = (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className="h-8 w-8"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    {/* Patient head profile */}
    <circle cx="26" cy="20" r="8" />
    <path d="M12 50c0-8 6-14 14-14s14 6 14 14" strokeLinecap="round" />
    {/* Isodose contour lines */}
    <ellipse cx="42" cy="22" rx="6" ry="4" strokeOpacity="0.4" />
    <ellipse cx="42" cy="22" rx="10" ry="7" strokeOpacity="0.25" />
    <ellipse cx="42" cy="22" rx="14" ry="10" strokeOpacity="0.15" />
    {/* Beam angle indicators */}
    <path d="M40 24c3-1.5 5-4.6 5-8" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M38 36c5 1 9 5.5 10 12" strokeLinecap="round" strokeOpacity="0.5" />
    {/* Target crosshair */}
    <circle cx="42" cy="22" r="1.5" fill="currentColor" stroke="none" />
    <path d="M42 18v-2M42 26v2M38 22h-2M46 22h2" strokeOpacity="0.3" strokeWidth="0.8" />
  </svg>
);

const highlightTargetIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="12" cy="12" r="8.5" strokeOpacity="0.2" strokeDasharray="2 3" />
    <circle cx="12" cy="12" r="5.5" strokeOpacity="0.4" />
    <circle cx="12" cy="12" r="2.5" strokeOpacity="0.7" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" strokeOpacity="0.3" strokeWidth="1" />
  </svg>
);

const highlightTechIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
    <rect x="9" y="9" width="6" height="6" rx="1" strokeOpacity="0.3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" strokeOpacity="0.35" />
    <path d="M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" strokeLinecap="round" strokeOpacity="0.25" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" opacity="0.5" />
  </svg>
);

const highlightTeamIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    {/* Lead clinician */}
    <circle cx="9" cy="8" r="3" />
    {/* Supporting team */}
    <circle cx="17" cy="9" r="2.2" strokeOpacity="0.5" />
    <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" strokeLinecap="round" />
    <path d="M15.5 14.5c2.4.3 4.5 2.5 4.5 5.5" strokeLinecap="round" strokeOpacity="0.5" />
    {/* Connection line */}
    <path d="M12 8h3" strokeOpacity="0.2" strokeWidth="0.8" />
  </svg>
);

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getServerDictionary();
  const title = dict.services.metaTitle;
  const description = dict.services.metaDescription;

  return {
    title: dict.services.title,
    description,
    alternates: {
      canonical: "/services",
      languages: {
        "fa-IR": "/services",
        "en-US": "/services",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}/services`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const revalidate = 3600;

export default async function ServicesPage() {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  /** Locale-aware zero-padded ordinal ("01" / "Û°Û±") */
  const ordinal = (n: number) => {
    const label = String(n).padStart(2, "0");
    return isFa ? toFarsiDigits(label) : label;
  };

  const heroHighlights = [
    { label: dict.services.highlight1, svg: highlightTargetIcon },
    { label: dict.services.highlight2, svg: highlightTechIcon },
    { label: dict.services.highlight3, svg: highlightTeamIcon },
  ];

  const services = [
    {
      title: dict.services.service1Title,
      description: dict.services.service1Desc,
      features: dict.services.service1Features,
      svg: targetIcon,
    },
    {
      title: dict.services.service2Title,
      description: dict.services.service2Desc,
      features: dict.services.service2Features,
      svg: brainIcon,
    },
    {
      title: dict.services.service3Title,
      description: dict.services.service3Desc,
      features: dict.services.service3Features,
      svg: boltIcon,
    },
    {
      title: dict.services.service4Title,
      description: dict.services.service4Desc,
      features: dict.services.service4Features,
      svg: shieldIcon,
    },
    {
      title: dict.services.service5Title,
      description: dict.services.service5Desc,
      features: dict.services.service5Features,
      svg: wavesIcon,
    },
    {
      title: dict.services.service6Title,
      description: dict.services.service6Desc,
      features: dict.services.service6Features,
      svg: planningIcon,
    },
  ];

  const stats = [
    { value: dict.services.stat1Value, suffix: dict.services.stat1Suffix, label: dict.services.stat1Label },
    { value: dict.services.stat2Value, suffix: dict.services.stat2Suffix, label: dict.services.stat2Label },
    { value: dict.services.stat3Value, suffix: dict.services.stat3Suffix, label: dict.services.stat3Label },
    { value: dict.services.stat4Value, suffix: dict.services.stat4Suffix, label: dict.services.stat4Label },
  ];

  const processSteps = [
    { title: dict.services.process1Title, desc: dict.services.process1Desc },
    { title: dict.services.process2Title, desc: dict.services.process2Desc },
    { title: dict.services.process3Title, desc: dict.services.process3Desc },
    { title: dict.services.process4Title, desc: dict.services.process4Desc },
  ];

  const procedureSchemas = services.map((service) =>
    medicalProcedureSchema(service.title, service.description, service.features),
  );
  const breadcrumbs = breadcrumbSchema([
    { name: dict.services.breadcrumbHome, path: "/" },
    { name: dict.services.breadcrumbCurrent, path: "/services" },
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={[...procedureSchemas, breadcrumbs]} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          GLOBAL AMBIENT FIELD â€” theme-aware, compositor-promoted orbs.
          The third orb is hidden on mobile to cut GPU paint cost.
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px] [transform:translateZ(0)]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px] [transform:translateZ(0)]" />
        <div className="absolute left-1/3 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px] [transform:translateZ(0)] md:block" />
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” clean medical-tech hero
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <PageHero
        badge={dict.services.title}
        title={dict.services.title}
        subtitle={dict.services.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[320px]">
            {/* Static glow â€” no infinite pulse, cheaper compositing */}
            <RadiationIcon className="h-full w-full text-primary" />
          </div>
        }
      >
        {/* Highlight strip */}
        <div className="mt-9 flex flex-wrap gap-x-8 gap-y-5">
          {heroHighlights.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
                {item.svg}
              </span>
              <span className="text-sm font-medium text-slate-200">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </PageHero>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          STATS â€” animated credibility counters
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              {dict.services.statsTitle}
            </div>
          </Reveal>
          <dl className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-7">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 110}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 text-center shadow-[0_18px_40px_-24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_22px_45px_-20px_rgba(15,23,42,0.10)]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <dd className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                    <CountUp
                      end={stat.value}
                      suffix={stat.suffix}
                      duration={2.2}
                      useFarsiDigits={isFa}
                    />
                  </dd>
                  <dt className="mt-2.5 text-sm font-medium leading-snug text-text-secondary">
                    {stat.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SERVICES GRID â€” staggered reveal, accent rotation, spotlight
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 overflow-hidden py-16 lg:py-20">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal
                key={service.title}
                delay={(i % 3) * 110}
                className={i === 0 || i === services.length - 1 ? "lg:col-span-2" : undefined}
              >
                <ServiceCard
                  title={service.title}
                  features={service.features}
                  icon={service.svg}
                  index={i}
                  numberLabel={ordinal(i + 1)}
                  ctaLabel={dict.services.cardCta}
                  featured={i === 0 || i === services.length - 1}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PROCESS TIMELINE â€” four-step treatment journey
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 overflow-hidden py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              {dict.services.processBadge}
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {dict.services.processTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
              {dict.services.processSubtitle}
            </p>
          </Reveal>

          <div className="relative mt-14">
            {/* Connecting line (desktop only) */}
            <div
              aria-hidden="true"
              className="absolute inset-x-16 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent lg:block"
            />
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {processSteps.map((step, i) => (
                <Reveal key={step.title} delay={i * 130}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-surface text-lg font-extrabold text-primary shadow-lg shadow-primary/20 ring-1 ring-primary/20">
                      {ordinal(i + 1)}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-text-secondary">
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA CARD â€” dark section with RadiotherapyScene
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-primary/15 bg-deep shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]">
          <div className="grid items-center lg:grid-cols-2">
            {/* Visual — dossier trefoil watermark on the ink panel */}
            <div className="relative hidden min-h-[320px] items-center justify-center lg:flex">
              <div className="planning-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
              <RadiationIcon className="relative h-56 w-56 text-highlight/25" />
            </div>

            {/* Text */}
            <div className="p-10 text-center sm:p-12 lg:p-14 lg:text-start">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-highlight lg:mx-0">
                <span aria-hidden="true" className="h-1.5 w-1.5 motion-reduce:animate-none rounded-full bg-primary motion-reduce:animate-none" />
                {dict.services.ctaBadge}
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {dict.services.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300/90 lg:mx-0">
                {dict.services.ctaSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link
                  href="/booking"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-deep shadow-xl shadow-primary/30 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-deep hover:bg-primary-hover hover:shadow-primary/50 active:scale-[0.97]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full rtl:translate-x-full rtl:group-hover:-translate-x-full"
                  />
                  <span className="relative flex items-center gap-2">
                    {dict.services.bookConsultation}
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/forum"
                  className="rounded-lg px-2 py-1 text-sm font-medium text-slate-300 underline-offset-4 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/60 hover:text-primary hover:underline"
                >
                  {dict.services.askForum}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FAQ â€” accordion + FAQPage JSON-LD (built into the component)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <FAQ
        title={dict.services.faqTitle}
        subtitle={dict.services.faqSubtitle}
        items={dict.services.faq}
      />
    </div>
  );
}