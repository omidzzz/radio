import type { Metadata } from "next";
import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo/seo";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import RadiotherapyScene from "@/components/ui/RadiotherapyScene";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import FAQ from "@/components/ui/FAQ";
import ManagedTreatments from "@/components/services/ManagedTreatments";

/* ────────────────────────────────────────────────────────────────
   Module-level icon constants — created once, reused every render
──────────────────────────────────────────────────────────────── */
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

export const revalidate = 86400;

export default async function ServicesPage() {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  const heroHighlights = [
    { label: dict.services.highlight1, svg: highlightTargetIcon },
    { label: dict.services.highlight2, svg: highlightTechIcon },
    { label: dict.services.highlight3, svg: highlightTeamIcon },
  ];

  const stats = [
    { value: dict.services.stat1Value, suffix: dict.services.stat1Suffix, label: dict.services.stat1Label },
    { value: dict.services.stat2Value, suffix: dict.services.stat2Suffix, label: dict.services.stat2Label },
    { value: dict.services.stat3Value, suffix: dict.services.stat3Suffix, label: dict.services.stat3Label },
    { value: dict.services.stat4Value, suffix: dict.services.stat4Suffix, label: dict.services.stat4Label },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: dict.services.breadcrumbHome, path: "/" },
    { name: dict.services.breadcrumbCurrent, path: "/services" },
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL AMBIENT FIELD — theme-aware, compositor-promoted orbs.
          The third orb is hidden on mobile to cut GPU paint cost.
      ══════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px] [transform:translateZ(0)]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px] [transform:translateZ(0)]" />
        <div className="absolute left-1/3 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px] [transform:translateZ(0)] md:block" />
        <ParticleBackground id="particles-services" className="text-muted" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO — clean medical-tech hero
      ══════════════════════════════════════════════════════════════ */}
      <PageHero
        badge={dict.services.title}
        title={dict.services.title}
        subtitle={dict.services.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[320px]">
            {/* Static glow — no infinite pulse, cheaper compositing */}
            <div className="absolute inset-[10%] rounded-full bg-primary/20 blur-3xl" />
            <RadiationEmblem variant="services" />
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

      {/* ══════════════════════════════════════════════════════════════
          STATS — animated credibility counters
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-fill" />
              {dict.services.statsTitle}
            </div>
          </Reveal>
          <dl className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-7">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 110}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 text-center shadow-[0_18px_40px_-24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_22px_45px_-20px_rgba(26,115,82,0.25)]">
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

      <ManagedTreatments atlas={dict.services.catalog} journey={dict.services.journey} locale={locale} ctaLabel={dict.services.bookConsultation} />

      {/* ══════════════════════════════════════════════════════════════
          CTA CARD — dark section with RadiotherapyScene
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-primary/15 bg-deep shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]">
          <div className="grid items-center lg:grid-cols-2">
            {/* Visual */}
            <RadiotherapyScene />

            {/* Text */}
            <div className="p-10 text-center sm:p-12 lg:p-14 lg:text-start">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-highlight lg:mx-0">
                <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-fill motion-reduce:animate-none" />
                {dict.services.ctaBadge}
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {dict.services.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-on-dark/90 lg:mx-0">
                {dict.services.ctaSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link
                  href="/booking"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-fill px-8 py-3.5 text-base font-semibold text-on-primary shadow-xl shadow-primary/30 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-deep hover:bg-primary-fill-hover hover:shadow-primary/50 active:scale-[0.97]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full rtl:translate-x-full rtl:group-hover:-translate-x-full"
                  />
                  <span className="relative flex items-center gap-2">
                    {dict.services.bookConsultation}
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

      {/* ══════════════════════════════════════════════════════════════
          FAQ — accordion + FAQPage JSON-LD (built into the component)
      ══════════════════════════════════════════════════════════════ */}
      <FAQ
        title={dict.services.faqTitle}
        subtitle={dict.services.faqSubtitle}
        items={dict.services.faq}
      />
    </div>
  );
}

