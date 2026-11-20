import type { Metadata } from "next";
import LiveForum from "@/components/forms/LiveForum";
import { getDictionary, defaultLocale } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo/seo";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import PageHero from "@/components/ui/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  const locale = defaultLocale;
  const dict = getDictionary(locale);

  return {
    title: dict.forum.title,
    description: dict.forum.subtitle,
    alternates: {
      canonical: "/forum",
    },
    openGraph: {
      title: `${dict.forum.title} | ${dict.common.doctorName}`,
      description: dict.forum.subtitle,
      type: "website",
      url: `${siteConfig.url}/forum`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.forum.title} | ${dict.common.doctorName}`,
      description: dict.forum.subtitle,
    },
  };
}

export const revalidate = 60;

export default async function ForumPage({}: { searchParams?: Promise<{ page?: string; category?: string; sort?: string }> }) {
  const locale = defaultLocale;
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "خانه" : "Home", path: "/" },
    { name: dict.forum.title, path: "/forum" },
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL AMBIENT FIELD
      ══════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />

        <ParticleBackground id="particles-forum" className="text-muted" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO — clean medical-tech hero
      ══════════════════════════════════════════════════════════════ */}
      <PageHero
        badge={dict.forum.title}
        title={dict.forum.title}
        subtitle={dict.forum.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <div className="absolute inset-[10%] rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <RadiationEmblem variant="network" />
          </div>
        }
      />
      <LiveForum locale={locale} />
    </div>
  );
}
