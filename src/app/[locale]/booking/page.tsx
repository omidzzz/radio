import type { Metadata } from "next";
import BookingForm from "@/components/forms/BookingForm";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import Link from "next/link";
import { siteConfig } from "@/lib/seo/seo";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import PageHero from "@/components/ui/PageHero";
import { getWorkingHoursSummary } from "@/lib/services/working-hours";

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

  return {
    title: dict.booking.metaTitle,
    description: dict.booking.metaDescription,
    alternates: {
      canonical: `/${locale}/booking`,
    },
    openGraph: {
      title: dict.booking.metaTitle,
      description: dict.booking.metaDescription,
      type: "website",
      url: `${siteConfig.url}/${locale}/booking`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.booking.metaTitle,
      description: dict.booking.metaDescription,
    },
  };
}

export const revalidate = 86400;

export default async function BookingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const workingHours = getWorkingHoursSummary(locale);
  const closedLabel = locale === "fa" ? "تعطیل" : "Closed";

  const todayName = new Intl.DateTimeFormat(locale === "fa" ? "fa" : "en-US", {
    weekday: "long",
  }).format(new Date());

  const breadcrumbs = breadcrumbSchema([
    { name: locale === "fa" ? "خانه" : "Home", path: `/${locale}` },
    { name: dict.booking.title, path: `/${locale}/booking` },
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

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />

        <ParticleBackground id="particles-booking" className="text-muted" />
      </div>

      <PageHero
        badge={dict.booking.title}
        title={dict.booking.title}
        subtitle={dict.booking.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <div className="absolute inset-[10%] rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <RadiationEmblem variant="atom" />
          </div>
        }
      />

      <section className="relative z-10 overflow-hidden py-20 lg:py-24">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.2]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="relative lg:col-span-7">
              <div
                className="absolute -inset-5 -z-10 rounded-[2.2rem] bg-gradient-to-br from-primary/[0.09] via-transparent to-secondary/[0.06]"
                style={{ clipPath: "polygon(0 0, 100% 2%, 98% 100%, 0 97%)" }}
              />
              <div className="page-surface overflow-hidden rounded-[1.85rem] backdrop-blur-sm">
                <div className="relative h-1.5 overflow-hidden bg-deep">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#c9a24b] to-secondary" />
                  <div className="absolute inset-y-0 left-0 w-2/5 animate-pulse bg-white/25" />
                </div>
                <div className="p-6 sm:p-8 lg:p-10">
                  <BookingForm />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 self-start lg:sticky lg:top-24 lg:col-span-5">
              <div className="page-surface relative overflow-hidden rounded-[1.6rem] p-6">
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

              <div className="page-surface relative overflow-hidden rounded-[1.6rem] p-6">
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
                    {dict.booking.hours}
                  </h3>
                </div>

                <ul className="mt-6 space-y-4">
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
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-[1.6rem] border border-primary/30 bg-gradient-to-br from-soft via-surface to-primary/[0.07] p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-t from-primary via-primary/70 to-transparent" />

                <div className="relative">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {dict.booking.askFirstTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {dict.booking.askFirstText}
                  </p>
                  <Link
                    href={`/${locale}/forum`}
                    className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary-fill px-6 py-2.5 text-sm font-semibold text-on-primary shadow-[0_0_26px_-5px_rgba(26,115,82,0.55)] transition-all hover:bg-primary-fill-hover hover:shadow-[0_0_34px_-4px_rgba(26,115,82,0.7)]"
                  >
                    <span className="relative z-10">
                      {dict.booking.visitForum}
                    </span>
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

