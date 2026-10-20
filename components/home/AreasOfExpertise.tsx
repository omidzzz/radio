import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";
import SpotLightCard from "@/components/ui/SpotLightCard";
import SectionHeader from "@/components/ui/SectionHeader";

interface AreasOfExpertiseProps {
  dict: Dictionary;
  isFa: boolean;
}

/** Minimal line-art icon per tumor-site area — single-color, currentColor. */
const siteSvgs: Record<string, React.ReactNode> = {
  CNS: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Brain profile */}
      <path d="M40 16c-8 0-14 5-15 12-6 1-10 6-10 12 0 5 3 9 7 11v6c0 3 3 6 7 6h3V16z" strokeLinejoin="round" />
      <path d="M40 16c8 0 14 5 15 12 6 1 10 6 10 12 0 5-3 9-7 11v6c0 3-3 6-7 6h-3V16z" strokeLinejoin="round" />
      <path d="M40 22v36" strokeOpacity="0.5" />
      <path d="M33 30c4 0 6 2 6 5M47 38c-4 0-6 2-6 5" strokeOpacity="0.5" strokeLinecap="round" />
      <circle cx="40" cy="40" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  HN: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Head & neck profile */}
      <path d="M30 62c-1-8-6-10-6-20 0-14 9-24 22-24 8 0 14 4 16 11l3 10c1 3-1 5-4 5h-4l-1 6c0 3-2 5-5 5l-8 1v6c0 3-2 5-5 5H30z" strokeLinejoin="round" />
      <circle cx="46" cy="34" r="2.5" fill="currentColor" stroke="none" />
      <path d="M24 46h12" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M56 58l8 8M64 58l-8 8" strokeOpacity="0.4" strokeLinecap="round" />
    </svg>
  ),
  GYN: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Venus symbol */}
      <circle cx="40" cy="30" r="14" />
      <path d="M40 44v18M32 56h16" strokeLinecap="round" />
      <path d="M34 28c2-4 10-4 12 0" strokeOpacity="0.5" strokeLinecap="round" />
      <circle cx="40" cy="30" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  GI: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Digestive tract */}
      <path d="M28 20c0 6 4 9 12 9s12-3 12-9" strokeLinecap="round" />
      <path d="M52 22c6 4 8 10 6 17-2 8-10 11-17 9-6-2-8-8-6-13 2-4 7-6 11-4" strokeLinecap="round" />
      <path d="M34 46c-5 2-8 7-7 13 1 5 6 8 12 8 8 0 14-5 14-12 0-4-3-7-7-7" strokeLinecap="round" />
      <path d="M44 54c3 1 5 4 4 8" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  ),
  Breast: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Awareness ribbon */}
      <path d="M40 64c-4-8-14-22-18-30-3-6-1-12 4-14 5-2 10 1 12 6l4 9" strokeLinecap="round" />
      <path d="M40 64c4-8 14-22 18-30 3-6 1-12-4-14-5-2-10 1-12 6l-4 9" strokeLinecap="round" />
      <path d="M40 35l-5-11M40 35l5-11" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  ),
  Prostate: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Shield with target */}
      <path d="M40 14l18 6v16c0 12-8 22-18 26-10-4-18-14-18-26V20l18-6z" strokeLinejoin="round" />
      <circle cx="40" cy="36" r="8" strokeOpacity="0.6" />
      <circle cx="40" cy="36" r="2.5" fill="currentColor" stroke="none" />
      <path d="M40 24v4M40 44v4M28 36h4M48 36h4" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  ),
  GU: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Kidneys + bladder */}
      <path d="M30 24c-7 0-12 6-12 14s5 14 12 14c5 0 8-3 8-8 0-6-4-9-8-9" strokeLinejoin="round" />
      <path d="M50 24c7 0 12 6 12 14s-5 14-12 14c-5 0-8-3-8-8 0-6 4-9 8-9" strokeLinejoin="round" />
      <path d="M34 44c2 6 4 10 6 12M46 44c-2 6-4 10-6 12" strokeOpacity="0.6" strokeLinecap="round" />
      <path d="M32 62h16c0 4-4 6-8 6s-8-2-8-6z" strokeLinejoin="round" />
    </svg>
  ),
};

/**
 * Areas of Expertise — the seven tumor-site focus areas of
 * Dr. Pari Ghadamgahi's radiotherapy practice (CNS, Head & Neck,
 * GYN, GI, Breast, Prostate, GU).
 */
export default function AreasOfExpertise({ dict, isFa }: AreasOfExpertiseProps) {
  const { expertise } = dict.home;

  return (
    <section className="content-visibility relative bg-bg section-pad">
      {/* Decorative arcs — echo of the visit-card's curved gold rule */}
      <div className="pointer-events-none absolute -right-20 top-10 hidden h-72 w-72 rounded-full border border-highlight/25 lg:block" />
      <div className="pointer-events-none absolute -left-16 bottom-16 hidden h-52 w-52 rounded-full border border-primary/20 lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl">
          <SectionHeader
            eyebrow={expertise.badge}
            title={expertise.title}
            subtitle={expertise.subtitle}
            goldRule
          />
        </Reveal>

        <div className="relative mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {expertise.items.map((site, i) => (
            <Reveal
              key={site.code}
              delay={i * 90}
              className={i === 0 ? "sm:col-span-2" : undefined}
            >
              <SpotLightCard className="h-full rounded-3xl">
                <div className="surface-card no-lift-touch group relative h-full overflow-hidden p-7">
                  <div className="dose-gradient absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 opacity-80 transition-transform duration-500 group-hover:scale-x-100" />

                  <div className="relative flex items-center justify-between gap-3">
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {site.code}
                    </span>
                    <span className="text-muted" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>

                  <div className="relative mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-primary shadow-inner transition-colors duration-200 group-hover:bg-primary-fill group-hover:text-on-primary">
                    {siteSvgs[site.code] ?? siteSvgs.CNS}
                  </div>

                  <h3 className="relative mt-5 text-lg font-semibold leading-snug text-text-primary transition-colors duration-200 group-hover:text-primary">
                    {site.title}
                  </h3>
                  <p className="relative mt-2.5 text-base leading-relaxed text-text-secondary">
                    {site.desc}
                  </p>

                  <div className="relative mt-5 h-px w-10 bg-border transition-all duration-200 group-hover:w-20 group-hover:bg-highlight" />
                </div>
              </SpotLightCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-10 text-center">
          <p className="text-base leading-relaxed text-muted">
            {isFa
              ? "در هر هفت حوزه، برنامه درمان بر اساس شرایط شما شخصی‌سازی می‌شود — تمرکز اصلی درمان‌ها بر این هفت حوزه توموری است؛ سایر نواحی نیز در جلسه مشاوره بررسی می‌شوند."
              : "In each area, the plan is personalized to your condition and your life — treatment focuses on these seven tumor-site areas; other sites are discussed during your consultation."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
