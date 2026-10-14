import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import { breadcrumbSchema, contactPageSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import { RadiationIcon } from "@/components/ui/icons";
import PageHero from "@/components/PageHero";
import ChapterHead from "@/components/ui/ChapterHead";
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
  title: "ØªÙ…Ø§Ø³ Ø¨Ø§ Ù…Ø§",
  description:
    "ØªÙ…Ø§Ø³ Ø¨Ø§ Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ: Ø¢Ø¯Ø±Ø³ØŒ ØªÙ„ÙÙ†ØŒ Ø§ÛŒÙ…ÛŒÙ„ Ùˆ Ø³Ø§Ø¹Ø§Øª Ú©Ø§Ø±ÛŒ. Ø¨Ø±Ø§ÛŒ Ø±Ø²Ø±Ùˆ Ù†ÙˆØ¨Øª ÛŒØ§ Ø³ÙˆØ§Ù„Ø§Øª Ø¯Ø±Ù…Ø§Ù†ÛŒ Ø¨Ø§ Ù…Ø§ Ø¯Ø± Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§Ø´ÛŒØ¯.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "ØªÙ…Ø§Ø³ Ø¨Ø§ Ù…Ø§ | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ",
    description:
      "ØªÙ…Ø§Ø³ Ø¨Ø§ Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ: Ø¢Ø¯Ø±Ø³ØŒ ØªÙ„ÙÙ†ØŒ Ø§ÛŒÙ…ÛŒÙ„ Ùˆ Ø³Ø§Ø¹Ø§Øª Ú©Ø§Ø±ÛŒ. Ø¨Ø±Ø§ÛŒ Ø±Ø²Ø±Ùˆ Ù†ÙˆØ¨Øª ÛŒØ§ Ø³ÙˆØ§Ù„Ø§Øª Ø¯Ø±Ù…Ø§Ù†ÛŒ Ø¨Ø§ Ù…Ø§ Ø¯Ø± Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§Ø´ÛŒØ¯.",
    type: "website",
    url: `${siteConfig.url}/contact`,
    images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ØªÙ…Ø§Ø³ Ø¨Ø§ Ù…Ø§ | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ",
    description:
      "ØªÙ…Ø§Ø³ Ø¨Ø§ Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ: Ø¢Ø¯Ø±Ø³ØŒ ØªÙ„ÙÙ†ØŒ Ø§ÛŒÙ…ÛŒÙ„ Ùˆ Ø³Ø§Ø¹Ø§Øª Ú©Ø§Ø±ÛŒ. Ø¨Ø±Ø§ÛŒ Ø±Ø²Ø±Ùˆ Ù†ÙˆØ¨Øª ÛŒØ§ Ø³ÙˆØ§Ù„Ø§Øª Ø¯Ø±Ù…Ø§Ù†ÛŒ Ø¨Ø§ Ù…Ø§ Ø¯Ø± Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§Ø´ÛŒØ¯.",
  },
};

export const revalidate = 3600;

/** Hero feature bullets â€” icons reference shared components, labels come from i18n */
const HERO_FEATURE_ICONS = [
  <MapPinIcon key="pin" className="h-5 w-5" />,
  <CareIcon key="care" className="h-5 w-5" />,
  <ClockIcon key="clock" className="h-5 w-5" />,
] as const;

export default async function ContactPage() {
  const { dict, locale } = await getServerDictionary();
  const workingHours = getWorkingHoursSummary(locale);
  const closedLabel = locale === "fa" ? "ØªØ¹Ø·ÛŒÙ„" : "Closed";
  const { isOpen } = getOpenNowStatus();
  const openLabel = isOpen ? dict.contact.openNow : dict.contact.closedNow;
  const breadcrumbs = breadcrumbSchema([
    { name: locale === "fa" ? "Ø®Ø§Ù†Ù‡" : "Home", path: "/" },
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


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” clean medical-tech hero
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <PageHero
        badge={dict.contact.title}
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <RadiationIcon className="h-full w-full text-primary" />
          </div>
        }
      >
        {/* Feature bullets â€” staggered entrance */}
        <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
          {heroFeatures.map((f, i) => (
            <div
              key={f.label}
              className={`anim-fade-up delay-${(i + 1) * 200} flex flex-col items-start gap-2.5`}
            >
              <div className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5 text-primary">
                {HERO_FEATURE_ICONS[i]}
              </div>
              <p className="mono text-[0.65rem] uppercase tracking-[0.18em] leading-tight text-slate-300">
                {f.label}
              </p>
              <p className="text-xs leading-tight text-slate-400">{f.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={siteConfig.phoneHref}
            className="btn btn-outline !border-white/25 !text-white hover:!border-primary/60"
          >
            <PhoneIcon className="h-4 w-4 text-primary" />
            {dict.contact.quickCall}
          </a>

          <a
            href="#form"
            className="btn btn-primary"
          >
            <span>{dict.contact.sendMessage}</span>
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </a>
        </div>
      </PageHero>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MAIN CONTENT â€” form + map side by side, theme-aware cards
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="form" className="relative z-10 pb-8 pt-4 lg:pb-14">
        <div
          className="grain-pattern pointer-events-none absolute inset-0"
          style={{
            maskImage:
              "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ChapterHead
            index="01"
            label={dict.contact.title}
            title={dict.contact.contactInformation}
            lede={dict.contact.formSubtitle}
            align="start"
            className="mb-10"
          />
          <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
            {/* â”€â”€ FORM â”€â”€ */}
            <div className="relative lg:col-span-7">
              <div className="surface-card relative flex h-full flex-col overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-border px-6 py-5 sm:px-8">
                  <ChatIcon className="h-4 w-4 text-primary" />
                  <h2 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                    {dict.contact.formTitle}
                  </h2>
                </div>

                <div className="p-6 sm:p-8">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* MAP (click-to-load) */}
            <div className="relative lg:col-span-5">
              <div className="surface-card relative flex h-full flex-col overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    <h2 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                      {dict.contact.mapCardTitle}
                    </h2>
                  </div>
                </div>

                <MapEmbed
                  embedUrl={siteConfig.mapsEmbedUrl}
                  directionsUrl={siteConfig.mapsDirectionsUrl}
                  loadLabel={dict.contact.loadMap}
                  openLabel={dict.contact.openInMaps}
                  title="Google Maps - Radiotherapy Clinic"
                />

                <div className="border-t border-border px-6 py-4 text-sm leading-relaxed text-text-secondary">
                  {dict.footer.addressLine1}ØŒ {dict.footer.addressLine2}
                </div>
              </div>
            </div>
          </div>

          {/* INFO STRIP — ruled ledger rows */}
          <div className="surface-card mt-6 divide-y divide-border lg:mt-8">
            <div className="flex items-center gap-3.5 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-bg text-primary">
                <MailIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">{dict.contact.email}</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="block truncate text-sm font-medium text-text-primary transition-colors hover:text-primary"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-bg text-primary">
                <PhoneIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">{dict.contact.phone}</p>
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

            <div className="flex items-start gap-3.5 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-bg text-primary">
                <ClockIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">{dict.contact.officeHours}</p>
                  {/* Live open/closed status — squared chip */}
                  <span
                    className={`inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[10px] font-semibold ${
                      isOpen
                        ? "border-positive/30 bg-positive-soft text-positive"
                        : "border-danger/30 bg-danger-soft text-danger"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 ${isOpen ? "bg-positive" : "bg-danger"}`}
                    />
                    {openLabel}
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium text-text-primary">
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CONSULTATION CTA â€” glowing beam banner (dark section)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 pb-14 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="band-dark relative overflow-hidden">
            {/* Trefoil watermark — mirrored automatically in RTL */}
            <div className="pointer-events-none absolute inset-y-0 start-0 hidden w-1/2 items-center justify-center sm:flex">
              <RadiationIcon className="h-48 w-48 text-highlight/20" />
            </div>

            {/* Content offset past the watermark half via logical padding */}
            <div className="relative flex flex-col items-center gap-5 px-6 py-12 text-center sm:ps-[52%] sm:pe-10 sm:items-start sm:text-start">
              <h3 className="text-xl font-bold text-text-on-dark sm:text-2xl">
                {dict.contact.consultTitle}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                {dict.contact.consultText}
              </p>
              <a
                href={siteConfig.phoneHref}
                className="btn btn-primary"
              >
                <PhoneCallIcon className="h-4 w-4" />
                <span>{dict.contact.consultCta}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PREFER FORUM â€” theme-aware accent card
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="surface-card relative overflow-hidden p-6 sm:p-8">
            <div className="absolute bottom-0 end-0 top-0 w-1 bg-primary" />

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
                className="btn btn-outline shrink-0"
              >
                <span>{dict.contact.visitForum}</span>
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
