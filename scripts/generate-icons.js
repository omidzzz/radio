/**
 * Generates the raster brand assets that browsers need but cannot take
 * from the source SVG:
 *
 *   public/images/icon-192.png            PWA / Android launcher icon
 *   public/images/icon-512.png            PWA store + splash icon
 *   public/images/icon-512-maskable.png   Adaptive icon (40% safe zone)
 *   public/images/apple-touch-icon.png    iOS home-screen icon (180px, opaque)
 *   public/images/blog-default.webp       Fallback poster for posts without an image
 *
 * Usage: npm run icons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const IMAGES = path.join(ROOT, "public", "images");
const SRC_ICON = path.join(IMAGES, "icon.svg");

/** Brand deep background (--color-deep) used for full-bleed variants */
const DEEP = { r: 2, g: 6, b: 23, alpha: 1 };

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

function readIcon() {
  if (!fs.existsSync(SRC_ICON)) {
    throw new Error(`Missing source icon: ${SRC_ICON}`);
  }
  return fs.readFileSync(SRC_ICON);
}

/** Plain icon — keeps the artwork's own rounded, transparent corners. */
async function renderPlain(svg, size) {
  return sharp(svg, { density: 400 })
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .png({ compressionLevel: 9, effort: 8 })
    .toBuffer();
}

/**
 * Maskable icon — full-bleed deep tile with the emblem scaled to 72% so it
 * survives the ~20% crop any launcher applies (Android "safe zone").
 */
async function renderMaskable(svg, size) {
  const emblemSize = Math.round(size * 0.72);
  const emblem = await sharp(svg, { density: 400 })
    .resize(emblemSize, emblemSize, { fit: "contain", background: TRANSPARENT })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: DEEP },
  })
    .composite([{ input: emblem, gravity: "center" }])
    .png({ compressionLevel: 9, effort: 8 })
    .toBuffer();
}

/** iOS ignores transparency and rounds the corners itself — ship an opaque square. */
async function renderAppleTouch(svg, size) {
  const emblem = await sharp(svg, { density: 400 })
    .resize(Math.round(size * 0.86), Math.round(size * 0.86), {
      fit: "contain",
      background: TRANSPARENT,
    })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: DEEP },
  })
    .composite([{ input: emblem, gravity: "center" }])
    .png({ compressionLevel: 9, effort: 8 })
    .toBuffer();
}

/**
 * Fallback poster for blog cards without a cover image — same visual language
 * as the site (planning grid, isodose rings, radiation trefoil).
 */
function blogFallbackSvg() {
  const d = (x) => Number(x.toFixed(1));
  // Three trefoil blades as thick arcs, 120° apart (SVG y-down coordinates)
  const blades = [
    [240, 300],
    [0, 60],
    [120, 180],
  ]
    .map(([from, to]) => {
      const r = 132;
      const rad = (deg) => (deg * Math.PI) / 180;
      const x1 = d(Math.cos(rad(from)) * r);
      const y1 = d(Math.sin(rad(from)) * r);
      const x2 = d(Math.cos(rad(to)) * r);
      const y2 = d(Math.sin(rad(to)) * r);
      return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
    })
    .join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="55%" stop-color="#04121f"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="58%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#22d3ee" stroke-opacity="0.09" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <rect width="1200" height="800" fill="url(#glow)"/>

  <g transform="translate(600 380)" fill="none" stroke="#22d3ee">
    <circle r="300" stroke-opacity="0.08" stroke-dasharray="6 14"/>
    <circle r="248" stroke-opacity="0.12"/>
    <circle r="196" stroke-opacity="0.16" stroke-dasharray="3 9"/>
    <g stroke-opacity="0.18" stroke-width="72" stroke-linecap="butt">
      <path d="${blades}"/>
    </g>
    <circle r="22" fill="#22d3ee" fill-opacity="0.85" stroke="none"/>
    <path d="M0 -196v-44M0 196v44M-196 0h-44M196 0h44" stroke-opacity="0.3" stroke-linecap="round"/>
  </g>

  <text x="600" y="752" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
        font-size="22" font-weight="600" letter-spacing="6" fill="#67e8f9" fill-opacity="0.45">
    RADIOTHERAPY / IMAGING
  </text>
</svg>`;
}

async function main() {
  const svg = readIcon();

  const outputs = [
    ["icon-192.png", await renderPlain(svg, 192)],
    ["icon-512.png", await renderPlain(svg, 512)],
    ["icon-512-maskable.png", await renderMaskable(svg, 512)],
    ["apple-touch-icon.png", await renderAppleTouch(svg, 180)],
    [
      "blog-default.webp",
      await sharp(Buffer.from(blogFallbackSvg()), { density: 200 })
        .webp({ quality: 78, effort: 5 })
        .toBuffer(),
    ],
  ];

  for (const [name, buffer] of outputs) {
    const target = path.join(IMAGES, name);
    fs.writeFileSync(target, buffer);
    console.log(`✓ ${name} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((error) => {
  console.error("Icon generation failed:", error);
  process.exit(1);
});
