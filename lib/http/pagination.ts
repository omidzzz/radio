/**
 * Windowed pagination helper.
 *
 * Returns a compact list of page items for rendering pagination controls,
 * keeping the current page (and its neighbours) visible while collapsing
 * distant ranges into ellipsis markers. Prevents rendering hundreds of
 * page links on large result sets.
 *
 * Example (page 5 of 20, delta 1):
 *   [1, "…", 4, 5, 6, "…", 20]
 */
export type PageItem = number | "ellipsis-start" | "ellipsis-end";

export function getPageItems(
  page: number,
  totalPages: number,
  delta = 1
): PageItem[] {
  const items: PageItem[] = [];
  const range: number[] = [];

  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    range.push(i);
  }

  if (page - delta > 2) items.push(1, "ellipsis-start");
  else items.push(1);

  items.push(...range);

  if (page + delta < totalPages - 1) items.push("ellipsis-end", totalPages);
  else if (totalPages > 1) items.push(totalPages);

  return items;
}