interface TreatmentBranch {
  id: string;
  title: string;
  description: string;
  codes?: readonly string[];
  sites?: readonly string[];
}

export interface TreatmentGroup {
  id: "external-beam" | "stereotactic";
  title: string;
  description: string;
  codes: readonly string[];
  branches: readonly [TreatmentBranch, TreatmentBranch];
}

export interface TreatmentCatalog {
  eyebrow: string;
  title: string;
  introduction: string;
  consultationNote: string;
  groups: readonly [TreatmentGroup, TreatmentGroup];
}

export function getTreatmentSearchText(catalog: TreatmentCatalog) {
  return [
    catalog.eyebrow,
    catalog.title,
    catalog.introduction,
    ...catalog.groups.flatMap((group) => [
      group.title,
      ...group.codes,
      group.description,
      ...group.branches.flatMap((branch) => [
        branch.title,
        ...(branch.codes ?? []),
        branch.description,
        ...(branch.sites ?? []),
      ]),
    ]),
  ].join(" ");
}