import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo/seo";
import { medicalProcedureSchema, breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import RadiotherapyScene from "@/components/ui/RadiotherapyScene";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import FAQ from "@/components/ui/FAQ";
import ServiceCard from "@/components/services/ServiceCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { locale: "fa" as const },
    { locale: "en" as const },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const title = dict.services.metaTitle;
  const description = dict.services.metaDescription;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/services`,
      languages: {
        "fa-IR": `${siteConfig.url}/fa/services`,
        "en-US": `${siteConfig.url}/en/services`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}/${locale}/services`,
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
    <path
      d="M32 6 14 12v14c0 13.5 8.2 23.5 18 28 9.8-4.5 18-14.5 18-28V12L32 6Z"
      strokeLinejoin="round"
    />
    <path
      d="M32 10 18 15v11.5c0 11 6.5 19.5 14 23 7.5-3.5 14-12 14-23V15L32 10Z"
      strokeOpacity="0.25"
      strokeDasharray="3 4"
    />
    <path
      d="M24 32l5.5 5.5L41 25"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
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
    <path d="M22 10c9 4.5 9 11 0 15.5 9 4.5 9 11 0 15.5 9 4.5 9 11 0 15.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M42 10c-9 4.5-9 11 0 15.5-9 4.5-9 11 0 15.5-9 4.5-9 11 0 15.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 10v44" strokeOpacity="0.15" strokeWidth="0.8" />
    <path d="M26 18h12M26 32h12M26 46h12" strokeLinecap="round" strokeOpacity="0.35" />
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
    <circle cx="26" cy="20" r="8" />
    <path d="M12 50c0-8 6-14 14-14s14 6 14 14" strokeLinecap="round" />
    <ellipse cx="42" cy="22" rx="6" ry="4" strokeOpacity="0.4" />
    <ellipse cx="42" cy="22" rx="10" ry="7" strokeOpacity="0.25" />
    <ellipse cx="42" cy="22" rx="14" ry="10" strokeOpacity="0.15" />
    <path d="M40 24c3-1.5 5-4.6 5-8" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M38 36c5 1 9 5.5 10 12" strokeLinecap="round" strokeOpacity="0.5" />
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
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.2" strokeOpacity="0.5" />
    <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" strokeLinecap="round" />
    <path d="M15.5 14.5c2.4.3 4.5 2.5 4.5 5.5" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M12 8h3" strokeOpacity="0.2" strokeWidth="0.8" />
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

function SectionBadge({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium ${
        dark
          ? "border-primary/30 bg-primary/10 text-highlight"
          : "border-primary/25 bg-primary/10 text-primary"
      }`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-fill" />
      {label}
    </div>
  );
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  const breadcrumbs = breadcrumbSchema([
    { name: dict.services.breadcrumbHome, path: `/${locale}` },
    { name: dict.services.breadcrumbCurrent, path: `/${locale}/services` },
  ]);

  const ordinal = (n: number) => (isFa ? `${n}م` : `${n}`);

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

  const processSteps = [
    { title: dict.services.process1Title, desc: dict.services.process1Desc },
    { title: dict.services.process2Title, desc: dict.services.process2Desc },
    { title: dict.services.process3Title, desc: dict.services.process3Desc },
    { title: dict.services.process4Title, desc: dict.services.process4Desc },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <ParticleBackground id="particles-services" className="text-muted" />
      </div>

      <PageHero
        badge={dict.services.title}
        title={dict.services.title}
        subtitle={dict.services.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <div className="absolute inset-[10%] rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <RadiationEmblem variant="atom" />
          </div>
        }
      />

      <section className="relative z-10 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-fill" />
              {dict.services.statsTitle}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {dict.services.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-text-secondary">
              {dict.services.subtitle}
            </p>
          </Reveal>

          <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {heroHighlights.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
                  {item.svg}
                </span>
                <span className="text-sm font-medium text-text-secondary">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 lg:py-28">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.15]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-fill" />
              {dict.services.title}
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {dict.services.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              {dict.services.subtitle}
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                features={service.features}
                icon={service.svg}
                index={i}
                ctaLabel={dict.services.bookConsultation}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden py-24 lg:py-28">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.15]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-fill" />
              {dict.services.processBadge}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                {dict.services.processTitle}
              </h2>
              <span aria-hidden="true" className="hidden font-mono text-xs tracking-widest text-text-secondary/70 sm:block">
                01 <span className="text-primary">/</span> 04
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              {dict.services.processSubtitle}
            </p>
          </Reveal>

          <div className="relative mt-10 md:mt-14">
            <div aria-hidden="true" className="absolute bottom-8 top-8 start-[21px] w-px bg-border/70 md:bottom-auto md:start-[12.5%] md:end-[12.5%] md:top-[21px] md:h-px md:w-auto" />
            <ol dir={isFa ? "rtl" : "ltr"} className="relative grid gap-7 md:grid-cols-4 md:gap-0">
            {processSteps.map((step, i) => (
                <li key={step.title} className="relative flex gap-5 md:flex-col md:items-center md:gap-0 md:px-4 md:text-center">
                  <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-bg font-mono text-sm font-semibold text-primary">
                    {isFa ? toFarsiDigits(i + 1) : i + 1}
                  </span>
                  <div className="min-w-0 flex-1 border-b border-border/60 pb-6 md:mt-6 md:flex-none md:border-0 md:pb-0">
                    <span className="font-mono text-[11px] tracking-widest text-primary/75">
                      {isFa ? "مرحله" : "STEP"} {isFa ? toFarsiDigits(String(i + 1).padStart(2, "0")) : String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-text-primary sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary md:mx-auto">
                    {step.desc}
                    </p>
                  </div>
                </li>
            ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-primary/15 bg-deep shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]">
          <div className="grid items-center lg:grid-cols-2">
            <RadiotherapyScene />

            <div className="p-10 text-center sm:p-12 lg:p-14 lg:text-start">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-highlight lg:mx-0">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-fill motion-reduce:animate-none"
                />
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
                  href={`/${locale}/booking`}
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
                  href={`/${locale}/forum`}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-slate-300 underline-offset-4 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/60 hover:text-primary hover:underline"
                >
                  {dict.services.askForum}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQ
        title={dict.services.faqTitle}
        subtitle={dict.services.faqSubtitle}
        items={dict.services.faq}
      />
    </div>
  );
}

