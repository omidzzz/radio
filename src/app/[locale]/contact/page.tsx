import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import Link from "next/link";
import { siteConfig } from "@/lib/seo/seo";
import { breadcrumbSchema, contactPageSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import PageHero from "@/components/ui/PageHero";
import {
  getWorkingHoursSummary,
  getOpenNowStatus,
} from "@/lib/services/working-hours";
import {
  PhoneIcon,
  PhoneCallIcon,
  ClockIcon,
  MapPinIcon,
  MailIcon,
  ChatIcon,
  CareIcon,
} from "@/components/ui/icons";

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
  const isFa = locale === "fa";

  return {
    title: isFa ? "تماس با ما" : "Contact",
    description: isFa
      ? "تماس با دکتر پری قدمگاهی: آدرس، تلفن، ایمیل و ساعات کاری. برای رزرو نوبت یا سوالات درمانی با ما در ارتباط باشید."
      : "Contact Dr. Pari Ghadamgahi: address, phone, email, and working hours.",
    alternates: {
      canonical: `/${locale}/contact`,
    },
    openGraph: {
      title: isFa ? "تماس با ما | دکتر پری قدمگاهی" : "Contact | Dr. Pari Ghadamgahi",
      description: isFa
        ? "تماس با دکتر پری قدمگاهی: آدرس، تلفن، ایمیل و ساعات کاری."
        : "Contact Dr. Pari Ghadamgahi: address, phone, email, and working hours.",
      type: "website",
      url: `${siteConfig.url}/${locale}/contact`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: isFa ? "تماس با ما | دکتر پری قدمگاهی" : "Contact | Dr. Pari Ghadamgahi",
      description: isFa
        ? "تماس با دکتر پری قدمگاهی: آدرس، تلفن، ایمیل و ساعات کاری."
        : "Contact Dr. Pari Ghadamgahi: address, phone, email, and working hours.",
    },
  };
}

export const revalidate = 86400;

const HERO_FEATURE_ICONS = [
  <MapPinIcon key="pin" className="h-5 w-5" />,
  <CareIcon key="care" className="h-5 w-5" />,
  <ClockIcon key="clock" className="h-5 w-5" />,
] as const;

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const workingHours = getWorkingHoursSummary(locale);
  const closedLabel = locale === "fa" ? "تعطیل" : "Closed";
  const { isOpen } = getOpenNowStatus();
  const openLabel = isOpen ? dict.contact.openNow : dict.contact.closedNow;
  const breadcrumbs = breadcrumbSchema([
    { name: locale === "fa" ? "خانه" : "Home", path: `/${locale}` },
    { name: dict.contact.title, path: `/${locale}/contact` },
  ]);
  const heroFeatures = [
    { label: dict.contact.feature1Label, sub: dict.contact.feature1Sub },
    { label: dict.contact.feature2Label, sub: dict.contact.feature2Sub },
    { label: dict.contact.feature3Label, sub: dict.contact.feature3Sub },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />
      <JsonLdScript data={contactPageSchema()} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />
        <ParticleBackground id="particles-contact" className="text-muted" />
      </div>

      <PageHero
        badge={dict.contact.title}
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="absolute inset-[8%] rounded-full bg-primary/25 blur-3xl animate-pulse" />
            <RadiationEmblem variant="atom" />
          </div>
        }
      >
        <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
          {heroFeatures.map((f, i) => (
            <div
              key={f.label}
              className={`anim-fade-up delay-${(i + 1) * 200} flex flex-col items-start gap-2.5`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                {HERO_FEATURE_ICONS[i]}
              </div>
              <p className="text-sm font-medium leading-tight text-text-on-dark">
                {f.label}
              </p>
              <p className="text-xs leading-tight text-text-secondary/90">{f.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={siteConfig.phoneHref}
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/15"
          >
            <PhoneIcon className="h-4 w-4 text-primary" />
            {dict.contact.quickCall}
          </a>

          <a
            href="#form"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary-fill px-6 py-2.5 text-sm font-semibold text-on-primary shadow-[0_0_28px_-4px_rgba(26,115,82,0.6)] transition-all hover:bg-primary-fill-hover hover:shadow-[0_0_36px_-4px_rgba(26,115,82,0.75)]"
          >
            <span className="relative z-10">{dict.contact.sendMessage}</span>
          </a>
        </div>
      </PageHero>

      <section id="form" className="contact-flow-section relative z-10 pb-8 pt-4 lg:pb-14">
        <div
          className="grain-pattern pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            maskImage:
              "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="relative lg:col-span-7">
              <div className="contact-panel contact-form-panel relative flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                <div className="relative h-1.5 shrink-0 overflow-hidden bg-deep">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#c9a24b] to-secondary" />
                  <div className="absolute inset-y-0 left-0 w-2/5 animate-pulse bg-white/25" />
                </div>
                <div className="flex items-center gap-2.5 border-b border-border px-6 py-5 sm:px-8">
                  <ChatIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold text-text-primary sm:text-lg">{dict.contact.formTitle}</h2>
                </div>
                <div className="p-6 sm:p-8"><ContactForm /></div>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="contact-panel contact-map-panel relative flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-semibold text-text-primary sm:text-lg">{dict.contact.mapCardTitle}</h2>
                  </div>
                </div>
                <MapEmbed
                  embedUrl={siteConfig.mapsEmbedUrl}
                  directionsUrl={siteConfig.mapsDirectionsUrl}
                  loadLabel={dict.contact.loadMap}
                  openLabel={dict.contact.openInMaps}
                  title="Google Maps - Dr. Pari Ghadamgahi"
                />
                <div className="contact-location-block border-t px-6 py-5 sm:px-8">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-soft text-primary"><MapPinIcon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted">{dict.contact.address}</p>
                      <a href={siteConfig.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="contact-full-address mt-1 block text-sm font-medium leading-7 text-text-primary transition-colors hover:text-primary">
                        <span className="block">{dict.footer.addressLine1}</span>
                        <span className="block">{dict.footer.addressLine2}</span>
                        <span className="block">{dict.footer.addressLine3}</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 px-6 py-5 sm:px-8">
                  <a href={`mailto:${siteConfig.email}`} dir="ltr" className="contact-method-card group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/40"><MailIcon className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 break-all text-sm text-text-primary group-hover:text-primary">{siteConfig.email}</span></a>
                  <a href={siteConfig.phoneHref} dir="ltr" className="contact-method-card group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/40"><PhoneIcon className="h-4 w-4 shrink-0 text-primary" /><span className="text-sm text-text-primary group-hover:text-primary">{locale === "fa" ? toFarsiDigits(siteConfig.phone) : siteConfig.phone}</span></a>
                  <div className="contact-method-card rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-2 font-medium text-text-primary"><ClockIcon className="h-4 w-4 text-primary" />{dict.contact.officeHours}<span className="ms-auto text-xs text-primary">{openLabel}</span></div>
                    <div className="mt-2 space-y-1">{workingHours.map((entry) => <span key={entry.label} className="block break-words">{entry.label}: {entry.isClosed ? closedLabel : entry.hours}</span>)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA — consultation card */}
      <section className="contact-flow-section relative z-10 pb-14 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.9rem] border border-primary/20 bg-deep">
            <div className="pointer-events-none absolute inset-y-0 start-0 hidden w-1/2 sm:block">
              <div className="absolute start-[6%] top-1/2 h-[220%] w-px -translate-y-1/2 rotate-[18deg] bg-gradient-to-b from-transparent via-primary/70 to-transparent blur-[1px]" />
              <div className="absolute inset-[18%] rounded-full bg-primary/15 blur-3xl" />
              <RadiationEmblem variant="atom" />
            </div>

            <div className="relative flex flex-col items-center gap-5 px-6 py-10 text-center sm:ps-[52%] sm:pe-10 sm:py-12 sm:items-start sm:text-start">
              <h3 className="text-xl font-bold text-text-on-dark sm:text-2xl">
                {dict.contact.consultTitle}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-text-on-dark/90 sm:text-base">
                {dict.contact.consultText}
              </p>
              <a
                href={siteConfig.phoneHref}
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary-fill px-7 py-3 text-sm font-semibold text-on-primary shadow-[0_0_28px_-4px_rgba(26,115,82,0.6)] transition-all hover:bg-primary-fill-hover hover:shadow-[0_0_36px_-4px_rgba(26,115,82,0.75)]"
              >
                <PhoneCallIcon className="h-4 w-4" />
                <span>{dict.contact.consultCta}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Prefer forum — accent card */}
      <section className="contact-flow-section relative z-10 pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="contact-panel contact-forum-panel relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 end-0 top-0 w-1 bg-gradient-to-t from-primary via-primary/70 to-transparent" />

            <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {dict.contact.preferForumTitle}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                  {dict.contact.preferForumText}
                </p>
              </div>
              <Link
                href={`/${locale}/forum`}
                className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full bg-primary-fill px-6 py-2.5 text-sm font-semibold text-on-primary shadow-[0_0_26px_-5px_rgba(26,115,82,0.55)] transition-all hover:bg-primary-fill-hover hover:shadow-[0_0_34px_-4px_rgba(26,115,82,0.7)]"
              >
                <span className="relative z-10">{dict.contact.visitForum}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


