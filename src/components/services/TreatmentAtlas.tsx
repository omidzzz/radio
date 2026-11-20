"use client";

import { useBookingModal } from "@/components/forms/BookingModalProvider";
import { localeDirs, type Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import type { TreatmentCatalog } from "@/lib/services/treatment-catalog";
import "./treatment-atlas.css";

interface TreatmentAtlasProps {
  catalog: TreatmentCatalog;
  locale: Locale;
  ctaLabel: string;
}

const groupAnchor = (id: string) => `treatment-${id}`;

function Codes({ values }: { values: readonly string[] }) {
  return (
    <bdi dir="ltr" lang="en" className="treatment-atlas__codes font-outfit">
      {values.join(" / ")}
    </bdi>
  );
}

export default function TreatmentAtlas({ catalog, locale, ctaLabel }: TreatmentAtlasProps) {
  const { openBookingModal } = useBookingModal();
  const formatNumber = locale === "fa" ? toFarsiDigits : String;
  const groupNumber = (index: number) => formatNumber(String(index + 1).padStart(2, "0"));

  return (
    <section id="treatment-atlas" aria-labelledby="treatment-atlas-title" lang={locale} dir={localeDirs[locale]} className="treatment-atlas section-pad relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="treatment-atlas__header">
        <div>
          <p className="treatment-atlas__eyebrow">{catalog.eyebrow}</p>
          <h2 id="treatment-atlas-title" className="treatment-atlas__title">{catalog.title}</h2>
          <p className="treatment-atlas__lede">{catalog.introduction}</p>
        </div>
        <nav aria-labelledby="treatment-atlas-title" className="treatment-atlas__index">
          {catalog.groups.map((group, index) => (
            <a key={group.id} href={`#${groupAnchor(group.id)}`} className="treatment-atlas__index-link">
              <bdi dir="ltr" aria-hidden="true" className="treatment-atlas__folio">{groupNumber(index)}</bdi>
              <span>{group.title}</span>
            </a>
          ))}
        </nav>
      </header>

      <div className="treatment-atlas__canvas">
        <ol className="treatment-atlas__groups" role="list">
          {catalog.groups.map((group, groupIndex) => (
            <li key={group.id} className="treatment-atlas__group">
              <span className="treatment-atlas__junction" aria-hidden="true">
                <bdi dir="ltr">{groupNumber(groupIndex)}</bdi>
              </span>
              <div className="treatment-atlas__group-intro">
                <Codes values={group.codes} />
                <h3 id={groupAnchor(group.id)} tabIndex={-1} className="treatment-atlas__group-title">{group.title}</h3>
                <p className="treatment-atlas__description">{group.description}</p>
              </div>

              <ol className="treatment-atlas__branches" role="list">
                {group.branches.map((branch, branchIndex) => (
                  <li key={branch.id} className="treatment-atlas__branch">
                    <span className="treatment-atlas__stem" aria-hidden="true" />
                    <div className="treatment-atlas__branch-label">
                      <bdi dir="ltr" aria-hidden="true">{formatNumber(`${groupIndex + 1}.${branchIndex + 1}`)}</bdi>
                      {branch.codes && <Codes values={branch.codes} />}
                    </div>
                    <h4 className="treatment-atlas__branch-title">{branch.title}</h4>
                    <p className="treatment-atlas__description">{branch.description}</p>
                    {branch.sites && (
                      <ul className="treatment-atlas__sites" role="list">
                        {branch.sites.map((site) => <li key={site}>{site}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>

        <div className="treatment-atlas__footer">
          <p>{catalog.consultationNote}</p>
          <button
            type="button"
            onClick={openBookingModal}
            className="treatment-atlas__cta"
          >
            {ctaLabel}
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 10h12.75m-5-5 5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}