import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import crypto from "crypto";
import { requireAdminWithCsrf } from "@/lib/security/auth";
import { logger } from "@/lib/core/logger";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf", ".txt",
]);

// Magic byte signatures for file type validation (server-side, spoof-proof)
const MAGIC_BYTES: Record<string, { bytes: number[]; offset?: number }[]> = {
  "image/jpeg": [{ bytes: [0xFF, 0xD8, 0xFF] }],
  "image/png": [{ bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
  "image/gif": [{ bytes: [0x47, 0x49, 0x46, 0x38] }], // "GIF8"
  "image/webp": [
    { bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"
    { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // "WEBP"
  ],
  "image/svg+xml": [
    { bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C] }, // "<?xml"
    { bytes: [0x3C, 0x73, 0x76, 0x67] }, // "<svg"
  ],
  "application/pdf": [{ bytes: [0x25, 0x50, 0x44, 0x46] }], // "%PDF"
  "text/plain": [{ bytes: [0xEF, 0xBB, 0xBF] }], // UTF-8 BOM
};

/**
 * Validate the actual file content (magic bytes) matches the declared MIME type.
 * This prevents spoofed MIME types from bypassing the allowlist.
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  // For text/plain, accept any non-binary content
  if (mimeType === "text/plain") {
    // Check for null bytes which indicate binary content
    return !buffer.subarray(0, 1024).includes(0);
  }

  // For SVG, check for XML/SVG markers anywhere in the first 4KB
  if (mimeType === "image/svg+xml") {
    const head = buffer.subarray(0, 4096).toString("utf8").toLowerCase();
    return head.includes("<svg") || head.includes("<?xml");
  }

  // For other types, check all required signatures
  return signatures.every(({ bytes, offset = 0 }) => {
    if (buffer.length < offset + bytes.length) return false;
    return bytes.every((byte, i) => buffer[offset + i] === byte);
  });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Allowed: images, PDF, text." },
        { status: 400 }
      );
    }

    // Validate extension
    const originalName = file.name || "";
    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "File extension not allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer for magic byte validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes (server-side content check)
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "File content does not match its declared type." },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Generate safe random filename (prevent path traversal)
    const randomName = crypto.randomBytes(16).toString("hex");
    const filename = `${Date.now()}-${randomName}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Optimize images with sharp (resize + compress)
    let finalBuffer: Buffer = buffer;
    const isImage = file.type.startsWith("image/") && file.type !== "image/svg+xml";

    if (isImage) {
      try {
        const optimized = await sharp(buffer)
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        finalBuffer = Buffer.from(optimized);
      } catch (err) {
        logger.error("Image optimization failed, using original", { error: err });
        finalBuffer = buffer;
      }
    }

    // Save the file
    writeFileSync(filepath, finalBuffer);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    logger.error("Error uploading file", { error: error });
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}