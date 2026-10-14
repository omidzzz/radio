import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import { RadiationIcon } from "@/components/ui/icons";
import PageHero from "@/components/PageHero";
import { getWorkingHoursSummary } from "@/lib/services/working-hours";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getServerDictionary();

  return {
    title: dict.booking.metaTitle,
    description: dict.booking.metaDescription,
    alternates: {
      canonical: "/booking",
    },
    openGraph: {
      title: dict.booking.metaTitle,
      description: dict.booking.metaDescription,
      type: "website",
      url: `${siteConfig.url}/booking`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.booking.metaTitle,
      description: dict.booking.metaDescription,
    },
  };
}

export const revalidate = 3600;

export default async function BookingPage() {
  const { dict, locale } = await getServerDictionary();
  const workingHours = getWorkingHoursSummary(locale);
  const closedLabel = locale === "fa" ? "ØªØ¹Ø·ÛŒÙ„" : "Closed";

  // Name of today's weekday in the active locale â€” used to highlight
  // the matching row(s) in the working-hours list.
  const todayName = new Intl.DateTimeFormat(locale === "fa" ? "fa" : "en-US", {
    weekday: "long",
  }).format(new Date());

  const breadcrumbs = breadcrumbSchema([
    { name: locale === "fa" ? "Ø®Ø§Ù†Ù‡" : "Home", path: "/" },
    { name: dict.booking.title, path: "/booking" },
  ]);

  const steps = [
    dict.booking.step1,
    dict.booking.step2,
    dict.booking.step3,
    dict.booking.step4,
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          GLOBAL AMBIENT FIELD
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />

      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” clean medical-tech hero
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <PageHero
        badge={dict.booking.title}
        title={dict.booking.title}
        subtitle={dict.booking.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <RadiationIcon className="h-full w-full text-primary" />
          </div>
        }
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          BOOKING CONTENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 overflow-hidden py-20 lg:py-24">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Form */}
            <div className="relative lg:col-span-7">
              <div
                className="absolute -inset-5 -z-10 rounded-[2.2rem] bg-gradient-to-br from-primary/[0.09] via-transparent to-secondary/[0.06]"
                style={{ clipPath: "polygon(0 0, 100% 2%, 98% 100%, 0 97%)" }}
              />
              <div className="overflow-hidden rounded-[1.85rem] border border-border/60 bg-surface/95 shadow-[0_28px_60px_-22px_rgba(0,0,0,0.14)] backdrop-blur-sm">
                <div className="relative h-1.5 overflow-hidden bg-deep">
                  <div className="absolute inset-0 bg-primary" />
                  <div className="absolute inset-y-0 left-0 w-2/5 motion-reduce:animate-none bg-white/25" />
                </div>
                <div className="p-6 sm:p-8 lg:p-10">
                  <BookingForm />
                </div>
              </div>
            </div>

            {/* Sidebar â€” sticky so contact info stays visible while scrolling the form */}
            <div className="flex flex-col gap-6 self-start lg:sticky lg:top-24 lg:col-span-5">
              {/* What to expect */}
              <div className="relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        d="M12 7v5l3 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {dict.booking.whatToExpect}
                  </h3>
                </div>

                <ul className="mt-6 space-y-4">
                  {steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold text-primary ring-1 ring-primary/15">
                        {locale === "fa" ? toFarsiDigits(index + 1) : index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-text-secondary pt-0.5">
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact info */}
              <div className="relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.3 1.15a11 11 0 005.5 5.5l1.15-2.3a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {dict.contact.phone}
                  </h3>
                </div>

                <ul className="mt-6 space-y-4 text-sm text-text-secondary">
                  <li>
                    <span className="font-medium text-text-primary">
                      {dict.contact.phone}:
                    </span>{" "}
                    <a
                      href="tel:+1234567890"
                      dir="ltr"
                      className="inline-block transition-colors hover:text-primary"
                    >
                      +1 (234) 567-890
                    </a>
                  </li>
                  <li>
                    <span className="font-medium text-text-primary">
                      {dict.contact.email}:
                    </span>{" "}
                    <a
                      href="mailto:bookings@radiotherapyclinic.com"
                      dir="ltr"
                      className="inline-block transition-colors hover:text-primary"
                    >
                      bookings@radiotherapyclinic.com
                    </a>
                  </li>
                  <li>
                    <span className="font-medium text-text-primary">
                      {dict.booking.hours}:
                    </span>
                    <br />
                    {workingHours.map((entry) => {
                      const isToday = entry.label.includes(todayName);
                      return (
                        <span
                          key={entry.label}
                          className={`mt-1 flex items-center justify-between gap-3 rounded-lg px-2 py-0.5 ${
                            isToday ? "bg-soft font-medium text-primary ring-1 ring-primary/15" : ""
                          }`}
                        >
                          <span>{entry.label}</span>
                          <span>{entry.isClosed ? closedLabel : entry.hours}</span>
                        </span>
                      );
                    })}
                  </li>
                </ul>
              </div>

              {/* Ask first card */}
              <div className="relative overflow-hidden rounded-[1.6rem] border border-primary/30 bg-gradient-to-br from-soft via-surface to-primary/[0.07] p-6">
                <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-t from-primary via-primary/70 to-transparent" />

                <div className="relative">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {dict.booking.askFirstTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {dict.booking.askFirstText}
                  </p>
                  <Link
                    href="/forum"
                    className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-deep shadow-[0_0_26px_-5px_rgba(15,23,42,0.10)] transition-all hover:bg-primary-hover hover:shadow-[0_0_34px_-4px_rgba(15,23,42,0.10)]"
                  >
                    <span className="relative z-10">
                      {dict.booking.visitForum}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}