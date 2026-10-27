/**
 * Minimal static file server for Lighthouse measurement.
 *
 * Serves the Next.js `output: "export"` build (the `out/` directory) on a
 * fixed port so Lighthouse can crawl a real HTTP server (not `file://`),
 * which is required for accurate performance and Resource Timing audits.
 *
 * Usage: node scripts/serve-static.js <dir> <port>
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'out');
const port = Number(process.argv[3]) || 3000;

const EXT_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.wasm': 'application/wasm',
};

const server = http.createServer((req, res) => {
  // Normalise the request path.
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(root, urlPath));
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': EXT_TYPES[ext] || 'application/octet-stream',
      // Long-lived immutable cache for versioned assets.
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`[lighthouse] serving ${root} on http://localhost:${port}`);
});
