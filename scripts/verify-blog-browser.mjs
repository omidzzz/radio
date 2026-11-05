import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { createRequire } from "node:module";

// Uses the project's existing Lighthouse transitive test utilities, not app dependencies.
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const build = JSON.parse(readFileSync(path.join(root, "data", "blog-build-verification.json"), "utf8"));
assert.equal(build.status, "passed", "Run blog:verify-build first");
const exportRoot = path.join(build.workspace, "out");
const artifacts = path.join(root, "data", "blog-verification");
mkdirSync(artifacts, { recursive: true });
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json", ".xml": "application/xml", ".woff2": "font/woff2", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".txt": "text/plain" };
const missing = [];
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  // Browser validation must not call live APIs or alter view counts.
  if (pathname.startsWith("/api/")) { response.writeHead(200, { "Content-Type": "application/json" }); response.end('{"views":0,"comments":[]}'); return; }
  let file = path.resolve(exportRoot, `.${pathname}`);
  if (!file.startsWith(`${exportRoot}${path.sep}`) && file !== exportRoot) { response.writeHead(403); response.end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!existsSync(file)) { missing.push(pathname); response.writeHead(404); response.end(); return; }
  response.writeHead(200, { "Content-Type": `${mime[path.extname(file)] ?? "application/octet-stream"}; charset=utf-8` });
  response.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const chrome = process.env.CHROME_PATH ?? ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"].find(existsSync);
assert.ok(chrome, "Set CHROME_PATH to the installed Chrome/Chromium executable");
let browser;
const results = [];
try {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--disable-dev-shm-usage"] });
  for (const locale of ["fa", "en"]) for (const theme of ["light", "dark"]) for (const width of [390, 1440]) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.evaluateOnNewDocument((mode) => localStorage.setItem("radiotherapy-theme", mode), theme);
    await page.goto(`${base}/${locale}/blog/neuro-oncology-demo/`, { waitUntil: "networkidle0" });
    await page.waitForFunction((mode) => document.documentElement.dataset.theme === mode, {}, theme);
    await page.evaluate(async () => {
      await Promise.all([...document.querySelectorAll(".blog-article img")].map(async (image) => {
        image.loading = "eager";
        await image.decode();
      }));
    });
    const metrics = await page.evaluate(() => ({
      h1: document.querySelectorAll(".blog-article h1").length,
      direction: getComputedStyle(document.querySelector(".blog-article")).direction,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      images: [...document.querySelectorAll(".blog-article img")].every((image) => image.complete && image.naturalWidth > 0),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      toc: [...document.querySelectorAll('.blog-article nav a[href^="#"]')].every((anchor) => document.getElementById(anchor.getAttribute("href").slice(1))),
      articleSchema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent)).find((schema) => schema["@type"] === "Article"),
    }));
    assert.equal(metrics.h1, 1);
    assert.equal(metrics.direction, locale === "fa" ? "rtl" : "ltr");
    assert.ok(metrics.overflow <= 1, `Overflow at ${locale}/${theme}/${width}: ${metrics.overflow}`);
    assert.ok(metrics.images, "All article images should load");
    assert.ok(metrics.toc, "All TOC links should resolve");
    assert.ok(new URL(metrics.canonical).pathname.replace(/\/$/, "").endsWith(`/${locale}/blog/neuro-oncology-demo`), metrics.canonical);
    assert.equal(metrics.articleSchema.inLanguage, locale === "fa" ? "fa-IR" : "en-US");
    assert.equal(metrics.articleSchema.publisher, undefined);
    assert.deepEqual(errors, [], `Browser errors: ${errors.join("; ")}`);
    await page.$eval(".blog-accordion summary", (summary) => summary.click());
    assert.ok(await page.$eval(".blog-accordion details", (details) => details.open));
    if (width === 390) await page.$eval(".blog-mobile-toc summary", (summary) => summary.click());
    const tocSelector = width === 390 ? ".blog-mobile-toc nav a" : ".blog-sidebar nav a";
    await page.$eval(tocSelector, (anchor) => anchor.click());
    assert.ok(new URL(page.url()).hash.startsWith("#block-"));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.addScriptTag({ path: require.resolve("axe-core") });
    const accessibility = await page.evaluate(async () => {
      const result = await window.axe.run(document.querySelector(".blog-article"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
      return result.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) }));
    });
    await page.screenshot({ path: path.join(artifacts, `${locale}-${theme}-${width}.png`), fullPage: false });
    results.push({ locale, theme, width, ...metrics, accessibility, browserErrors: errors });
    await page.close();
  }
  const page = await browser.newPage();
  await page.goto(`${base}/en/blog/`, { waitUntil: "networkidle0" });
  assert.ok(await page.$('a[href="/en/blog/neuro-oncology-demo"]'));
  await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed]')].find((button) => button.textContent.includes("Neuro-oncology")).click());
  assert.ok(new URL(page.url()).searchParams.has("category"));
  assert.equal(await page.$$eval(".blog-card", (cards) => cards.length), 1);
  for (const url of ["/fa/blog/2/", "/en/blog/2/"]) {
    await page.goto(`${base}${url}`, { waitUntil: "networkidle0" });
    assert.ok(await page.$eval(".article-content", (article) => article.textContent.trim().length > 0), `Body missing: ${url}`);
  }
  assert.ok(readFileSync(path.join(exportRoot, "sitemap.xml"), "utf8").includes("/en/blog/neuro-oncology-demo/"));
  assert.ok(readFileSync(path.join(exportRoot, "rss.xml"), "utf8").includes("/fa/blog/neuro-oncology-demo/"));
  const report = { results, missing: [...new Set(missing)] };
  writeFileSync(path.join(root, "data", "blog-browser-verification.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  assert.deepEqual(report.missing, [], "Missing exported assets");
  assert.deepEqual(results.flatMap((result) => result.accessibility.filter((issue) => ["serious", "critical"].includes(issue.impact))), [], "Article accessibility violations");
  console.log("PASS: responsive bilingual themes, TOC, accordions, listing, aliases, RSS and sitemap");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}