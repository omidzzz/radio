import Database from "better-sqlite3";

/** Legacy layout: the importer itself must add document columns safely. */
export function createBlogDatabase() {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fa TEXT NOT NULL, title_en TEXT, excerpt_fa TEXT NOT NULL, excerpt_en TEXT,
      body_fa TEXT NOT NULL, body_en TEXT, author_fa TEXT NOT NULL, author_en TEXT,
      category_fa TEXT NOT NULL, category_en TEXT, image TEXT, read_minutes INTEGER DEFAULT 5,
      is_featured INTEGER DEFAULT 0, is_published INTEGER DEFAULT 0, published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      views INTEGER DEFAULT 0
    );
    CREATE TABLE blog_comments (
      id INTEGER PRIMARY KEY, post_id INTEGER NOT NULL REFERENCES blog_posts(id),
      author_name TEXT, content TEXT, is_approved INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE VIRTUAL TABLE blog_posts_fts USING fts5(title_fa,title_en,excerpt_fa,excerpt_en,body_fa,body_en,content='blog_posts',content_rowid='id');
    CREATE TRIGGER blog_posts_fts_insert AFTER INSERT ON blog_posts BEGIN
      INSERT INTO blog_posts_fts(rowid,title_fa,title_en,excerpt_fa,excerpt_en,body_fa,body_en)
      VALUES(new.id,new.title_fa,new.title_en,new.excerpt_fa,new.excerpt_en,new.body_fa,new.body_en);
    END;
    CREATE TRIGGER blog_posts_fts_update AFTER UPDATE ON blog_posts BEGIN
      INSERT INTO blog_posts_fts(blog_posts_fts,rowid,title_fa,title_en,excerpt_fa,excerpt_en,body_fa,body_en)
      VALUES('delete',old.id,old.title_fa,old.title_en,old.excerpt_fa,old.excerpt_en,old.body_fa,old.body_en);
      INSERT INTO blog_posts_fts(rowid,title_fa,title_en,excerpt_fa,excerpt_en,body_fa,body_en)
      VALUES(new.id,new.title_fa,new.title_en,new.excerpt_fa,new.excerpt_en,new.body_fa,new.body_en);
    END;
  `);
  return db;
}

export function minimalDocument() {
  return {
    slug: "test-article", date: "2026-11-04", status: "published",
    translations: {
      fa: { title: "مقاله آزمایشی", excerpt: "توضیح کوتاه", content: [{ type: "paragraph", text: "متن فارسی" }] },
      en: { title: "Test article", excerpt: "A short excerpt", content: [{ type: "paragraph", text: "Neuro-oncology test body" }] },
    },
  };
}