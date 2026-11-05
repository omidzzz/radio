import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogBlockSchema, blocksToText, getBlockToc, isSafeBlogUrl, normalizePostDate, parseBlogDocument } from "@/lib/blog/schema";
import { ensureBlogDocumentColumns, importBlogDocument, readStoredBlogDocument } from "@/lib/blog/store";
import { blogPostPath, localizeBlogPost } from "@/lib/blog/presentation";
import { processArticleHtml } from "@/lib/utils/blog-html";
import BlogBlocks from "@/components/blog/BlogBlocks";
import JsonLdScript from "@/components/feedback/JsonLd";
import { createBlogDatabase, minimalDocument } from "./blog-fixtures";
import type { BlogPost } from "@/lib/types/blog";

const demoPath = path.resolve(process.cwd(), "content/blog/neuro-oncology-demo.json");
const demo = parseBlogDocument(JSON.parse(readFileSync(demoPath, "utf8")));

describe("bilingual document validation", () => {
  it("validates the demo and all 16 block types in both languages", () => {
    for (const locale of ["fa", "en"] as const) {
      expect(new Set(demo.translations[locale].content.map((block) => block.type)).size).toBe(16);
      expect(demo.translations[locale].faq.length).toBeGreaterThan(0);
      expect(demo.demo).toBe(true);
    }
  });
  it("defaults unpublished files to draft", () => {
    const { status: _status, ...document } = minimalDocument();
    expect(_status).toBe("published");
    expect(parseBlogDocument(document).status).toBe("draft");
  });
  it("rejects missing translations, unknown blocks, injected styling and invalid slugs", () => {
    expect(() => parseBlogDocument({ ...minimalDocument(), translations: { en: minimalDocument().translations.en } })).toThrow();
    for (const slug of ["123", "../test", "Bad-Slug", "a--b"]) expect(() => parseBlogDocument({ ...minimalDocument(), slug })).toThrow();
    expect(() => BlogBlockSchema.parse({ type: "html", html: "<script>bad()</script>" })).toThrow();
    for (const key of ["html", "css"]) {
      const document = minimalDocument();
      expect(() => parseBlogDocument({ ...document, translations: { ...document.translations, en: { ...document.translations.en, [key]: "nonempty" } } })).toThrow();
    }
    expect(() => parseBlogDocument({ ...minimalDocument(), typo: "unknown" })).toThrow();
  });
  it("rejects malformed tables, empty content, unsupported languages and missing image alt", () => {
    expect(() => BlogBlockSchema.parse({ type: "table", caption: "x", headers: ["a", "b"], rows: [["only one"]] })).toThrow();
    expect(() => BlogBlockSchema.parse({ type: "image", src: "/image.svg" })).toThrow();
    expect(() => BlogBlockSchema.parse({ type: "code", language: "html", code: "x" })).toThrow();
    const document = minimalDocument();
    expect(() => parseBlogDocument({ ...document, translations: { ...document.translations, en: { ...document.translations.en, content: [] } } })).toThrow();
  });
});

describe("URL and date safety", () => {
  it.each(["javascript:alert(1)", "data:text/html,x", "//evil.test/x", "/../secret", "/%2e%2e/secret", "/%252e%252e/secret", "/%2f%2fevil.test", "/%5cevil", "/%00evil", "https://user:pass@example.com", "https://example.com/with space", "/bad%"])("rejects %s", (url) => expect(isSafeBlogUrl(url)).toBe(false));
  it.each(["/images/brain.svg", "/fa/booking?from=blog#form", "https://example.com/guide", "http://localhost:3000/test"])("accepts %s", (url) => expect(isSafeBlogUrl(url)).toBe(true));
  it("normalizes date-only and offsetless dates consistently as UTC", () => {
    expect(normalizePostDate("2026-11-04")).toBe("2026-11-04T00:00:00.000Z");
    expect(normalizePostDate("2026-11-04 10:20:30")).toBe("2026-11-04T10:20:30.000Z");
    expect(normalizePostDate("2026-11-04T10:20:30+03:30")).toBe("2026-11-04T06:50:30.000Z");
  });
  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "11/04/2026", "yesterday", "2026-11-04T24:00:00", "2026-11-04T10:61:00", "2026-11-04T10:00:60"])("rejects date %s", (value) => expect(() => normalizePostDate(value)).toThrow());
});

describe("projections and server rendering", () => {
  it("prevents JSON-LD text from breaking out of its script element", () => {
    const markup = renderToStaticMarkup(createElement(JsonLdScript, { data: { headline: '</script><script>alert("x")</script>' } }));
    expect(markup.match(/<script/g)).toHaveLength(1);
    expect(markup).toContain("\\u003c/script>");
  });
  it("uses deterministic ids and suppresses the duplicated document h1", () => {
    const translation = demo.translations.en;
    const toc = getBlockToc(translation.content, translation.title);
    const markup = renderToStaticMarkup(createElement(BlogBlocks, { blocks: translation.content, title: translation.title, locale: "en" }));
    expect(markup).not.toContain("<h1");
    expect(new Set(toc.map((item) => item.id)).size).toBe(toc.length);
    for (const item of toc) expect(markup).toContain(`id="${item.id}"`);
    expect(markup).toContain('scope="col"');
    expect(markup).toContain("<summary>");
    expect(markup).toContain('dir="ltr"');
  });
  it("keeps structured text literal rather than executing HTML", () => {
    const block = BlogBlockSchema.parse({ type: "paragraph", text: '<img src=x onerror="alert(1)">' });
    const markup = renderToStaticMarkup(createElement(BlogBlocks, { blocks: [block], title: "x", locale: "fa" }));
    expect(markup).toContain("&lt;img");
    expect(markup).not.toContain("<img");
  });
  it("extracts readable text from every block", () => {
    const text = blocksToText(demo.translations.en.content);
    for (const word of ["Neuro-oncology", "Molecular report", "SRS", "CNS", "consultation"]) expect(text).toContain(word);
  });
  it("localizes structured posts and retains legacy language fallback", () => {
    const legacy: BlogPost = { id: 7, titleFA: "عنوان", excerptFA: "توضیح", bodyFA: "<p>متن</p>", authorFA: "نویسنده", categoryFA: "آموزش", readMinutes: 1, isFeatured: false, isPublished: true, createdAt: "2026-11-04", updatedAt: "2026-11-04" };
    expect(blogPostPath(legacy, "fa")).toBe("/fa/blog/7");
    expect(localizeBlogPost(legacy, "en").title).toBe(legacy.titleFA);
    expect(localizeBlogPost({ ...legacy, slug: demo.slug, document: demo }, "en").title).toBe(demo.translations.en.title);
    expect(blogPostPath({ ...legacy, slug: demo.slug }, "en")).toBe("/en/blog/neuro-oncology-demo");
    expect(processArticleHtml('<h2>Legacy heading</h2><p>Body</p><script>alert(1)</script>').html).toContain('id="section-1"');
    expect(processArticleHtml('<script>alert(1)</script>').html).not.toContain("<script");
  });
});

describe("SQLite upsert safety", () => {
  it("adds schema idempotently and preserves all legacy rows", () => {
    const db = createBlogDatabase();
    try {
      db.prepare("INSERT INTO blog_posts(id,title_fa,excerpt_fa,body_fa,author_fa,category_fa,views,is_published) VALUES(42,'Legacy','Old','<p>Original</p>','Author','Old',15,1)").run();
      const before = db.prepare("SELECT * FROM blog_posts WHERE id=42").get() as Record<string, unknown>;
      ensureBlogDocumentColumns(db);
      ensureBlogDocumentColumns(db);
      importBlogDocument(db, minimalDocument());
      const after = db.prepare("SELECT * FROM blog_posts WHERE id=42").get() as Record<string, unknown>;
      for (const key of Object.keys(before)) expect(after[key]).toEqual(before[key]);
      expect(after.slug).toBeNull();
    } finally { db.close(); }
  });
  it("preserves ids, comments, creation timestamps and views on repeat imports", () => {
    const db = createBlogDatabase();
    try {
      const first = importBlogDocument(db, minimalDocument());
      db.prepare("UPDATE blog_posts SET views=31, created_at='2020-01-01 00:00:00' WHERE id=?").run(first.id);
      db.prepare("INSERT INTO blog_comments(id,post_id,author_name,content) VALUES(1,?,'Reader','Keep this')").run(first.id);
      const next = minimalDocument();
      next.translations.en.title = "Updated title";
      const second = importBlogDocument(db, next);
      expect(second).toEqual({ ...first, created: false });
      const row = db.prepare("SELECT * FROM blog_posts").get() as Record<string, unknown>;
      expect(row.views).toBe(31);
      expect(row.created_at).toBe("2020-01-01 00:00:00");
      expect(row.title_en).toBe("Updated title");
      expect(db.prepare("SELECT COUNT(*) AS n FROM blog_posts").get()).toEqual({ n: 1 });
      expect(db.prepare("SELECT content FROM blog_comments WHERE id=1").get()).toEqual({ content: "Keep this" });
      expect(readStoredBlogDocument(String(row.document_json))?.slug).toBe(next.slug);
      expect(db.prepare("SELECT rowid FROM blog_posts_fts WHERE blog_posts_fts MATCH 'Neuro'").all()).toHaveLength(1);
    } finally { db.close(); }
  });
  it("supports draft transitions and rejects invalid input without writes", () => {
    const db = createBlogDatabase();
    try {
      const first = importBlogDocument(db, minimalDocument());
      importBlogDocument(db, { ...minimalDocument(), status: "draft" });
      expect(db.prepare("SELECT id FROM blog_posts WHERE is_published=1").all()).toEqual([]);
      expect(() => importBlogDocument(db, { ...minimalDocument(), date: "invalid" })).toThrow();
      expect(db.prepare("SELECT id FROM blog_posts").all()).toEqual([{ id: first.id }]);
    } finally { db.close(); }
  });
});

describe("standalone importer", () => {
  it("runs validation-only through Node's native TypeScript loader", () => {
    const result = spawnSync(process.execPath, ["--experimental-strip-types", path.resolve("scripts/import-blog.ts"), demoPath, "--check"], { encoding: "utf8", timeout: 20000 });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("VALID neuro-oncology-demo");
  });
  it("rejects unsupported flags and ambiguous inputs", () => {
    for (const args of [[demoPath, "--wat"], [demoPath, demoPath], ["--all", demoPath]]) {
      const result = spawnSync(process.execPath, ["--experimental-strip-types", path.resolve("scripts/import-blog.ts"), ...args], { encoding: "utf8", timeout: 20000 });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Usage:");
    }
  });
});