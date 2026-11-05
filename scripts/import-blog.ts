import { readFileSync, readdirSync, mkdirSync, writeFileSync, renameSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { parseBlogDocument } from "../src/lib/blog/schema.ts";
import { importBlogDocument } from "../src/lib/blog/store.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content", "blog");
const args = process.argv.slice(2);
const check = args.includes("--check");
const all = args.includes("--all");
const filename = args.find((arg) => !arg.startsWith("--"));

async function main() {
  if (args.some((arg) => arg.startsWith("--") && !["--check", "--all"].includes(arg)) || (!all && !filename) || (all && filename) || args.filter((arg) => !arg.startsWith("--")).length > 1) {
    throw new Error("Usage: npm run blog:import -- <file.json> [--check], or npm run blog:sync [-- --check]");
  }
  const files = all
    ? readdirSync(contentDir).filter((name) => name.endsWith(".json")).sort().map((name) => path.join(contentDir, name))
    : [path.resolve(process.cwd(), filename!)];
  if (!files.length) throw new Error(`No JSON documents found in ${contentDir}`);
  // Validate the entire batch before opening/writing the database.
  const documents = files.map((file) => {
    try { return { file, document: parseBlogDocument(JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""))) }; }
    catch (error) { throw new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`); }
  });
  if (new Set(documents.map(({ document }) => document.slug)).size !== documents.length) throw new Error("Duplicate slugs in import batch");
  if (check) {
    for (const { file, document } of documents) console.log(`VALID ${document.slug} (${file})`);
    return;
  }
  const dbPath = path.join(root, "data", "site.db");
  if (!existsSync(dbPath)) throw new Error(`Database not found: ${dbPath}. Start the application once to initialize it.`);
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  try {
    // Online SQLite backup includes the WAL, unlike a plain file copy.
    const backupDir = path.join(root, "data", "backups");
    mkdirSync(backupDir, { recursive: true });
    const backup = path.join(backupDir, `before-blog-import-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    await db.backup(backup);
    const results = db.transaction(() => documents.map(({ document }) => importBlogDocument(db, document)))();
    mkdirSync(contentDir, { recursive: true });
    for (const { document } of documents) {
      const destination = path.join(contentDir, `${document.slug}.json`);
      const temporary = `${destination}.tmp`;
      writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, "utf8");
      renameSync(temporary, destination);
    }
    for (const result of results) console.log(`${result.created ? "IMPORTED" : "UPDATED"} ${result.slug} (id ${result.id})`);
    console.log(`Backup: ${backup}\nRestart the dev server after imports. Run npm run build to regenerate the static site before deployment.`);
  } finally { db.close(); }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});