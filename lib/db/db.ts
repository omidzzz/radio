import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { runMigrations } from "./migrations";
import { blogCache, forumCache, statsCache } from "./cache";

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "site.db");

// Singleton pattern: reuse the DB connection across HMR reloads in development
const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined;
  __stmtCache?: Map<string, Database.Statement>;
};

let db: Database.Database;

if (!globalForDb.db) {
  db = new Database(dbPath);
  // Store on globalThis so hot-reload reuses the same connection
  globalForDb.db = db;

  // Performance/durability pragmas - WAL mode for better concurrency
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.pragma("cache_size = -64000"); // 64MB page cache
  db.pragma("temp_store = MEMORY");
  // Avoid immediate SQLITE_BUSY errors when writers contend
  db.pragma("busy_timeout = 5000");

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_replies_post ON forum_replies(post_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON forum_posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(preferred_date, preferred_time);
    CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category_fa);
    CREATE INDEX IF NOT EXISTS idx_blog_title ON blog_posts(title_fa);
    CREATE INDEX IF NOT EXISTS idx_forum_category ON forum_posts(category);
    CREATE INDEX IF NOT EXISTS idx_forum_title ON forum_posts(title);
  `);

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS forum_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      session_type TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fa TEXT NOT NULL,
      title_en TEXT,
      excerpt_fa TEXT NOT NULL,
      excerpt_en TEXT,
      body_fa TEXT NOT NULL,
      body_en TEXT,
      author_fa TEXT NOT NULL,
      author_en TEXT,
      category_fa TEXT NOT NULL,
      category_en TEXT,
      image TEXT,
      read_minutes INTEGER DEFAULT 5,
      is_featured INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
    );
  `);

  // Create FTS5 virtual tables for full-text search
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS blog_posts_fts USING fts5(
        title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en,
        content='blog_posts',
        content_rowid='id',
        tokenize='unicode61'
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS forum_posts_fts USING fts5(
        title, content,
        content='forum_posts',
        content_rowid='id',
        tokenize='unicode61'
      );
    `);

    // Populate FTS tables if empty
    const blogFtsCount = db.prepare("SELECT COUNT(*) as count FROM blog_posts_fts").get() as { count: number };
    if (blogFtsCount.count === 0) {
      db.exec(`
        INSERT INTO blog_posts_fts(rowid, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en)
        SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en FROM blog_posts;
      `);
    }

    const forumFtsCount = db.prepare("SELECT COUNT(*) as count FROM forum_posts_fts").get() as { count: number };
    if (forumFtsCount.count === 0) {
      db.exec(`
        INSERT INTO forum_posts_fts(rowid, title, content)
        SELECT id, title, content FROM forum_posts;
      `);
    }

    // Keep FTS indexes in sync automatically via triggers (the canonical
    // pattern for external-content FTS5 tables — see SQLite docs).
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS blog_posts_fts_insert
      AFTER INSERT ON blog_posts BEGIN
        INSERT INTO blog_posts_fts(rowid, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en)
        VALUES (new.id, new.title_fa, new.title_en, new.excerpt_fa, new.excerpt_en, new.body_fa, new.body_en);
      END;

      CREATE TRIGGER IF NOT EXISTS blog_posts_fts_delete
      AFTER DELETE ON blog_posts BEGIN
        INSERT INTO blog_posts_fts(blog_posts_fts, rowid, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en)
        VALUES ('delete', old.id, old.title_fa, old.title_en, old.excerpt_fa, old.excerpt_en, old.body_fa, old.body_en);
      END;

      CREATE TRIGGER IF NOT EXISTS blog_posts_fts_update
      AFTER UPDATE ON blog_posts BEGIN
        INSERT INTO blog_posts_fts(blog_posts_fts, rowid, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en)
        VALUES ('delete', old.id, old.title_fa, old.title_en, old.excerpt_fa, old.excerpt_en, old.body_fa, old.body_en);
        INSERT INTO blog_posts_fts(rowid, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en)
        VALUES (new.id, new.title_fa, new.title_en, new.excerpt_fa, new.excerpt_en, new.body_fa, new.body_en);
      END;

      CREATE TRIGGER IF NOT EXISTS forum_posts_fts_insert
      AFTER INSERT ON forum_posts BEGIN
        INSERT INTO forum_posts_fts(rowid, title, content)
        VALUES (new.id, new.title, new.content);
      END;

      CREATE TRIGGER IF NOT EXISTS forum_posts_fts_delete
      AFTER DELETE ON forum_posts BEGIN
        INSERT INTO forum_posts_fts(forum_posts_fts, rowid, title, content)
        VALUES ('delete', old.id, old.title, old.content);
      END;

      CREATE TRIGGER IF NOT EXISTS forum_posts_fts_update
      AFTER UPDATE ON forum_posts BEGIN
        INSERT INTO forum_posts_fts(forum_posts_fts, rowid, title, content)
        VALUES ('delete', old.id, old.title, old.content);
        INSERT INTO forum_posts_fts(rowid, title, content)
        VALUES (new.id, new.title, new.content);
      END;
    `);

    // One-time rebuild so any drift caused by the previous manual-sync
    // approach is corrected. Cheap for the scale of this dataset.
    db.exec("INSERT INTO blog_posts_fts(blog_posts_fts) VALUES('rebuild')");
    db.exec("INSERT INTO forum_posts_fts(forum_posts_fts) VALUES('rebuild')");
  } catch (error) {
    // FTS5 might not be available in all SQLite builds
    console.warn("FTS5 not available, falling back to LIKE search:", error);
  }

  // Run migrations synchronously at startup so no query can ever hit a
  // schema that hasn't been migrated yet (previously this was fire-and-forget).
  try {
    runMigrations(db);
  } catch (error) {
    console.error("Failed to run migrations:", error);
  }
} else {
  db = globalForDb.db;
}

// Prepared statement cache to avoid re-preparing statements on every call
const stmtCache =
  globalForDb.__stmtCache ?? (globalForDb.__stmtCache = new Map<string, Database.Statement>());

/**
 * Get a cached prepared statement, or prepare and cache it.
 */
export function prepare(sql: string): Database.Statement {
  let stmt = stmtCache.get(sql);
  if (!stmt) {
    stmt = db.prepare(sql);
    stmtCache.set(sql, stmt);
  }
  return stmt;
}

/**
 * Invalidate cached query results for a table (call after INSERT/UPDATE/DELETE).
 *
 * NOTE: prepared statements are intentionally NOT cleared here — they are
 * table-agnostic and remain valid after writes. Only the result caches that
 * depend on the mutated table are cleared.
 */
export function invalidateCache(table: string): void {
  // cache.ts has no imports of its own, so a static import creates no cycle;
  // the caches are always available here.
  if (table === "blog_posts" || table === "blog_comments") {
    blogCache.clear();
  }
  if (table === "forum_posts" || table === "forum_replies") {
    forumCache.clear();
  }
  if (table === "bookings" || table === "contact_messages") {
    statsCache.clear();
  }
}

/**
 * Sync a blog post into the FTS5 index after insert/update.
 *
 * Kept as a compatibility no-op: FTS indexes are now maintained automatically
 * by triggers created at startup (see the trigger definitions above), which is
 * the reliable pattern for external-content FTS5 tables.
 */
export function syncBlogPostFts(_postId: number): void {
  // Handled by blog_posts_fts_* triggers.
}

/**
 * Sync a forum post into the FTS5 index after insert/update.
 *
 * Kept as a compatibility no-op: FTS indexes are now maintained automatically
 * by triggers created at startup (see the trigger definitions above).
 */
export function syncForumPostFts(_postId: number): void {
  // Handled by forum_posts_fts_* triggers.
}

export default db;
