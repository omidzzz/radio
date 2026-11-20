import type { Dictionary } from "@/lib/i18n";
import { localeDirs, type Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface TreatmentJourneyProps {
  journey: Dictionary["services"]["journey"];
  locale: Locale;
}

export default function TreatmentJourney({ journey, locale }: TreatmentJourneyProps) {
  return (
    <section
      id="treatment-journey"
      aria-labelledby="treatment-journey-title"
      lang={locale}
      dir={localeDirs[locale]}
      className="relative z-10 mx-auto grid max-w-7xl gap-7 px-4 pb-16 text-start sm:px-6 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-14 lg:px-8 lg:pb-24"
    >
      <header className="max-w-md">
        <span aria-hidden="true" className="mb-4 block h-0.5 w-10 bg-gold" />
        <h2 id="treatment-journey-title" className="type-section font-extrabold text-text-primary">
          {journey.title}
        </h2>
        <p className="type-lede mt-3 text-text-secondary">{journey.introduction}</p>
      </header>

      <ol role="list" className="list-none divide-y divide-border border-y border-border border-t-accent">
        {journey.points.map(({ title, description }, index) => (
          <li
            key={title}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1.5 py-5 sm:gap-x-5 xl:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.6fr)] xl:py-6"
          >
            <bdi dir="ltr" className="row-span-2 self-start text-3xl leading-none font-medium text-accent tabular-nums sm:text-4xl xl:row-span-1 xl:self-baseline">
              {locale === "fa" ? toFarsiDigits(index + 1) : index + 1}
            </bdi>
            <h3 className="text-lg leading-snug font-bold text-text-primary sm:text-xl">{title}</h3>
            <p className="col-start-2 max-w-prose text-base leading-relaxed text-text-secondary xl:col-start-3">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}