import type { Metadata } from "next";
import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo";
import { physicianSchema, breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import { RadiationIcon } from "@/components/ui/icons";
import PageHero from "@/components/PageHero";
import ChapterHead from "@/components/ui/ChapterHead";
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
      <section className="section-pad-tight">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ChapterHead
            index="01"
            label={dict.about.title}
            title={dict.about.statsTitle}
            align="start"
            className="mb-10"
          />
          <dl className="surface-card grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x lg:divide-y">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 110} className="p-6 sm:p-8">
                <dd className="mono tnum text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
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
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          MISSION + VALUES
      ══════════════════════════════════════════════════════════════ */}
      <section className="section-pad">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Mission text */}
            <Reveal variant="left">
              <div>
                <ChapterHead
                  index="02"
                  label={dict.about.missionBadge}
                  title={dict.about.missionTitle}
                  align="start"
                />
                <p className="mt-8 text-lg leading-relaxed text-text-secondary">
                  {dict.about.missionText1}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-text-secondary">
                  {dict.about.missionText2}
                </p>
              </div>
            </Reveal>

            {/* Values card */}
            <Reveal variant="right" delay={120}>
              <div className="surface-card p-8 sm:p-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-border bg-bg text-primary">
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5"
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
                  <h3 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                    {dict.about.valuesTitle}
                  </h3>
                </div>

                <ul className="mt-8 space-y-4">
                    {dict.about.values.map((value: string) => (
                      <li key={value} className="flex items-start gap-3.5">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-primary/30 bg-soft text-primary">
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
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TECHNOLOGY STRIP — treatment modalities
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-border/60 bg-surface/70 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="mono text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">
              {dict.about.techTitle}
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {dict.about.techItems.map((item: string) => (
                <li
                  key={item}
                  className="chip transition-colors duration-300 hover:border-primary/40 hover:text-primary"
                >
                  <span aria-hidden="true" className="h-1 w-1 bg-primary/60" />
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
      <section className="mod-team relative z-10 overflow-hidden bg-deep py-24 lg:py-28">
        {/* Trefoil watermark — dossier dark-band ornament */}
        <div className="pointer-events-none absolute -bottom-24 end-[-4rem] opacity-[0.04]">
          <svg viewBox="0 0 200 200" className="h-[420px] w-[420px]" fill="none" stroke="currentColor" strokeWidth="6">
            <circle cx="100" cy="100" r="24" />
            <path d="M100 76c0-28 8-52 24-52s24 18 16 40-24 28-40 28zM121 113c24 14 46 22 42 38s-28 18-44 2-14-36 2-52zM79 113c-24 14-46 22-42 38s28 18 44 2 14-36-2-52z" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <ChapterHead
              index="03"
              label={dict.about.teamBadge}
              title={dict.about.teamTitle}
              lede={dict.about.teamSubtitle}
              align="start"
              tone="dark"
            />
          </Reveal>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {teamMembers.map((member, i) => (
              <Reveal key={member.name} delay={i * 130}>
                <article className="mod-panel--deep h-full p-8">
                  {/* Avatar */}
                  <div className="relative flex h-16 w-16 items-center justify-center border border-white/15 bg-white/5 mono text-xl font-bold text-highlight">
                    {getInitials(member.name)}
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

                  {/* Bottom rule */}
                  <div
                    aria-hidden="true"
                    className="mt-7 h-px w-12 bg-white/15"
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
      <section className="mod-milestones section-pad">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ChapterHead
            index="04"
            label={dict.about.timelineTitle}
            title={dict.about.timelineTitle}
            lede={dict.about.timelineSubtitle}
          />

          <ol className="relative mt-14 space-y-8 before:absolute before:bottom-4 before:end-auto before:start-[23px] before:top-4 before:w-px before:bg-border sm:before:start-[27px]">
            {milestones.map((milestone, i) => (
              <li key={milestone.year} className="relative flex items-start gap-5">
                {/* Year node */}
                <div className="mono tnum relative z-10 flex h-12 w-12 shrink-0 items-center justify-center border border-primary/40 bg-bg text-[10px] font-bold text-primary sm:h-14 sm:w-14 sm:text-xs">
                  {milestone.year}
                </div>
                <Reveal delay={i * 110} className="min-w-0 flex-1">
                  <div className="surface-card p-6">
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
      <section className="section-pad">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          {/* Decorative icon */}
          <Reveal variant="scale">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-border bg-soft text-primary">
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
              className="btn btn-primary mt-10 px-9 py-4 text-base"
            >
              <span className="flex items-center gap-2">
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