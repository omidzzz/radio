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
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const LH_DIR = path.join(ROOT, 'lh-results');
const PORT = Number(process.env.LH_PORT) || (3456 + (Date.now() % 10000));
const LH_BIN = path.resolve(ROOT, 'node_modules', 'lighthouse', 'cli', 'index.js');
const HOME_PATH = process.env.LH_PATH || '/fa/';
const OUT_DIR = path.join(ROOT, 'out');

if (!fs.existsSync(LH_BIN)) {
  console.error('[lighthouse] Lighthouse CLI not found. Run: npm install');
  process.exit(1);
}

function build() {
  console.log('[lighthouse] building production export...');
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT });
}

function startServer() {
  // Serve the static export that `next build` generates in `out/`.
  // This avoids relying on `next start`, which is not appropriate for
  // an exported static site and can hang on readiness checks.
  const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url || '/', `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(requestUrl.pathname);

    // Mirror the production export behavior by mapping directory-style URLs
    // to `index.html` and defaulting `/` to the exported default locale.
    if (pathname === '/' || pathname === '') pathname = HOME_PATH;
    if (pathname.endsWith('/')) pathname += 'index.html';
    if (!path.extname(pathname)) pathname += '/index.html';

    const filePath = path.join(OUT_DIR, pathname.replace(/^\/+/, ''));
    const normalizedOut = path.normalize(OUT_DIR + path.sep);
    const normalizedFile = path.normalize(filePath);

    if (!normalizedFile.startsWith(normalizedOut)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    fs.readFile(normalizedFile, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      const ext = path.extname(normalizedFile).toLowerCase();
      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.xml': 'application/xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
      }[ext] || 'application/octet-stream';

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);

      // Match the deployed Apache mod_deflate behavior for text assets so
      // local Lighthouse scores aren't penalized by an uncompressed test
      // server. Keep already-compressed images/fonts untouched.
      const compressible = /^(text\/|application\/(?:javascript|json|xml|xhtml\+xml|rss\+xml))|^image\/svg\+xml/i.test(contentType);
      const encodings = String(req.headers['accept-encoding'] || '')
        .split(',')
        .map((entry) => {
          const [name, ...params] = entry.trim().toLowerCase().split(';');
          const quality = params.find((param) => param.trim().startsWith('q='));
          return { name: name.trim(), quality: quality ? Number(quality.trim().slice(2)) : 1 };
        });
      const gzipEntry = encodings.find((entry) => entry.name === 'gzip');
      const wildcardEntry = encodings.find((entry) => entry.name === '*');
      const acceptsGzip = gzipEntry
        ? gzipEntry.quality > 0
        : Boolean(wildcardEntry && wildcardEntry.quality > 0);

      if (compressible) res.setHeader('Vary', 'Accept-Encoding');
      if (!compressible || !acceptsGzip) {
        res.end(data);
        return;
      }

      zlib.gzip(data, (gzipError, compressed) => {
        if (gzipError) {
          res.statusCode = 500;
          res.end('Compression failed');
          return;
        }
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        res.end(compressed);
      });
    });
  });

  server.listen(PORT, '127.0.0.1');
  return server;
}

function stopServer(proc) {
  return new Promise((resolve) => {
    if (!proc) return resolve();
    try {
      proc.close?.();
    } catch {}
    setTimeout(() => resolve(), 250);
  });
}

function waitForServer(port, pathName, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const poll = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        reject(new Error(`server did not become ready at ${pathName} within ${timeoutMs}ms`));
        return;
      }

      const req = http.get(`http://localhost:${port}${pathName}`, (res) => {
        // Accept redirects and other successful responses as "ready".
        // Static-exported sites can legitimately answer with 3xx redirects.
        if (res.statusCode && res.statusCode < 500) {
          res.resume();
          resolve();
          return;
        }

        res.resume();
        setTimeout(poll, 300);
      });

      req.setTimeout(Math.min(remaining, 5000), () => {
        req.destroy(new Error('probe timed out'));
      });

      req.on('error', () => {
        setTimeout(poll, 300);
      });
    };

    poll();
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
    await waitForServer(PORT, HOME_PATH);
    const url = `http://localhost:${PORT}${HOME_PATH}`;
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
