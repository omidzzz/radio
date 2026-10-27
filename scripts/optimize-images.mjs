import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const imgDir = path.join(__dirname, "..", "public", "images");
const outDir = path.join(__dirname, "..", "public", "images-optimized");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targets = {
  "hero-radiology": 1400,
  "home-radiologist": 1200,
  "process-left": 700,
  "process-right": 700,
  "home-parallax": 800,
  "home-consultation": 800,
  "blog-default": 800,
};

const files = fs.readdirSync(imgDir).filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f));

for (const f of files) {
  const src = path.join(imgDir, f);
  const stat = fs.statSync(src);
  if (stat.size < 40000) {
    console.log(`ℹ️  ${f}: too small (${Math.round(stat.size / 1024)}KB), skipping`);
    continue;
  }

  const base = f.replace(/\.[^.]+$/, "");
  const maxWidth = targets[base] || 800;
  const { width } = await sharp(src).metadata();
  const targetWidth = Math.min(width, maxWidth);

  // Read into memory, then write output to the separate directory.
  const buf = fs.readFileSync(src);
  const optimized = await sharp(buf)
    .resize(targetWidth, undefined, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();

  const outPath = path.join(outDir, f);
  fs.writeFileSync(outPath, optimized);
  console.log(
    `✅ ${f}: ${Math.round(stat.size / 1024)}KB → ${Math.round(optimized.length / 1024)}KB`
  );
}

console.log("Done.");
