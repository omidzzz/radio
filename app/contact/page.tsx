import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import { breadcrumbSchema, contactPageSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import PageHero from "@/components/PageHero";
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
  ArrowIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "تماس با دکتر پری غدامگاهی: آدرس، تلفن، ایمیل و ساعات کاری. برای رزرو نوبت یا سوالات درمانی با ما در ارتباط باشید.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "تماس با ما | دکتر پری غدامگاهی",
    description:
      "تماس با دکتر پری غدامگاهی: آدرس، تلفن، ایمیل و ساعات کاری. برای رزرو نوبت یا سوالات درمانی با ما در ارتباط باشید.",
    type: "website",
    url: `${siteConfig.url}/contact`,
    images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "تماس با ما | دکتر پری غدامگاهی",
    description:
      "تماس با دکتر پری غدامگاهی: آدرس، تلفن، ایمیل و ساعات کاری. برای رزرو نوبت یا سوالات درمانی با ما در ارتباط باشید.",
  },
};

export const revalidate = 3600;

/** Hero feature bullets — icons reference shared components, labels come from i18n */
const HERO_FEATURE_ICONS = [
  <MapPinIcon key="pin" className="h-5 w-5" />,
  <CareIcon key="care" className="h-5 w-5" />,
  <ClockIcon key="clock" className="h-5 w-5" />,
] as const;

export default async function ContactPage() {
  const { dict, locale } = await getServerDictionary();
  const workingHours = getWorkingHoursSummary(locale);
  const closedLabel = locale === "fa" ? "تعطیل" : "Closed";
  const { isOpen } = getOpenNowStatus();
  const openLabel = isOpen ? dict.contact.openNow : dict.contact.closedNow;
  const breadcrumbs = breadcrumbSchema([
    { name: locale === "fa" ? "خانه" : "Home", path: "/" },
    { name: dict.contact.title, path: "/contact" },
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

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL AMBIENT FIELD — theme-aware
      ══════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />
        <ParticleBackground id="particles-contact" className="text-muted" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO — clean medical-tech hero
      ══════════════════════════════════════════════════════════════ */}
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
        {/* Feature bullets — staggered entrance */}
        <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
          {heroFeatures.map((f, i) => (
            <div
              key={f.label}
              className={`anim-fade-up delay-${(i + 1) * 200} flex flex-col items-start gap-2.5`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                {HERO_FEATURE_ICONS[i]}
              </div>
              <p className="text-sm font-medium leading-tight text-slate-200">
                {f.label}
              </p>
              <p className="text-xs leading-tight text-slate-400">{f.sub}</p>
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
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-deep shadow-[0_0_28px_-4px_rgba(26,115,82,0.6)] transition-all hover:bg-primary-hover hover:shadow-[0_0_36px_-4px_rgba(26,115,82,0.75)]"
          >
            <span className="relative z-10">{dict.contact.sendMessage}</span>
            <ArrowIcon className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </a>
        </div>
      </PageHero>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT — form + map side by side, theme-aware cards
      ══════════════════════════════════════════════════════════════ */}
      <section id="form" className="relative z-10 pb-8 pt-4 lg:pb-14">
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
            {/* ── FORM ── */}
            <div className="relative lg:col-span-7">
              <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_28px_60px_-22px_rgba(0,0,0,0.12)]">
                {/* Energy bar */}
                <div className="relative h-1.5 shrink-0 overflow-hidden bg-deep">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#c9a24b] to-secondary" />
                  <div className="absolute inset-y-0 left-0 w-2/5 animate-pulse bg-white/25" />
                </div>

                <div className="flex items-center gap-2.5 border-b border-border px-6 py-5 sm:px-8">
                  <ChatIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold text-text-primary sm:text-lg">
                    {dict.contact.formTitle}
                  </h2>
                </div>

                <div className="p-6 sm:p-8">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* ── MAP (click-to-load) ── */}
            <div className="relative lg:col-span-5">
              <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_28px_60px_-22px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-semibold text-text-primary sm:text-lg">
                      {dict.contact.mapCardTitle}
                    </h2>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
                </div>

                <MapEmbed
                  embedUrl={siteConfig.mapsEmbedUrl}
                  directionsUrl={siteConfig.mapsDirectionsUrl}
                  loadLabel={dict.contact.loadMap}
                  openLabel={dict.contact.openInMaps}
                  title="Google Maps - Dr. Pari Ghadamgahi"
                />

                <div className="border-t border-border px-6 py-4 text-sm leading-relaxed text-text-secondary">
                  {dict.footer.addressLine1}، {dict.footer.addressLine2}
                </div>
              </div>
            </div>
          </div>

          {/* ── INFO STRIP ── */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:mt-8">
            <div className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-soft text-primary transition-colors group-hover:bg-primary/10">
                <MailIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">{dict.contact.email}</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="block truncate text-sm font-medium text-text-primary transition-colors hover:text-primary"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>

            <div className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-soft text-primary transition-colors group-hover:bg-primary/10">
                <PhoneIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">{dict.contact.phone}</p>
                <a
                  href={siteConfig.phoneHref}
                  className="block text-sm font-medium text-text-primary transition-colors hover:text-primary"
                  dir="ltr"
                >
                  {locale === "fa"
                    ? toFarsiDigits(siteConfig.phone)
                    : siteConfig.phone}
                </a>
              </div>
            </div>

            <div className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-soft text-primary transition-colors group-hover:bg-primary/10">
                <ClockIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted">{dict.contact.officeHours}</p>
                  {/* Live open/closed status */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isOpen
                        ? "bg-positive-soft text-positive"
                        : "bg-danger-soft text-danger"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isOpen ? "bg-positive animate-pulse" : "bg-danger"
                      }`}
                    />
                    {openLabel}
                  </span>
                </div>
                <div className="text-sm font-medium text-text-primary">
                  {workingHours.map((entry) => (
                    <span key={entry.label} className="block truncate">
                      {entry.label}:{" "}
                      {entry.isClosed ? closedLabel : entry.hours}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONSULTATION CTA — glowing beam banner (dark section)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pb-14 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.9rem] border border-primary/20 bg-deep">
            {/* Beam accent — anchored to inline-start so it mirrors in RTL */}
            <div className="pointer-events-none absolute inset-y-0 start-0 hidden w-1/2 sm:block">
              <div className="absolute start-[6%] top-1/2 h-[220%] w-px -translate-y-1/2 rotate-[18deg] bg-gradient-to-b from-transparent via-primary/70 to-transparent blur-[1px]" />
              <div className="absolute inset-[18%] rounded-full bg-primary/15 blur-3xl" />
              <RadiationEmblem variant="atom" />
            </div>

            {/* Content offset past the beam half via logical padding */}
            <div className="relative flex flex-col items-center gap-5 px-6 py-10 text-center sm:ps-[52%] sm:pe-10 sm:py-12 sm:items-start sm:text-start">
              <h3 className="text-xl font-bold text-text-on-dark sm:text-2xl">
                {dict.contact.consultTitle}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                {dict.contact.consultText}
              </p>
              <a
                href={siteConfig.phoneHref}
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-7 py-3 text-sm font-semibold text-deep shadow-[0_0_28px_-4px_rgba(26,115,82,0.6)] transition-all hover:bg-primary-hover hover:shadow-[0_0_36px_-4px_rgba(26,115,82,0.75)]"
              >
                <PhoneCallIcon className="h-4 w-4" />
                <span>{dict.contact.consultCta}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PREFER FORUM — theme-aware accent card
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm sm:p-8">
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
                href="/forum"
                className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-deep shadow-[0_0_26px_-5px_rgba(26,115,82,0.55)] transition-all hover:bg-primary-hover hover:shadow-[0_0_34px_-4px_rgba(26,115,82,0.7)]"
              >
                <span className="relative z-10">{dict.contact.visitForum}</span>
                <ArrowIcon className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}