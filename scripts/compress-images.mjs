import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = "public/images";
const files = fs.readdirSync(dir).filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f));

(async () => {
  console.log("🖼️  Compressing large hero images in public/images/...");
  for (const f of files) {
    const fp = path.join(dir, f);
    try {
      const stats = fs.statSync(fp);
      if (stats.size > 100000) {
        const tmp = path.join(dir, ".tmp-compress");
        await sharp(fp).webp({ quality: 75, effort: 6 }).toFile(tmp);
        fs.rmSync(fp, { force: true });
        fs.renameSync(tmp, fp);
        const newStats = fs.statSync(fp);
        console.log(
          `  ✓ ${f}: ${Math.round(stats.size / 1024)}KB → ${Math.round(
            newStats.size / 1024
          )}KB (${Math.round((1 - newStats.size / stats.size) * 100)}% reduction)`
        );
      }
    } catch (err) {
      console.error(`  ✗ Skipped ${f}: ${err.message}`);
    }
  }
  console.log("Done.");
})();