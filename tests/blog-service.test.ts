import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createBlogDatabase, minimalDocument } from "./blog-fixtures";
import { importBlogDocument } from "@/lib/blog/store";
import { blogCache } from "@/lib/db/cache";
import type Database from "better-sqlite3";

let database: Database.Database;
vi.mock("@/lib/db/db", () => ({
  default: { prepare: (sql: string) => database.prepare(sql) },
  prepare: (sql: string) => database.prepare(sql),
}));

import { getBlogPostBySlug, listPublishedBlogSlugs, listAllBlogPostSummaries, listBlogPostsForRss, listBlogPostsForSitemap, listBlogPostSummaries, listBlogPosts } from "@/lib/services/blog-service";
import { blogRepository } from "@/lib/db/repositories/blog-repository";
import { searchRepository } from "@/lib/db/repositories/search-repository";
import { blogArticleMetadata } from "@/components/blog/BlogArticle";
import { searchAll } from "@/lib/services/search-service";

describe("blog integration with isolated SQLite", () => {
  let id: number;
  beforeAll(() => {
    database = createBlogDatabase();
    database.exec("CREATE TABLE forum_posts(id INTEGER PRIMARY KEY,title TEXT,content TEXT,author_name TEXT,category TEXT,created_at TEXT)");
    blogCache.clear();
    database.prepare("INSERT INTO blog_posts(id,title_fa,excerpt_fa,body_fa,author_fa,category_fa,is_published) VALUES(8,'Legacy','Old','<h2>Legacy body</h2>','Author','Old',1)").run();
    id = importBlogDocument(database, minimalDocument()).id;
    importBlogDocument(database, { ...minimalDocument(), slug: "draft-secret", status: "draft", translations: { fa: minimalDocument().translations.fa, en: { ...minimalDocument().translations.en, title: "Draft confidential" } } });
  });
  afterAll(() => { blogCache.clear(); database.close(); });

  it("resolves slugs and exact legacy ids but never drafts", () => {
    expect(getBlogPostBySlug("test-article")?.id).toBe(id);
    expect(getBlogPostBySlug(String(id))?.slug).toBe("test-article");
    expect(getBlogPostBySlug("8")?.bodyFA).toContain("Legacy body");
    expect(getBlogPostBySlug("08")).toBeUndefined();
    expect(getBlogPostBySlug("draft-secret")).toBeUndefined();
    expect(listPublishedBlogSlugs()).toEqual(expect.arrayContaining(["8", String(id), "test-article"]));
    expect(listPublishedBlogSlugs()).not.toContain("draft-secret");
  });
  it("projects slugs into lists and feeds without serializing full documents", () => {
    const summaries = listAllBlogPostSummaries();
    expect(summaries).toHaveLength(2);
    expect(summaries.find((post) => post.id === id)?.slug).toBe("test-article");
    expect(summaries.some((post) => "document" in post)).toBe(false);
    expect(listBlogPostSummaries({}).posts).toHaveLength(2);
    expect(listBlogPostsForRss().find((post) => post.id === id)?.slug).toBe("test-article");
    expect(listBlogPostsForSitemap().find((post) => post.id === id)?.slug).toBe("test-article");
  });
  it("keeps repository rows and service domain cache entries separate", () => {
    expect(blogRepository.findPublishedBySlug("test-article")?.title_fa).toBe("مقاله آزمایشی");
    expect(getBlogPostBySlug("test-article")?.titleFA).toBe("مقاله آزمایشی");
    blogRepository.listPublished({});
    expect(listBlogPosts({}).posts.find((post) => post.id === id)?.document?.slug).toBe("test-article");
  });
  it("returns localized canonical search results and excludes drafts", () => {
    expect(searchRepository.searchBlogs("Neuro", 10, "en")[0]?.url).toBe("/en/blog/test-article");
    expect(searchRepository.searchBlogs("Draft", 10, "en")).toEqual([]);
    const results = searchAll("Neuro", { locale: "en", includePages: false });
    expect(results.results.some((result) => result.url === "/en/blog/test-article")).toBe(true);
  });
  it("uses translated titles and canonical metadata", () => {
    const post = getBlogPostBySlug("test-article")!;
    const metadata = blogArticleMetadata(post, "en");
    expect(metadata.title).toBe("Test article");
    expect(metadata.alternates?.canonical).toBe("/en/blog/test-article");
    expect(metadata.alternates?.languages?.["fa-IR"]).toBe("/fa/blog/test-article");
  });
});