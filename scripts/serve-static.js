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
const zlib = require('zlib');

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

// MIME types that benefit from compression
const COMPRESSIBLE_TYPES = new Set([
  'text/html', 'text/css', 'text/javascript', 'application/javascript',
  'application/json', 'application/xml', 'text/xml', 'text/plain',
  'image/svg+xml',
]);

function compress(data, encoding) {
  if (encoding === 'br') return zlib.brotliCompressSync(data, { level: 11 });
  if (encoding === 'gzip') return zlib.gzipSync(data, { level: 9 });
  return data;
}

function acceptsEncoding(acceptEncodingHeader) {
  if (!acceptEncodingHeader) return null;
  const parts = acceptEncodingHeader.split(',').map(p => p.trim().split(';')[0]);
  if (parts.includes('br')) return 'br';
  if (parts.includes('gzip')) return 'gzip';
  return null;
}

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
    const contentType = EXT_TYPES[ext] || 'application/octet-stream';
    const isCompressible = COMPRESSIBLE_TYPES.has(contentType.split(';')[0].trim());

    const encoding = acceptsEncoding(req.headers['accept-encoding']);
    let body = data;
    const headers = {
      'Content-Type': contentType,
      // Long-lived immutable cache for versioned assets.
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (isCompressible && encoding && ext !== '.woff2' && ext !== '.woff') {
      body = compress(data, encoding);
      headers['Content-Encoding'] = encoding;
      headers['Vary'] = 'Accept-Encoding';
    }

    res.writeHead(200, headers);
    res.end(body);
  });
});

server.listen(port, () => {
  console.log(`[lighthouse] serving ${root} on http://localhost:${port}`);
});
