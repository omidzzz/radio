import db from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type SearchCategory = "blog" | "forum" | "page";

export interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  context: string;
  url: string;
  category?: string;
  date?: string;
  image?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  grouped: Record<SearchCategory, SearchResult[]>;
  total: number;
}

// ─────────────────────────────────────────────────────────────
// Static page content index (searchable pages)
// ─────────────────────────────────────────────────────────────

interface StaticPageEntry {
  id: string;
  type: "page";
  title: string;
  content: string;
  url: string;
  category: string;
}

function getStaticPages(locale: Locale): StaticPageEntry[] {
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  return [
    {
      id: "page-home",
      type: "page",
      title: isFa ? "خانه" : "Home",
      content: [
        dict.home.heroTitle1,
        dict.home.heroTitle2,
        dict.home.heroSubtitle,
        dict.home.feature1Title,
        dict.home.feature1Desc,
        dict.home.feature2Title,
        dict.home.feature2Desc,
        dict.home.feature3Title,
        dict.home.feature3Desc,
        dict.home.ctaTitle,
        dict.home.ctaSubtitle,
      ].join(" "),
      url: "/",
      category: isFa ? "صفحه اصلی" : "Home",
    },
    {
      id: "page-about",
      type: "page",
      title: isFa ? "درباره ما" : "About Us",
      content: [
        dict.about.subtitle,
        dict.about.missionTitle,
        dict.about.missionText1,
        dict.about.missionText2,
        dict.about.valuesTitle,
        ...dict.about.values,
        dict.about.teamTitle,
        dict.about.teamSubtitle,
        dict.about.teamMember1Name,
        dict.about.teamMember1Role,
        dict.about.teamMember1Bio,
        dict.about.teamMember2Name,
        dict.about.teamMember2Role,
        dict.about.teamMember2Bio,
        dict.about.teamMember3Name,
        dict.about.teamMember3Role,
        dict.about.teamMember3Bio,
      ].join(" "),
      url: "/about",
      category: isFa ? "درباره ما" : "About",
    },
    {
      id: "page-services",
      type: "page",
      title: isFa ? "خدمات درمانی" : "Our Services",
      content: [
        dict.services.subtitle,
        dict.services.service1Title,
        dict.services.service1Desc,
        ...dict.services.service1Features,
        dict.services.service2Title,
        dict.services.service2Desc,
        ...dict.services.service2Features,
        dict.services.service3Title,
        dict.services.service3Desc,
        ...dict.services.service3Features,
        dict.services.service4Title,
        dict.services.service4Desc,
        ...dict.services.service4Features,
        dict.services.service5Title,
        dict.services.service5Desc,
        ...dict.services.service5Features,
        dict.services.service6Title,
        dict.services.service6Desc,
        ...dict.services.service6Features,
      ].join(" "),
      url: "/services",
      category: isFa ? "خدمات" : "Services",
    },
    {
      id: "page-booking",
      type: "page",
      title: isFa ? "رزرو نوبت" : "Book a Session",
      content: [
        dict.booking.subtitle,
        dict.booking.formTitle,
        dict.booking.formSubtitle,
        dict.booking.whatToExpect,
        dict.booking.step1,
        dict.booking.step2,
        dict.booking.step3,
        dict.booking.step4,
        dict.booking.askFirstTitle,
        dict.booking.askFirstText,
      ].join(" "),
      url: "/booking",
      category: isFa ? "رزرو" : "Booking",
    },
    {
      id: "page-contact",
      type: "page",
      title: isFa ? "تماس با ما" : "Contact Us",
      content: [
        dict.contact.subtitle,
        dict.contact.formTitle,
        dict.contact.formSubtitle,
        dict.contact.contactInformation,
        dict.contact.preferForumTitle,
        dict.contact.preferForumText,
      ].join(" "),
      url: "/contact",
      category: isFa ? "تماس" : "Contact",
    },
    {
      id: "page-forum",
      type: "page",
      title: isFa ? "انجمن گفتگو" : "Community Forum",
      content: [
        dict.forum.subtitle,
        dict.forum.recentQuestions,
        dict.forum.newQuestionTitle,
        dict.forum.newQuestionSubtitle,
        ...Object.values(dict.forum.categories),
      ].join(" "),
      url: "/forum",
      category: isFa ? "انجمن" : "Forum",
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// Context snippet extraction
// ─────────────────────────────────────────────────────────────

/**
 * Extract a one-line context snippet around the first match of a term.
 * Returns up to ~120 chars with the match centered.
 */
function extractContext(text: string, term: string, maxLen = 120): string {
  if (!text) return "";
  const lower = text.toLowerCase();
  const termLower = term.toLowerCase();
  const idx = lower.indexOf(termLower);

  if (idx === -1) {
    // No direct match — return the beginning of the text
    return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
  }

  // Center the match in the snippet
  const start = Math.max(0, idx - Math.floor(maxLen / 3));
  const end = Math.min(text.length, start + maxLen);
  const snippet = text.slice(start, end).trim();

  return (start > 0 ? "…" : "") + snippet + (end < text.length ? "…" : "");
}

// ─────────────────────────────────────────────────────────────
// Escape FTS5 search term
// ─────────────────────────────────────────────────────────────

function escapeFtsTerm(term: string): string {
  const cleaned = term.replace(/["*^(){}[\]~:+-]/g, " ").trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/);
  const lastWord = words[words.length - 1];
  const prefixWords = words.slice(0, -1);
  const escaped = [...prefixWords, `${lastWord}*`]
    .map((w) => `"${w.replace(/"/g, '""')}"`)
    .join(" ");
  return escaped;
}

// ─────────────────────────────────────────────────────────────
// Search blog posts (title + content) with context
// ─────────────────────────────────────────────────────────────

function searchBlogs(term: string, limit: number, locale: Locale): SearchResult[] {
  const rawTerm = term.replace(/%/g, "").trim();
  const ftsQuery = escapeFtsTerm(rawTerm);
  const isFa = locale === "fa";

  let rows: any[] = [];

  if (ftsQuery) {
    try {
      rows = db
        .prepare(
          `SELECT b.id, b.title_fa, b.title_en, b.excerpt_fa, b.excerpt_en,
                  b.body_fa, b.body_en, b.image, b.category_fa, b.category_en,
                  b.published_at, 'blog' as type
           FROM blog_posts_fts f
           JOIN blog_posts b ON b.id = f.rowid
           WHERE blog_posts_fts MATCH ? AND b.is_published = 1
           ORDER BY b.published_at DESC
           LIMIT ?`
        )
        .all(ftsQuery, limit) as any[];
    } catch {
      // FTS5 not available — fall through
    }
  }

  if (rows.length === 0) {
    // Fallback: LIKE search on title + content
    const likeTerm = `%${rawTerm}%`;
    rows = db
      .prepare(
        `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en,
                body_fa, body_en, image, category_fa, category_en,
                published_at, 'blog' as type
         FROM blog_posts 
         WHERE is_published = 1 
           AND (title_fa LIKE ? OR title_en LIKE ? OR excerpt_fa LIKE ? OR excerpt_en LIKE ?
                OR body_fa LIKE ? OR body_en LIKE ? OR category_fa LIKE ? OR category_en LIKE ?)
         ORDER BY published_at DESC
         LIMIT ?`
      )
      .all(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, limit) as any[];
  }

  return rows.map((row) => {
    const title = isFa ? row.title_fa : row.title_en || row.title_fa;
    const excerpt = isFa ? row.excerpt_fa : row.excerpt_en || row.excerpt_fa;
    const body = isFa ? row.body_fa : row.body_en || row.body_fa;
    const category = isFa ? row.category_fa : row.category_en || row.category_fa;

    // Prefer excerpt for context, fall back to body
    const contextSource = excerpt || body || "";
    const context = extractContext(contextSource, rawTerm);

    return {
      id: `blog-${row.id}`,
      type: "blog" as const,
      title: title || "",
      context,
      url: `/blog/${row.id}`,
      category,
      date: row.published_at,
      image: row.image,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// Search forum posts (title + content) with context
// ─────────────────────────────────────────────────────────────

function searchForums(term: string, limit: number, locale: Locale): SearchResult[] {
  const rawTerm = term.replace(/%/g, "").trim();
  const ftsQuery = escapeFtsTerm(rawTerm);

  let rows: any[] = [];

  if (ftsQuery) {
    try {
      rows = db
        .prepare(
          `SELECT fp.id, fp.title, fp.content, fp.author_name, fp.category,
                  fp.created_at, 'forum' as type
           FROM forum_posts_fts f
           JOIN forum_posts fp ON fp.id = f.rowid
           WHERE forum_posts_fts MATCH ?
           ORDER BY fp.created_at DESC
           LIMIT ?`
        )
        .all(ftsQuery, limit) as any[];
    } catch {
      // FTS5 not available — fall through
    }
  }

  if (rows.length === 0) {
    const likeTerm = `%${rawTerm}%`;
    rows = db
      .prepare(
        `SELECT id, title, content, author_name, category, created_at, 'forum' as type
         FROM forum_posts 
         WHERE title LIKE ? OR content LIKE ?
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .all(likeTerm, likeTerm, limit) as any[];
  }

  const categoryNames = getDictionary(locale).forum.categories;

  return rows.map((row) => {
    const context = extractContext(row.content || "", rawTerm);
    const categoryKey = row.category || "general";
    const categoryName = categoryNames[categoryKey as keyof typeof categoryNames] || categoryKey;

    return {
      id: `forum-${row.id}`,
      type: "forum" as const,
      title: row.title || "",
      context,
      url: `/forum/${row.id}`,
      category: categoryName,
      date: row.created_at,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// Search static pages
// ─────────────────────────────────────────────────────────────

function searchPages(term: string, locale: Locale): SearchResult[] {
  const rawTerm = term.toLowerCase().trim();
  if (!rawTerm) return [];

  const pages = getStaticPages(locale);
  const results: SearchResult[] = [];

  for (const page of pages) {
    const titleLower = page.title.toLowerCase();
    const contentLower = page.content.toLowerCase();

    if (titleLower.includes(rawTerm) || contentLower.includes(rawTerm)) {
      results.push({
        id: page.id,
        type: "page",
        title: page.title,
        context: extractContext(page.content, rawTerm),
        url: page.url,
        category: page.category,
      });
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// Main search function with caching
// ─────────────────────────────────────────────────────────────

const searchCache = new Map<string, { results: SearchResult[]; expiresAt: number }>();
const SEARCH_CACHE_TTL = 30_000; // 30 seconds
const SEARCH_CACHE_MAX = 200;

function getCachedSearch(key: string): SearchResult[] | undefined {
  const entry = searchCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(key);
    return undefined;
  }
  // Move to end (LRU)
  searchCache.delete(key);
  searchCache.set(key, entry);
  return entry.results;
}

function setCachedSearch(key: string, results: SearchResult[]): void {
  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey !== undefined) searchCache.delete(oldestKey);
  }
  searchCache.set(key, { results, expiresAt: Date.now() + SEARCH_CACHE_TTL });
}

/**
 * Unified search across blog posts, forum posts, and static pages.
 * Results are grouped by category and include one-line context snippets.
 * Uses in-memory caching for performance.
 */
export function searchAll(
  term: string,
  options: {
    locale?: Locale;
    limit?: number;
    includePages?: boolean;
  } = {}
): SearchResponse {
  const { locale = "fa", limit = 8, includePages = true } = options;
  const rawTerm = term.replace(/%/g, "").trim();

  if (!rawTerm || rawTerm.length < 2) {
    return { query: rawTerm, results: [], grouped: { blog: [], forum: [], page: [] }, total: 0 };
  }

  const cacheKey = `${locale}:${rawTerm}:${limit}:${includePages}`;
  const cached = getCachedSearch(cacheKey);
  if (cached) {
    const grouped: Record<SearchCategory, SearchResult[]> = {
      blog: cached.filter((r) => r.type === "blog"),
      forum: cached.filter((r) => r.type === "forum"),
      page: cached.filter((r) => r.type === "page"),
    };
    return { query: rawTerm, results: cached, grouped, total: cached.length };
  }

  // Per-category limits for balanced dropdown results
  const blogLimit = Math.ceil(limit / 2);
  const forumLimit = Math.ceil(limit / 2);

  const blogs = searchBlogs(rawTerm, blogLimit, locale);
  const forums = searchForums(rawTerm, forumLimit, locale);
  const pages = includePages ? searchPages(rawTerm, locale) : [];

  // Combine: pages first (quick navigation), then blogs, then forums
  const results = [...pages, ...blogs, ...forums].slice(0, limit);

  setCachedSearch(cacheKey, results);

  const grouped: Record<SearchCategory, SearchResult[]> = {
    blog: blogs,
    forum: forums,
    page: pages,
  };

  return { query: rawTerm, results, grouped, total: results.length };
}

/**
 * Clear the search cache (call after content mutations).
 */
export function clearSearchCache(): void {
  searchCache.clear();
}
