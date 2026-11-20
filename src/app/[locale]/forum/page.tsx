import type { Metadata } from "next";
import LiveForum from "@/components/forms/LiveForum";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/seo/seo";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import PageHero from "@/components/ui/PageHero";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { locale: "fa" as const },
    { locale: "en" as const },
  ];
}

export const revalidate = 60;

export default async function ForumPage({ params }: { params: Promise<{ locale: Locale }>; searchParams?: Promise<{ page?: string; category?: string; sort?: string }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "خانه" : "Home", path: `/${locale}` },
    { name: dict.forum.title, path: `/${locale}/forum` },
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <ParticleBackground id="particles-forum" className="text-muted" />
      </div>

      <PageHero
        badge={dict.forum.title}
        title={dict.forum.title}
        subtitle={dict.forum.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="absolute inset-[8%] rounded-full bg-primary/25 blur-3xl animate-pulse" />
            <RadiationEmblem variant="atom" />
          </div>
        }
      />
      <LiveForum locale={locale} />
    </div>
  );
}
