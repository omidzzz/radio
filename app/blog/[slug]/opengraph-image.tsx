import { ImageResponse } from "next/og";
import db from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamically generated Open Graph images for blog posts.
 * Renders the post title over a branded gradient card.
 *
 * Note: Persian titles require an Arabic-script font, so Vazirmatn is
 * fetched at generation time; if the fetch fails we fall back to the
 * system font (Latin titles still render fine).
 */

async function loadVazirmatn(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(
      "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Bold.ttf",
      { cache: "force-cache" }
    );
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

export async function generateImageMetadata() {
  return [{ id: "default", size, contentType }];
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = db
    .prepare(
      "SELECT title_fa, title_en, category_fa FROM blog_posts WHERE (id = ? OR CAST(id AS TEXT) = ?) AND is_published = 1"
    )
    .get(slug, slug) as
    | { title_fa: string; title_en?: string; category_fa: string }
    | undefined;

  const title = post ? post.title_fa : siteConfig.title.fa;
  const category = post?.category_fa ?? "";

  const fontData = await loadVazirmatn();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #020617 0%, #0b1120 55%, #083344 100%)",
        }}
      >
        {/* Ambient glow accents */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(194,55,31,0.14)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -60,
            width: 460,
            height: 460,
            borderRadius: 999,
            background: "rgba(194,55,31,0.12)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "linear-gradient(135deg,#22d3ee,#14b8a6)",
              color: "#020617",
              fontSize: 30,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            R
          </div>
          <div style={{ color: "#e2e8f0", fontSize: 28 }}>
            {siteConfig.shortName}
          </div>
          {category ? (
            <div
              style={{
                marginRight: "auto",
                border: "2px solid rgba(194,55,31,0.5)",
                color: "#67e8f9",
                borderRadius: 999,
                padding: "6px 20px",
                fontSize: 22,
              }}
            >
              {category}
            </div>
          ) : null}
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: title.length > 60 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.25,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        <div
          style={{
            height: 4,
            width: "100%",
            background:
              "linear-gradient(90deg, transparent, #22d3ee, transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Vazirmatn", data: fontData, weight: 700, style: "normal" }]
        : [],
    }
  );
}