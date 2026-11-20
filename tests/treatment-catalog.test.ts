import { describe, expect, it, vi } from "vitest";
import { getDictionary } from "@/lib/i18n";
import { locales } from "@/lib/i18n/config";
import { treatmentProcedureSchemas } from "@/lib/seo/json-ld";
import { searchAll } from "@/lib/services/search-service";
import { getTreatmentSearchText, type TreatmentCatalog } from "@/lib/services/treatment-catalog";

vi.mock("@/lib/db/db", () => ({ default: { prepare: () => ({ all: () => [] }) } }));

describe.each(locales)("treatment catalog (%s)", (locale) => {
  const catalog: TreatmentCatalog = getDictionary(locale).services.catalog;

  it("keeps the same two-by-two hierarchy across languages", () => {
    expect(catalog.groups.map(({ id, branches }) => [id, branches.map((branch) => branch.id)])).toEqual([
      ["external-beam", ["definitive-perioperative", "palliative"]],
      ["stereotactic", ["brain", "body"]],
    ]);
    expect(catalog.groups[1].branches[0].codes).toEqual(["SRS", "FSRT"]);
    expect(catalog.groups[1].branches[1].codes).toEqual(["SBRT"]);
    expect(catalog.groups[1].branches[1].sites).toEqual(
      locale === "fa" ? ["کبد", "ریه", "ستون فقرات", "پانکراس", "پروستات"] : ["Liver", "Lung", "Spine", "Pancreas", "Prostate"],
    );
  });

  it("includes visible branch names, codes, and example sites in the search text", () => {
    const text = getTreatmentSearchText(catalog);

    for (const group of catalog.groups) {
      expect(text).toContain(group.title);
      for (const branch of group.branches) {
        for (const term of [branch.title, ...(branch.codes ?? []), ...(branch.sites ?? [])]) {
          expect(text).toContain(term);
        }
      }
    }
    expect(text).not.toMatch(/brachytherapy|براکی‌تراپی/i);
  });

  it("links search results directly to the localized atlas", () => {
    const site = locale === "fa" ? "پانکراس" : "Pancreas";
    const { results } = searchAll(site, { locale });

    expect(results).toContainEqual(expect.objectContaining({
      id: "page-services",
      url: `/${locale}/services/#treatment-atlas`,
      context: expect.stringMatching(new RegExp(site, "i")),
    }));
  });

  it("generates two localized procedure entries from the visible catalog", () => {
    const schemas = treatmentProcedureSchemas(catalog, locale);

    expect(schemas).toHaveLength(2);
    for (const [index, group] of catalog.groups.entries()) {
      const schema = schemas[index];
      expect(schema).toMatchObject({ "@type": "MedicalProcedure", name: group.title, alternateName: group.codes });
      for (const branch of group.branches) {
        expect(schema.description).toContain(branch.title);
        for (const site of branch.sites ?? []) expect(schema.description).toContain(site);
      }
    }
  });
});