import { cpSync, existsSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import Database from "better-sqlite3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = mkdtempSync(path.join(tmpdir(), "radiotherapist-blog-build-"));
// Next 15 static export always compiles in .next, even with a custom distDir.
// Isolate sources, generated types, export output and SQLite, not just a config option.
for (const name of ["src", "public", "content", "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "next-env.d.ts", "postcss.config.mjs", "tailwind.config.ts", ".env"]) {
  const source = path.join(root, name);
  if (existsSync(source)) cpSync(source, path.join(workspace, name), { recursive: true });
}
symlinkSync(path.join(root, "node_modules"), path.join(workspace, "node_modules"), process.platform === "win32" ? "junction" : "dir");
mkdirSync(path.join(workspace, "data"));
const db = new Database(path.join(root, "data", "site.db"), { readonly: true });
try { await db.backup(path.join(workspace, "data", "site.db")); }
finally { db.close(); }
const reportPath = path.join(root, "data", "blog-build-verification.json");
writeFileSync(reportPath, JSON.stringify({ workspace, status: "running" }, null, 2));
console.log(`Isolated workspace: ${workspace}`);
const child = spawn(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build"], {
  cwd: workspace, stdio: "inherit", env: { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
});
const code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", resolve); });
writeFileSync(reportPath, JSON.stringify({ workspace, status: code === 0 ? "passed" : "failed", exitCode: code }, null, 2));
console.log(`Verification ${code === 0 ? "passed" : "failed"}. Temporary workspace retained for inspection: ${workspace}`);
console.log("The temporary copy contains .env and a database snapshot; remove it after inspection.");
process.exitCode = code ?? 1;