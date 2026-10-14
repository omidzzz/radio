#!/usr/bin/env node
/**
 * Database backup script for SQLite with gzip compression.
 * Usage: node scripts/backup-db.js [backup-directory]
 * Default backup directory: ./backups
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const Database = require("better-sqlite3");

const cwd = process.cwd();
const dbPath = path.join(cwd, "data", "site.db");
const backupDir = process.argv[2] || path.join(cwd, "backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
const backupPath = path.join(backupDir, `site-backup-${timestamp}.db`);
const gzipPath = `${backupPath}.gz`;

try {
  const sourceDb = new Database(dbPath, { readonly: true });
  // Truncate the WAL so site.db-wal / site.db-shm don't grow unbounded
  // between backups. Checkpointing before VACUUM also guarantees the
  // backup contains every committed transaction.
  try {
    sourceDb.pragma("wal_checkpoint(TRUNCATE)");
  } catch {
    /* non-critical — backup still proceeds from the main db file */
  }
  sourceDb.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
  sourceDb.close();

  const stats = fs.statSync(backupPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  const gzip = zlib.createGzip();
  const input = fs.createReadStream(backupPath);
  const output = fs.createWriteStream(gzipPath);
  input.pipe(gzip).pipe(output);

  output.on("finish", () => {
    fs.unlinkSync(backupPath);
    const gzipStats = fs.statSync(gzipPath);
    const gzipSizeMB = (gzipStats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Backup created: ${gzipPath}`);
    console.log(`   Size: ${sizeMB} MB (compressed: ${gzipSizeMB} MB)`);

    const backupFiles = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith("site-backup-") && f.endsWith(".db.gz"))
      .sort();

    const MAX_BACKUPS = 30;
    if (backupFiles.length > MAX_BACKUPS) {
      const toDelete = backupFiles.slice(0, backupFiles.length - MAX_BACKUPS);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️  Removed old backup: ${file}`);
      }
    }
  });

  output.on("error", (err) => {
    console.error("❌ Gzip failed:", err.message);
    process.exit(1);
  });
} catch (error) {
  console.error("❌ Backup failed:", error.message);
  process.exit(1);
}