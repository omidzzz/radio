import type { Metadata } from "next";
import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo";
import { physicianSchema, breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import { RadiationIcon } from "@/components/ui/icons";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";

const ABOUT_TITLE = "درباره ما | کلینیک پرتودرمانی";
const ABOUT_DESCRIPTION =
  "آشنایی با کلینیک پرتودرمانی، ماموریت، ارزش‌ها و تیم متخصص ما در زمینه درمان سرطان و تصویربرداری پزشکی.";

export const metadata: Metadata = {
  title: "درباره ما",
  description: ABOUT_DESCRIPTION,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    type: "website",
    url: `${siteConfig.url}/about`,
    images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  },
};

export const revalidate = 3600;

/** Safe initials for avatars — handles ZWNJ artifacts and empty names */
function getInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((p) => p.replace(/\u200c/g, ""))
    .filter((p) => p.length > 0);
  if (parts.length === 0) return "✚";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

/** Unified section eyebrow pill */
function SectionBadge({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium ${
        dark
          ? "border-primary/30 bg-primary/10 text-highlight"
          : "border-primary/25 bg-primary/10 text-primary"
      }`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
      {label}
    </div>
  );
}

export default async function AboutPage() {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  const teamMembers = [
    {
      name: dict.about.teamMember1Name,
      role: dict.about.teamMember1Role,
      bio: dict.about.teamMember1Bio,
    },
    {
      name: dict.about.teamMember2Name,
      role: dict.about.teamMember2Role,
      bio: dict.about.teamMember2Bio,
    },
    {
      name: dict.about.teamMember3Name,
      role: dict.about.teamMember3Role,
      bio: dict.about.teamMember3Bio,
    },
  ];

  const stats = [
    { value: dict.about.stat1Value, suffix: dict.about.stat1Suffix, label: dict.about.stat1Label },
    { value: dict.about.stat2Value, suffix: dict.about.stat2Suffix, label: dict.about.stat2Label },
    { value: dict.about.stat3Value, suffix: dict.about.stat3Suffix, label: dict.about.stat3Label },
    { value: dict.about.stat4Value, suffix: dict.about.stat4Suffix, label: dict.about.stat4Label },
  ];

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
  ];

  const physicianSchemas = teamMembers.map((member) =>
    physicianSchema(member.name, member.role, member.bio),
  );
  const breadcrumbs = breadcrumbSchema([
    { name: dict.about.breadcrumbHome, path: "/" },
    { name: dict.about.breadcrumbCurrent, path: "/about" },
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={[...physicianSchemas, breadcrumbs]} />

      {/* ══════════════════════════════════════════════════════════════
          HERO — clean medical-tech hero
      ══════════════════════════════════════════════════════════════ */}
      <PageHero
        badge={dict.about.title}
        title={dict.about.title}
        subtitle={dict.about.subtitle}
        emblem={
          <RadiationIcon className="h-40 w-40 text-primary/30 lg:h-52 lg:w-52" />
        }
      />

      {/* ══════════════════════════════════════════════════════════════
          STATS — animated credibility counters
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <SectionBadge label={dict.about.statsTitle} />
          </Reveal>
          <dl className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-7">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 110}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 text-center shadow-[0_18px_40px_-24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_22px_45px_-20px_rgba(6,182,212,0.25)]">
                  {/* Top accent line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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

      {/* ══════════════════════════════════════════════════════════════
          MISSION + VALUES
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden py-24 lg:py-28">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Mission text */}
            <Reveal variant="left">
              <div>
                <SectionBadge label={dict.about.missionBadge} />
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  {dict.about.missionTitle}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-text-secondary">
                  {dict.about.missionText1}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-text-secondary">
                  {dict.about.missionText2}
                </p>
              </div>
            </Reveal>

            {/* Values card */}
            <Reveal variant="right" delay={120}>
              <div className="relative">
                <div
                  className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/[0.08] via-transparent to-secondary/[0.06]"
                  style={{ clipPath: "polygon(0 0, 100% 3%, 97% 100%, 0 96%)" }}
                />
                <div className="relative overflow-hidden rounded-[1.85rem] border border-border/60 bg-surface/95 p-8 shadow-[0_28px_60px_-22px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-10">
                  {/* Dossier top rule — solid signal red, no sweep */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-primary ring-1 ring-primary/20">
                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        aria-hidden="true"
                        className="h-6 w-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path
                          d="M24 5 11 11v11c0 10 6.5 18.5 13 21 6.5-2.5 13-11 13-21V11L24 5Z"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24 9 14 13.5v9c0 8 5 14.5 10 16.5 5-2 10-8.5 10-16.5v-9L24 9Z"
                          strokeOpacity="0.2"
                          strokeDasharray="2 3"
                        />
                        <path
                          d="M18 24l4.5 4.5L31 19"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {dict.about.valuesTitle}
                    </h3>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {dict.about.values.map((value: string) => (
                      <li key={value} className="flex items-start gap-3.5">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-primary ring-1 ring-primary/15">
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <path
                              d="M5 10.5l3.5 3.5 6.5-7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="pt-0.5 leading-relaxed text-text-secondary">
                          {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TECHNOLOGY STRIP — treatment modalities
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-border/60 bg-surface/70 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">
              {dict.about.techTitle}
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {dict.about.techItems.map((item: string) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-300 hover:border-primary/40 hover:text-primary"
                >
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TEAM
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden bg-deep py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-secondary-hover/8 blur-3xl" />
        </div>

        {/* Beam lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute left-[20%] top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          <div className="absolute right-[25%] top-0 h-full w-px bg-gradient-to-b from-transparent via-secondary/25 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <SectionBadge label={dict.about.teamBadge} dark />
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {dict.about.teamTitle}
            </h2>
            <p className="mt-4 text-lg text-muted">{dict.about.teamSubtitle}</p>
          </Reveal>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {teamMembers.map((member, i) => (
              <Reveal key={member.name} delay={i * 130}>
                <article className="spotlight-card group relative h-full overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2.5 hover:border-primary/35 hover:bg-white/[0.08] hover:shadow-[0_25px_60px_-18px_rgba(6,182,212,0.28)]">
                  {/* Top accent line */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Soft corner glow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Avatar */}
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl font-bold text-deep shadow-[0_0_28px_-4px_rgba(6,182,212,0.55)] transition-shadow duration-500 group-hover:shadow-[0_0_36px_-2px_rgba(6,182,212,0.7)]">
                    {getInitials(member.name)}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-highlight">
                    {member.role}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {member.bio}
                  </p>

                  {/* Bottom decorative line */}
                  <div
                    aria-hidden="true"
                    className="mt-7 h-px w-12 bg-white/15 transition-all duration-500 group-hover:w-20 group-hover:bg-primary/50"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TIMELINE — clinic journey
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden py-24 lg:py-28">
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
                {/* Year node */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-surface text-[11px] font-bold text-primary ring-4 ring-bg sm:h-12 sm:w-12 sm:text-xs">
                  {milestone.year}
                </div>
                <Reveal delay={i * 110} className="min-w-0 flex-1">
                  <div className="rounded-2xl border border-border/60 bg-surface p-6 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_22px_45px_-22px_rgba(6,182,212,0.22)]">
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

      {/* ══════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden py-24 lg:py-28">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.2]" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          {/* Decorative icon */}
          <Reveal variant="scale">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/20 shadow-[0_0_30px_-8px_rgba(6,182,212,0.4)]">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                className="h-8 w-8"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="24" cy="24" r="16" />
                <path
                  d="M24 14v10l6 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
              href="/booking"
              className="group relative mt-10 inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-9 py-4 text-base font-semibold text-deep shadow-[0_0_35px_-8px_rgba(6,182,212,0.65)] transition-all duration-300 hover:bg-primary-hover hover:shadow-[0_0_50px_-4px_rgba(6,182,212,0.9)] active:scale-[0.97]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative flex items-center gap-2">
                {dict.about.bookConsultation}
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}