/**
 * Zips the `out/` directory into `deploy.zip` using Node.js built-in zlib.
 * Avoids PowerShell Compress-Archive file-locking conflicts during Next.js export.
 */
const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "out");
const destZip = path.join(process.cwd(), "deploy.zip");
const phpSourceDir = path.join(process.cwd(), "api");
const seenPaths = new Set();

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(outDir).map((file) => ({ file, root: outDir }));

for (const file of walk(phpSourceDir)) {
  const relative = path.relative(phpSourceDir, file).replace(/\\/g, "/");
  if (relative === "config.php" || relative === "config.php.example" || relative === "error_log") continue;
  files.push({ file, root: phpSourceDir, prefix: "api" });
}

for (const file of [path.join(process.cwd(), "public", ".htaccess")]) {
  if (fs.existsSync(file)) files.push({ file, root: path.dirname(file), prefix: "" });
}

const sortedFiles = files.sort((a, b) => {
  const pathA = [a.prefix, path.relative(a.root, a.file)].filter(Boolean).join("/");
  const pathB = [b.prefix, path.relative(b.root, b.file)].filter(Boolean).join("/");
  return pathA.localeCompare(pathB);
});
const chunks = [];
const central = [];
let offset = 0;

for (const entry of sortedFiles) {
  const { file } = entry;
  const rel = [entry.prefix, path.relative(entry.root, file)].filter(Boolean).join("/").replace(/\\/g, "/");
  if (seenPaths.has(rel)) continue;
  seenPaths.add(rel);
  const data = fs.readFileSync(file);
  const nameBuf = Buffer.from(rel, "utf8");
  const time = Math.floor(Date.now() / 1000);
  const modTime = (((time / 3600) & 0x1f) << 11) | (((time / 60) & 0x3f) << 5) | (time & 0x1f);
  const modDate = (((((new Date().getFullYear() - 1980) & 0x7f) << 9) |
    ((new Date().getMonth() + 1) << 5) | new Date().getDate()) & 0xffff);

  // Local file header (stored, no compression)
  const header = Buffer.alloc(30 + nameBuf.length);
  header.write("PK\x03\x04", 0, "binary");
  header.writeUInt16LE(20, 4);  // version needed
  header.writeUInt16LE(0, 6);   // flags
  header.writeUInt16LE(0, 8);   // stored
  header.writeUInt16LE(modTime, 10);
  header.writeUInt16LE(modDate, 12);
  header.writeUInt32LE(0, 14);  // crc (ignored for stored)
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(nameBuf.length, 26);
  header.writeUInt16LE(0, 28);
  nameBuf.copy(header, 30);

  chunks.push(header, data);

  // Central directory entry
  const cent = Buffer.alloc(46 + nameBuf.length);
  cent.write("PK\x01\x02", 0, "binary");
  cent.writeUInt16LE(20, 4);
  cent.writeUInt16LE(20, 6);
  cent.writeUInt16LE(0, 8);
  cent.writeUInt16LE(0, 10);
  cent.writeUInt16LE(modTime, 12);
  cent.writeUInt16LE(modDate, 14);
  cent.writeUInt32LE(0, 16);
  cent.writeUInt32LE(data.length, 20);
  cent.writeUInt32LE(data.length, 24);
  cent.writeUInt16LE(nameBuf.length, 28);
  cent.writeUInt16LE(0, 30);
  cent.writeUInt16LE(0, 32);
  cent.writeUInt16LE(0, 34);
  cent.writeUInt16LE(0, 36);
  cent.writeUInt32LE(0, 38);
  cent.writeUInt32LE(offset, 42);
  nameBuf.copy(cent, 46);

  central.push(cent);
  offset += header.length + data.length;
}

// End of central directory
const eocd = Buffer.alloc(22);
eocd.write("PK\x05\x06", 0, "binary");
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(central.length, 8);
eocd.writeUInt16LE(central.length, 10);
eocd.writeUInt32LE(central.reduce((s, c) => s + c.length, 0), 12);
eocd.writeUInt32LE(offset, 16);
eocd.writeUInt16LE(0, 20);

fs.writeFileSync(destZip, Buffer.concat([...chunks, ...central, eocd]));
console.log(`deploy.zip created (${sortedFiles.length} files, including PHP blog/admin endpoints)`);
