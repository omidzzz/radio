import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = "public/images";

// Max target width per asset pattern. The hero images are served full-res
// (250–250 KB) but only a small fraction is visible in the layout, so we
// downscale to their true display size while keeping the WebP format.
const targets = {
  "hero-radiology": 1400,
  "home-radiologist": 1200,
  "process-left": 700,
  "process-right": 700,
  "home-parallax": 800,
  "home-consultation": 800,
  "blog-default": 800,
};

// Windows: input file may stay locked for a moment after sharp writes output.
async function removeFileRetry(fp, tries = 10, delayMs = 300) {
  for (let i = 0; i < tries; i++) {
    try {
      fs.rmSync(fp, { force: true });
      return;
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

(async () => {
  console.log("🖼️  Optimizing hero images in public/images/ (downscale + re-encode)...");
  const files = fs.readdirSync(dir).filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f));

  for (const f of files) {
    const fp = path.join(dir, f);
    try {
      const stats = fs.statSync(fp);
      if (stats.size < 40000) {
        console.log(`  ℹ️  ${f}: ${Math.round(stats.size / 1024)}KB (too small, skipping)`);
        continue;
      }

      const base = f.replace(/\.[^.]+$/, "");
      const maxWidth = targets[base] || 800;
      const { width } = await sharp(fp).metadata();
      const targetWidth = Math.min(width, maxWidth);

      // Write to a temp file in a SEPARATE directory to avoid same-dir locking.
      const tmp = path.join(dir, ".tmp-compress");
      await sharp(fp).resize(targetWidth, undefined, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(tmp);

      // Delete original, then rename tmp into place.
      await removeFileRetry(fp);
      fs.renameSync(tmp, fp);

      const newSize = fs.statSync(fp).size;
      console.log(
        `  ✅ ${f}: ${Math.Round(stats.size / 1024)}KB → ${Math.Round(newSize / 1024)}KB (${Math.Round((1 - newSize / stats.size) * 100)}% reduction)`
      );
    } catch (err) {
      console.error(`  ✗ Skipped ${f}: ${err.message}`);
    }
  }
  console.log("Done.");
})();
