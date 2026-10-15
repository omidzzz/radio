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
import ChapterHead from "@/components/ui/ChapterHead";
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
      <section className="relative z-10 section-pad-tight">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ChapterHead
            index="01"
            label={dict.booking.title}
            title={dict.booking.subtitle}
            align="start"
            className="mb-10"
          />
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Form */}
            <div className="relative lg:col-span-7">
              <div className="surface-card overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-border px-6 py-5 sm:px-8">
                  <h2 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                    {dict.booking.title}
                  </h2>
                </div>
                <div className="p-6 sm:p-8 lg:p-10">
                  <BookingForm />
                </div>
              </div>
            </div>

            {/* Sidebar — sticky so contact info stays visible while scrolling the form */}
            <div className="flex flex-col gap-6 self-start lg:sticky lg:top-24 lg:col-span-5">
              {/* What to expect */}
              <div className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-border bg-bg text-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
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
                  <h3 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                    {dict.booking.whatToExpect}
                  </h3>
                </div>

                <ol className="mt-6 divide-y divide-border">
                  {steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3.5 py-3 first:pt-0 last:pb-0">
                      <span className="mono tnum flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-bg text-[0.65rem] font-bold text-primary">
                        {locale === "fa" ? toFarsiDigits(index + 1) : index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-text-secondary pt-0.5">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Contact info */}
              <div className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-border bg-bg text-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
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
                  <h3 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
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
                          className={`tnum mt-1 flex items-center justify-between gap-3 border-l-2 px-2 py-1 ${
                            isToday ? "border-primary bg-bg font-medium text-primary" : "border-transparent"
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
              <div className="surface-card p-6">
                <div className="mb-4 h-1 w-10 bg-primary" />

                <div>
                  <h3 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                    {dict.booking.askFirstTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {dict.booking.askFirstText}
                  </p>
                  <Link
                    href="/forum"
                    className="btn btn-outline mt-5"
                  >
                    <span>
                      {dict.booking.visitForum}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
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
