import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import TreatmentJourney from "@/components/services/TreatmentJourney";
import { getDictionary } from "@/lib/i18n";
import { locales } from "@/lib/i18n/config";

it.each(locales)("renders one unpadded local numeral per journey point (%s)", (locale) => {
  const { journey } = getDictionary(locale).services;
  const html = renderToStaticMarkup(createElement(TreatmentJourney, { journey, locale }));
  const digits = locale === "fa" ? [..."۱۲۳۴"] : [..."1234"];
  const rows = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, row]) => row);

  expect(rows).toHaveLength(digits.length);
  rows.forEach((row, index) => {
    expect([...row.matchAll(/<bdi\b[^>]*>([^<]*)<\/bdi>/g)].map(([, digit]) => digit)).toEqual([digits[index]]);
    expect(row).toContain("<h3");
    expect(row).toContain("<p");
  });
  expect(html).not.toMatch(/مرحله|\bstep\b|01\s*\/\s*04/i);
});