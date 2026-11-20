import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/seo/seo";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import RadiotherapyScene from "@/components/ui/RadiotherapyScene";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import FAQ from "@/components/ui/FAQ";
import ManagedTreatments from "@/components/services/ManagedTreatments";

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

export default async function ServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);

  const breadcrumbs = breadcrumbSchema([
    { name: dict.services.breadcrumbHome, path: `/${locale}` },
    { name: dict.services.breadcrumbCurrent, path: `/${locale}/services` },
  ]);

  const heroHighlights = [
    { label: dict.services.highlight1, svg: highlightTargetIcon },
    { label: dict.services.highlight2, svg: highlightTechIcon },
    { label: dict.services.highlight3, svg: highlightTeamIcon },
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

      <ManagedTreatments atlas={dict.services.catalog} journey={dict.services.journey} locale={locale} ctaLabel={dict.services.bookConsultation} />

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

