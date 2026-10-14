import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const files: { url: string; name: string; size: number; modifiedAt: string }[] = [];

    try {
      const entries = readdirSync(uploadsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (!IMAGE_EXT.has(ext)) continue;
        const stats = statSync(path.join(uploadsDir, entry.name));
        files.push({
          url: `/uploads/${entry.name}`,
          name: entry.name,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        });
      }
    } catch {
      // Directory doesn't exist yet
    }

    files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing media:", error);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}