/**
 * Local before/after Lighthouse measurement runner.
 *
 * Workflow:
 *   1. `npm run build` (production static export)
 *   2. Serve the `out/` directory on a local HTTP server
 *   3. Run Lighthouse headless against the server
 *   4. Print a compact score/metrics summary
 *   5. Cleanup: terminate the server
 *
 * Usage: node scripts/lighthouse-runner.js
 *
 * Requires Chrome/Chromium/Edge to be installed locally (or a Chrome binary
 * discoverable by `chrome-launcher`). For a CI-only run see
 * `test:lighthouse:ci` (which uses `lhci` + `lighthouserc.js`).
 */
'use strict';

const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'out');
const LH_DIR = path.join(ROOT, 'lh-results');
const PORT = Number(process.env.LH_PORT) || (3456 + (Date.now() % 10000));
const LH_BIN = path.resolve(ROOT, 'node_modules', '.bin', 'lighthouse');
const LH_RESULTS = path.join(LH_DIR, 'latest');

if (!fs.existsSync(LH_BIN)) {
  console.error('[lighthouse] Lighthouse CLI not found. Run: npm install');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) {
  console.error('[lighthouse] out/ missing. Run: npm run build');
  process.exit(1);
}

function build() {
  console.log('[lighthouse] building production export...');
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT });
}

function startServer() {
  return spawn('node', [path.join(ROOT, 'scripts', 'serve-static.js'), OUT_DIR, String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
}

function stopServer(proc) {
  return new Promise((resolve) => {
    if (!proc) return resolve();
    proc.kill('SIGTERM');
    setTimeout(() => {
      if (!proc.killed) proc.kill('SIGKILL');
      resolve();
    }, 1500);
  });
}

/**
 * Poll the server until it responds 200 or the timeout elapses.
 */
function waitReady(callback, timeoutMs = 15000) {
  let timedOut = false;
  const timer = setInterval(() => {
    http.get({ host: 'localhost', port: PORT, path: '/' }, (res) => {
      if (res.statusCode === 200) {
        clearInterval(timer);
        if (!timedOut) callback();
      }
    }).on('error', () => {});
  }, 300);
  setTimeout(() => {
    timedOut = true;
    clearInterval(timer);
  }, timeoutMs);
}

function runLighthouse(outDir) {
  // --output-path is a FILE (not a directory) in this Lighthouse version,
  // so write the JSON report inside the run directory.
  const cmd = [
    LH_BIN,
    `http://localhost:${PORT}`,
    '--preset=desktop',
    '--quiet',
    '--output=json',
    `--output-path=${path.join(outDir, 'json-report.json')}`,
  ].join(' ');
  const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return { outputDir: outDir, raw: result };
}

function summarize(report) {
  const json = typeof report === 'string' ? JSON.parse(report) : report;
  const c = json.categories?.performance || {};
  const audits = json.audits || {};
  return {
    score: c.score ? Math.round(c.score * 100) : null,
    lcp: audits['largest-contentful-paint'] ? Math.round(audits['largest-contentful-paint'].numericValue) : null,
    cls: audits['cumulative-layout-shift'] ? Number((audits['cumulative-layout-shift'].numericValue || 0).toFixed(3)) : null,
    fcp: audits['first-contentful-paint'] ? Math.round(audits['first-contentful-paint'].numericValue) : null,
    ttfb: audits['server-response-time'] ? Math.round(audits['server-response-time'].numericValue) : null,
    firstContentfulPaint: audits['first-contentful-paint'] ? Math.round(audits['first-contentful-paint'].numericValue) : null,
    totalBlockingTime: audits['total-blocking-time'] ? Math.round(audits['total-blocking-time'].numericValue) : null,
    bootupTime: audits['bootup-time'] ? Math.round(audits['bootup-time'].numericValue) : null,
  };
}

async function main() {
  build();
  fs.mkdirSync(LH_DIR, { recursive: true });
  const server = startServer();
  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  await new Promise((resolve) => waitReady(resolve));
  console.log(`[lighthouse] server ready at http://localhost:${PORT}`);

  const outDir = path.join(LH_DIR, `run-${Date.now()}`);
  fs.mkdirSync(outDir, { recursive: true });
  const { outputDir, raw } = runLighthouse(outDir);
  console.log(`[lighthouse] report written to ${outputDir}`);

  let report = raw;
  try { report = fs.readFileSync(path.join(outputDir, 'json-report.json'), 'utf8'); } catch {}
  const summary = summarize(report);
  console.log('\n=== Lighthouse before/after summary ===');
  console.log(JSON.stringify(summary, null, 2));
  console.log('========================================\n');

  // Persist the latest JSON for comparison.
  fs.mkdirSync(path.join(LH_DIR, 'latest'), { recursive: true });
  try { fs.writeFileSync(path.join(LH_DIR, 'latest.json'), report); } catch {}
  fs.writeFileSync(path.join(LH_DIR, 'latest', 'json-report.json'), report);
  fs.writeFileSync(path.join(LH_DIR, 'latest', 'report.json'), raw);

  await stopServer(server);
}

main().catch((err) => {
  console.error('[lighthouse] FAILED:', err.message);
  process.exit(1);
});
