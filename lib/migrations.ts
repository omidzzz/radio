import type Database from "better-sqlite3";
import { logger } from "./logger";

interface Migration {
  id: number;
  name: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  {
    id: 1,
    name: "add_is_admin_to_forum_replies",
    up: (db) => {
      const columns = db
        .prepare("PRAGMA table_info(forum_replies)")
        .all() as { name: string }[];
      const hasIsAdmin = columns.some((col) => col.name === "is_admin");
      if (!hasIsAdmin) {
        db.exec("ALTER TABLE forum_replies ADD COLUMN is_admin INTEGER DEFAULT 0");
      }
    },
  },
  {
    id: 2,
    name: "create_availability_tables",
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS availability_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          first_available_date TEXT NOT NULL,
          booking_window_days INTEGER NOT NULL DEFAULT 30,
          slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS availability_day_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
          is_available INTEGER NOT NULL DEFAULT 0,
          start_time TEXT,
          end_time TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed default settings if empty
      const settingsCount = db
        .prepare("SELECT COUNT(*) as count FROM availability_settings")
        .get() as { count: number };
      if (settingsCount.count === 0) {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
          now.getDate()
        ).padStart(2, "0")}`;
        db.prepare(
          `INSERT INTO availability_settings (id, first_available_date, booking_window_days, slot_duration_minutes)
           VALUES (1, ?, 30, 30)`
        ).run(today);
      }

      // Seed default day slots if empty
      const daySlotsCount = db
        .prepare("SELECT COUNT(*) as count FROM availability_day_slots")
        .get() as { count: number };
      if (daySlotsCount.count === 0) {
        const insert = db.prepare(
          `INSERT INTO availability_day_slots (day_of_week, is_available, start_time, end_time)
           VALUES (?, ?, ?, ?)`
        );
        const defaults = [
          [0, 0, null, null],
          [1, 1, "08:00", "17:00"],
          [2, 1, "08:00", "17:00"],
          [3, 1, "08:00", "17:00"],
          [4, 1, "08:00", "17:00"],
          [5, 1, "08:00", "13:00"],
          [6, 0, null, null],
        ];
        for (const [day, avail, start, end] of defaults) {
          insert.run(day, avail, start, end);
        }
      }
    },
  },
  {
    id: 3,
    name: "create_unavailable_slots_table",
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS unavailable_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(date, time)
        );
        CREATE INDEX IF NOT EXISTS idx_unavailable_date ON unavailable_slots(date);
      `);
    },
  },
  {
    id: 4,
    name: "update_working_hours_saturday_to_thursday",
    up: (db) => {
      // Working hours = شنبه تا پنجشنبه (Saturday through Thursday / Sunday–Thursday)
      // Friday (day_of_week = 5) closed; Saturday (6) and Sunday (0) working.
      const rows = db
        .prepare("SELECT day_of_week, is_available FROM availability_day_slots")
        .all() as { day_of_week: number; is_available: number }[];
      // Only seed if the table has the legacy default (old Saturday-only closed pattern)
      // Detect legacy: Friday (5) open + Sunday (0) closed
      const legacyFridayOpen = rows.some(
        (r) => r.day_of_week === 5 && r.is_available === 1
      );
      const legacySundayClosed = rows.some(
        (r) => r.day_of_week === 0 && r.is_available === 0
      );
      if (legacyFridayOpen && legacySundayClosed) {
        const update = db.prepare(
          `UPDATE availability_day_slots
           SET is_available = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
           WHERE day_of_week = ?`
        );
        // Sunday (0) open, Friday (5) closed, Saturday (6) open
        update.run(1, "08:00", "17:00", 0);
        update.run(0, null, null, 5);
        update.run(1, "08:00", "17:00", 6);
      }
    },
  },
  {
    id: 5,
    name: "add_views_to_blog_posts_and_composite_index",
    up: (db) => {
      const columns = db
        .prepare("PRAGMA table_info(blog_posts)")
        .all() as { name: string }[];
      if (!columns.some((col) => col.name === "views")) {
        db.exec("ALTER TABLE blog_posts ADD COLUMN views INTEGER DEFAULT 0");
      }
      // Composite index matching the blog list query pattern
      // (filter by is_published + category, order by published_at)
      db.exec(
        "CREATE INDEX IF NOT EXISTS idx_blog_pub_cat_date ON blog_posts(is_published, category_fa, published_at DESC)"
      );
    },
  },
  {
    id: 6,
    name: "add_comment_moderation",
    up: (db) => {
      const columns = db
        .prepare("PRAGMA table_info(blog_comments)")
        .all() as { name: string }[];
      if (!columns.some((col) => col.name === "is_approved")) {
        // Existing comments are grandfathered in as approved;
        // new comments start unapproved until moderated.
        db.exec(
          "ALTER TABLE blog_comments ADD COLUMN is_approved INTEGER NOT NULL DEFAULT 1"
        );
        db.exec(
          "CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(post_id, is_approved)"
        );
      }
    },
  },
];

export function runMigrations(db: Database.Database) {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const applied = new Set(
    (db.prepare("SELECT id FROM schema_migrations").all() as { id: number }[]).map(
      (r) => r.id
    )
  );

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;

    logger.info(`Running migration: ${migration.name}`);
    const run = db.transaction(() => {
      migration.up(db);
      db.prepare("INSERT INTO schema_migrations (id, name) VALUES (?, ?)").run(
        migration.id,
        migration.name
      );
    });

    run();
    logger.info(`Migration complete: ${migration.name}`);
  }
}
