import { sanitizeContent } from "@/lib/security/sanitize";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Processes raw article HTML for safe rendering:
 * 1. Sanitizes the content (XSS defense-in-depth).
 * 2. Injects stable ids into h2/h3 headings and appends anchor links
 *    for shareable section links (also powers the table of contents).
 * 3. Adds lazy-loading hints to images that don't have them.
 *
 * Returns the processed HTML plus a table-of-contents extracted from
 * the headings.
 */
export function processArticleHtml(rawHtml: string): {
  html: string;
  toc: TocItem[];
} {
  const clean = sanitizeContent(rawHtml);
  const toc: TocItem[] = [];
  let index = 0;

  const withAnchors = clean.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (_match, levelStr: string, attrs = "", inner: string) => {
      const level = Number(levelStr) as 2 | 3;
      const id = `section-${++index}`;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (text) {
        toc.push({ id, text, level });
      }
      return `<h${level}${attrs} id="${id}">${inner}<a href="#${id}" class="heading-anchor" aria-label="Link to this section" aria-hidden="true" tabindex="-1">#</a></h${level}>`;
    },
  );

  // Add aspect-ratio to prevent CLS (Cumulative Layout Shift)
  // If no explicit width/height, use a default ratio to reserve space
  const withLazyImages = withAnchors.replace(
    /<img\b([^>]*)>/gi,
    (_match, attrs: string) => {
      let updated = attrs;
      if (!/loading=/i.test(updated)) updated += ' loading="lazy"';
      if (!/decoding=/i.test(updated)) updated += ' decoding="async"';
      // Add aspect-ratio to prevent CLS if no width/height specified
      if (!/width=/i.test(updated) && !/height=/i.test(updated)) {
        updated += ' style="aspect-ratio: 4/3; object-fit: cover;"';
      }
      return `<img${updated}>`;
    },
  );

  return { html: withLazyImages, toc };
}