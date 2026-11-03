/**
 * Local before/after Lighthouse measurement runner.
 *
 * Workflow:
 *   1. `npm run build` (production build, server-rendered output)
 *   2. Start `next start` on a local HTTP server
 *   3. Run Lighthouse headless against the server (desktop + mobile)
 *   4. Print a compact score/metrics summary with comparison
 *   5. Cleanup: terminate the server
 *
 * Usage: node scripts/lighthouse-runner.js
 *
 * Requires Chrome/Chromium/Edge to be installed locally (discoverable by
 * `chrome-launcher`). For a CI-only run see `test:lighthouse:ci` (lhci).
 */
'use strict';

const { execSync, spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LH_DIR = path.join(ROOT, 'lh-results');
const PORT = Number(process.env.LH_PORT) || (3456 + (Date.now() % 10000));
const LH_BIN = path.resolve(ROOT, 'node_modules', 'lighthouse', 'cli', 'index.js');

if (!fs.existsSync(LH_BIN)) {
  console.error('[lighthouse] Lighthouse CLI not found. Run: npm install');
  process.exit(1);
}

function build() {
  console.log('[lighthouse] building production export...');
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT });
}

function startServer() {
  // Start Next.js production server on the specified port
  // shell: true needed for .cmd batch files on Windows
  return spawn(path.join(ROOT, 'node_modules', '.bin', 'next.cmd'), ['start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
    shell: true,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
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

function waitForServer(port, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not become ready')), timeoutMs);
    const req = http.get(`http://localhost:${port}/`, (res) => {
      clearTimeout(timer);
      if (res.statusCode === 200) resolve();
      else res.resume();
    });
    req.on('error', () => {
      clearTimeout(timer);
      setTimeout(() => waitForServer(port, timeoutMs).then(resolve, reject), 300);
    });
  });
}

function runLighthouse(url, preset, label, isMobile = false) {
  return new Promise((resolve, reject) => {
    const outPath = path.join(LH_DIR, `run-${Date.now()}-${label}.json`);
    const args = [
      url,
      '--preset=' + preset,
      '--output=json',
      '--output-path=' + outPath,
      '--chrome-flags=--headless --no-sandbox --disable-gpu',
    ];
    if (isMobile) {
      args.push('--emulated-form-factor=mobile');
    }
    console.log(`[lighthouse] running ${label} against ${url}...`);
    const proc = spawn('node', [LH_BIN, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`[lighthouse] ${label} exited with code ${code}`);
        console.error(stderr.slice(-2000));
        return reject(new Error(`lighthouse ${label} failed`));
      }
      try {
        const result = JSON.parse(fs.readFileSync(outPath, 'utf8'));
        resolve({ label, result, outPath });
      } catch (e) {
        reject(e);
      }
    });
  });
}

function summarize(result, label) {
  const cats = result.categories || {};
  const audits = result.audits || {};
  const lines = [`\n=== ${label} Lighthouse Results ===`];
  for (const [cat, val] of Object.entries(cats)) {
    lines.push(`  ${cat}: ${Math.round((val.score || 0) * 100)}/100`);
  }
  const key = [
    'first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift',
    'total-blocking-time', 'speed-index', 'interactive',
  ];
  for (const a of key) {
    const au = audits[a];
    if (au) lines.push(`  ${a}: ${au.displayValue || au.numericValue} (score ${Math.round((au.score || 0) * 100)})`);
  }
  console.log(lines.join('\n'));
}

(async () => {
  fs.mkdirSync(LH_DIR, { recursive: true });
  build();
  const server = startServer();
  try {
    await waitForServer(PORT);
    const url = `http://localhost:${PORT}/`;
    const desktop = await runLighthouse(url, 'desktop', 'desktop');
    summarize(desktop.result, 'Desktop');
    const mobile = await runLighthouse(url, 'perf', 'mobile', true);
    summarize(mobile.result, 'Mobile');
    fs.writeFileSync(path.join(LH_DIR, 'latest-desktop.json'), JSON.stringify(desktop.result, null, 2));
    fs.writeFileSync(path.join(LH_DIR, 'latest-mobile.json'), JSON.stringify(mobile.result, null, 2));
    fs.writeFileSync(path.join(LH_DIR, 'latest.json'), JSON.stringify(desktop.result, null, 2));
    console.log('\n[lighthouse] results saved to', LH_DIR);
  } finally {
    await stopServer(server);
  }
})().catch((err) => {
  console.error('[lighthouse] error:', err.message);
  process.exit(1);
});
