import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/seo/seo";
import { physicianSchema, breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import AmbientBackground from "@/components/layout/AmbientBackground";

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
    title: dict.about.title,
    description: dict.about.subtitle,
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        "fa-IR": `${siteConfig.url}/fa/about`,
        "en-US": `${siteConfig.url}/en/about`,
        "x-default": `${siteConfig.url}/fa/about`,
      },
    },
    openGraph: {
      title: dict.about.title,
      description: dict.about.subtitle,
      type: "website",
      url: `${siteConfig.url}/${locale}/about`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.about.title,
      description: dict.about.subtitle,
    },
  };
}

export const revalidate = 86400;

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

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  const milestones = [
    {
      year: dict.about.milestone1Year,
      title: dict.about.milestone1Title,
      desc: dict.about.milestone1Desc,
    },
    {
      year: dict.about.milestone2Year,
      title: dict.about.milestone2Title,
      desc: dict.about.milestone2Desc,
    },
    {
      year: dict.about.milestone3Year,
      title: dict.about.milestone3Title,
      desc: dict.about.milestone3Desc,
    },
    {
      year: dict.about.milestone4Year,
      title: dict.about.milestone4Title,
      desc: dict.about.milestone4Desc,
    },
    {
      year: dict.about.milestone5Year,
      title: dict.about.milestone5Title,
      desc: dict.about.milestone5Desc,
    },
  ];

  const physicianSchemas = [
    physicianSchema(dict.common.doctorName, dict.home.heroTitle2, dict.home.heroSubtitle),
  ];
  const breadcrumbs = breadcrumbSchema([
    { name: dict.about.breadcrumbHome, path: `/${locale}` },
    { name: dict.about.breadcrumbCurrent, path: `/${locale}/about` },
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={[...physicianSchemas, breadcrumbs]} />

      <AmbientBackground particleId="particles-about" className="text-muted" />

      <PageHero
        badge={dict.about.title}
        title={dict.about.title}
        subtitle={dict.about.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <div className="absolute inset-[10%] rounded-full bg-primary/20 blur-3xl" />
            <RadiationEmblem variant="atom" />
          </div>
        }
      />

      <section className="page-flow-section relative z-10 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <SectionBadge label={isFa ? "تحصیلات" : "Education"} />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {isFa ? "تحصیلات دانشگاهی" : "Academic Education"}
            </h2>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            {[
              {
                year: isFa ? "۱۳۹۰" : "1390",
                title: isFa ? "دکترای حرفه‌ای پزشکی" : "Doctor of Medicine",
                institution: isFa ? "دانشگاه علوم پزشکی تهران" : "Tehran University of Medical Sciences",
              },
              {
                year: isFa ? "۱۳۹۹" : "1399",
                title: isFa ? "تخصص رادیوتراپی و آنکولوژی" : "Specialty in Radiotherapy & Oncology",
                institution: isFa ? "دانشگاه علوم پزشکی اهواز" : "Ahvaz Jundishapur University of Medical Sciences",
              },
            ].map((item, index) => (
              <Reveal key={item.year} delay={index * 100}>
                <article className="page-surface h-full border-s-2 border-primary/50 px-6 py-5">
                  <p className="text-sm font-semibold text-primary">{item.year}</p>
                  <h3 className="mt-2 text-lg font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-1 text-text-secondary">{item.institution}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-flow-section relative z-10 bg-surface/50 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <SectionBadge label={isFa ? "مهارت‌های بالینی" : "Clinical Skills"} />
            <h2 className="mt-4 text-3xl font-bold text-text-primary sm:text-4xl">
              {isFa ? "تکنیک‌ها و حوزه‌های بالینی" : "Techniques & Clinical Focus"}
            </h2>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-x-10 gap-y-4 sm:grid-cols-2">
            {(isFa
              ? ["نوروانکولوژی و تومورهای سیستم عصبی مرکزی", "IMRT و VMAT", "SBRT، FSRT و SRS", "کانتورینگ و طراحی پلن درمان", "ارزیابی طرح درمان"]
              : ["Neuro-oncology and central nervous system tumours", "IMRT and VMAT", "SBRT, FSRT and SRS", "Contouring and treatment-plan design", "Treatment-plan evaluation"]
            ).map((skill) => (
              <p key={skill} className="border-b border-border/70 py-3 text-text-secondary">{skill}</p>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-4xl border-s-2 border-primary/50 ps-6">
            <p className="text-sm font-semibold text-primary">
              {isFa ? "پایان‌نامه تخصصی" : "Specialty Thesis"}
            </p>
            <p className="mt-2 leading-relaxed text-text-primary">
              {isFa
                ? "بررسی اثربخشی و سودمندی افزودن لوواستاتین به کمورادیوتراپی بیماران مبتلا به کارسینوم سلول سنگفرشی سر و گردن"
                : "Efficacy and benefit of adding lovastatin to chemoradiotherapy in patients with head and neck squamous cell carcinoma."}
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              {isFa
                ? "اساتید راهنما: دکتر ساسان زرمجو و دکتر حجت‌الله شهپریان"
                : "Supervisors: Dr. Sasan Zarmoju and Dr. Hojat-ollah Shahprian"}
            </p>
          </div>
        </div>
      </section>

      <section className="page-flow-section relative z-10 bg-surface/50 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <SectionBadge label={dict.about.publications.heading} />
            <h2 className="mt-4 text-3xl font-bold text-text-primary sm:text-4xl">
              {dict.about.publications.heading}
            </h2>
          </Reveal>
          <ol className="mt-10 space-y-5">
            {dict.about.publications.items.map((publication, index) => (
              <Reveal key={publication.doi} delay={index * 80}>
                <li className="border-b border-border/70 pb-5">
                  <p className="text-sm font-semibold text-primary">{publication.year}</p>
                  <h3 className="mt-1 text-base font-semibold leading-relaxed text-text-primary">
                    {publication.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    <em>{publication.journal}</em> · {publication.details}
                  </p>
                  <a
                    className="mt-1 inline-block text-sm text-primary underline-offset-4 hover:underline"
                    href={`https://doi.org/${publication.doi}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    DOI: {publication.doi}
                  </a>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-flow-section relative z-10 py-20 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-14 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionBadge label={isFa ? "عضویت‌ها و دوره‌ها" : "Memberships & Courses"} />
            <h2 className="mt-4 text-2xl font-bold text-text-primary">
              {dict.about.professionalMemberships.heading}
            </h2>
            <ul className="mt-5 space-y-3">
              {dict.about.professionalMemberships.items.map((membership) => (
                <li key={membership.name} className="border-b border-border/70 py-3 text-text-secondary">
                  {membership.name}{membership.abbreviation ? ` (${membership.abbreviation})` : ""}
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-lg font-semibold text-text-primary">
              {dict.about.specializedCourses.heading}
            </h3>
            <ul className="mt-3 space-y-2">
              {dict.about.specializedCourses.items.map((course) => (
                <li key={course} className="text-text-secondary">{course}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-text-secondary">
              {isFa ? "زبان انگلیسی: سطح C1" : "English language: C1 proficiency"}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <SectionBadge label={isFa ? "فعالیت‌های علمی" : "Scientific Activities"} />
            <h2 className="mt-4 text-2xl font-bold text-text-primary">
              {isFa ? "همایش‌ها و آموزش" : "Conferences & Teaching"}
            </h2>
            <ul className="mt-5 space-y-4">
              <li className="border-b border-border/70 pb-4">
                <p className="text-sm font-semibold text-primary">{isFa ? "۱۴۰۳" : "1403"}</p>
                <p className="mt-1 text-text-secondary">
                  {isFa ? "شرکت در پنل کانسر رکتوم در کنگره بین‌المللی کلینیکال آنکولوژی." : "Participated in the rectal cancer panel at the International Clinical Oncology Congress."}
                </p>
              </li>
              <li className="border-b border-border/70 pb-4">
                <p className="text-sm font-semibold text-primary">{isFa ? "پاییز ۱۴۰۴" : "Autumn 1404"}</p>
                <p className="mt-1 text-text-secondary">
                  {isFa ? "برگزاری پنل کانسر پستان تریپل نگاتیو در همایش یک‌روزه کانسر پستان، اهواز." : "Chaired the triple-negative breast cancer panel at a one-day breast cancer meeting in Ahvaz."}
                </p>
              </li>
              <li className="text-text-secondary">
                {isFa ? "برگزاری جلسات کانتورینگ و طراحی درمان در حوزه نوروانکولوژی در مرکز کانسر امید." : "Held neuro-oncology contouring and treatment-planning sessions at Omid Cancer Center."}
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="page-flow-section relative z-10 overflow-hidden py-24 lg:py-28">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.15]" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <SectionBadge label={dict.about.timelineTitle} />
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {dict.about.timelineTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
              {dict.about.timelineSubtitle}
            </p>
          </Reveal>

          <ol className="relative mt-14 space-y-8 before:absolute before:bottom-4 before:end-auto before:start-[19px] before:top-4 before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent sm:before:start-[23px]">
            {milestones.map((milestone, i) => (
              <li key={milestone.year} className="relative flex items-start gap-5">
                <div
                  className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-primary/50 via-border to-transparent"
                />
                <div
                  className={`milestone-year relative z-10 flex h-12 shrink-0 items-center justify-center rounded-full bg-primary-fill px-2 text-on-primary font-bold text-[11px] ring-4 ring-bg sm:text-xs ${
                    milestone.year.length > 4 ? "milestone-year-range" : "w-12"
                  }`}
                >
                  {milestone.year}
                </div>
                <Reveal delay={i * 110} className="min-w-0 flex-1">
                  <div className="rounded-2xl border border-border/60 bg-surface p-6 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_22px_45px_-22px_rgba(26,115,82,0.22)]">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {milestone.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-text-secondary">
                      {milestone.desc}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden py-24 lg:py-28">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.2]" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal variant="scale">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/20 shadow-[0_0_30px_-8px_rgba(26,115,82,0.4)]">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                className="h-8 w-8"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="24" cy="24" r="16" />
                <path d="M24 14v10l6 4" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M24 8v2M24 38v2M8 24h2M38 24h2"
                  strokeLinecap="round"
                  strokeOpacity="0.5"
                />
              </svg>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {dict.about.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-text-secondary">
              {dict.about.ctaSubtitle}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <Link
              href={`/${locale}/booking`}
              className="group relative mt-10 inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-fill px-9 py-4 text-base font-semibold text-on-primary shadow-[0_0_35px_-8px_rgba(26,115,82,0.65)] transition-all duration-300 hover:bg-primary-fill-hover hover:shadow-[0_0_50px_-4px_rgba(26,115,82,0.9)] active:scale-[0.97]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative flex items-center gap-2">
                {dict.about.bookConsultation}
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

