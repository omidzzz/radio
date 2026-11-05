import type { BlogPost } from "@/lib/types/blog";
import type { Locale } from "@/lib/i18n/config";
import { blocksToText, localizeBlogText } from "./schema";

export function blogPostPath(post: { id: number; slug?: string | null }, locale: Locale): string {
  return `/${locale}/blog/${post.slug || post.id}`;
}

export function absoluteBlogUrl(value: string, base: string): string {
  return new URL(value, base).href;
}

/** Keep localized page, metadata, and JSON-LD projections in agreement. */
export function localizeBlogPost(post: BlogPost, locale: Locale) {
  const translation = post.document?.translations[locale];
  const en = locale === "en";
  const title = translation?.title ?? (en ? post.titleEN || post.titleFA : post.titleFA);
  const excerpt = translation?.excerpt ?? (en ? post.excerptEN || post.excerptFA : post.excerptFA);
  const body = en ? post.bodyEN || post.bodyFA : post.bodyFA;
  const author = en ? post.authorEN || post.authorFA : post.authorFA;
  const category = en ? post.categoryEN || post.categoryFA : post.categoryFA;
  const plainText = translation ? blocksToText(translation.content) : body.replace(/<[^>]*>/g, " ");
  return {
    title, excerpt, body, author, category, translation, plainText,
    readMinutes: Math.max(1, Math.ceil(plainText.split(/\s+/u).filter(Boolean).length / 200)),
    image: post.document?.featuredImage?.src ?? post.image,
    imageAlt: localizeBlogText(post.document?.featuredImage?.alt, locale, title),
    path: blogPostPath(post, locale),
  };
}