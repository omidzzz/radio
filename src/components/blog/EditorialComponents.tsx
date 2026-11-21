import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { BlogPostSummary } from "@/lib/types/blog";

/* ─────────────────────────────────────────────
   MedicalCallout — restrained information box
   Variants: info | warning | danger | success
   ───────────────────────────────────────────── */
interface MedicalCalloutProps {
  tone?: "info" | "warning" | "danger" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const CALLOUT_BORDER: Record<string, string> = {
  info: "var(--color-primary)",
  warning: "var(--color-gold)",
  danger: "var(--color-danger)",
  success: "var(--color-positive)",
};

export function MedicalCallout({ tone = "info", title, children, className }: MedicalCalloutProps) {
  return (
    <aside
      className={[
        "article-callout",
        `article-callout-${tone}`,
        "p-5",
        className,
      ].filter(Boolean).join(" ")}
      style={{ borderInlineStartColor: CALLOUT_BORDER[tone] }}
    >
      {title && (
        <h3 className="article-callout-title flex items-center gap-2">
          {tone === "warning" && <span aria-hidden="true" className="h-4 w-4 shrink-0">⚠</span>}
          {tone === "danger" && <span aria-hidden="true" className="h-4 w-4 shrink-0">⚠</span>}
          {tone === "success" && <span aria-hidden="true" className="h-4 w-4 shrink-0">✓</span>}
          {tone === "info" && <span aria-hidden="true" className="h-4 w-4 shrink-0">ℹ</span>}
          {title}
        </h3>
      )}
      <div className="article-callout-body">{children}</div>
    </aside>
  );
}

/* ─────────────────────────────────────────────
   DefinitionCard — medical terminology explainer
   ───────────────────────────────────────────── */
interface DefinitionCardProps {
  term: string;
  definition: string;
}

export function DefinitionCard({ term, definition }: DefinitionCardProps) {
  return (
    <figure className="article-definition p-4 sm:p-5">
      <dt className="article-definition-term font-semibold text-primary">{term}</dt>
      <dd className="article-definition-definition mt-1 text-text-secondary leading-relaxed">{definition}</dd>
    </figure>
  );
}

/* ─────────────────────────────────────────────
   KeyTakeaways — compact summary of important points
   ───────────────────────────────────────────── */
interface KeyTakeawaysProps {
  title?: string;
  items: string[];
  className?: string;
}

export function KeyTakeaways({ title, items, className }: KeyTakeawaysProps) {
  return (
    <aside
      className={[
        "article-key-takeaways p-5 sm:p-6",
        className,
      ].filter(Boolean).join(" ")}
    >
      {title && <h3 className="article-key-takeaways-title mb-4">{title}</h3>}
      <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </aside>
  );
}

/* ─────────────────────────────────────────────
   ArticleFigure — responsive image + caption
   ───────────────────────────────────────────── */
interface ArticleFigureProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function ArticleFigure({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
  priority = false,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 92vw, 840px",
}: ArticleFigureProps) {
  return (
    <figure
      className={["article-figure", "mb-6", className].filter(Boolean).join(" ")}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        className="article-figure-image block h-auto"
        sizes={sizes}
      />
      {caption && <figcaption className="article-caption">{caption}</figcaption>}
    </figure>
  );
}

/* ─────────────────────────────────────────────
   ArticleQuote — editorial quotation
   ───────────────────────────────────────────── */
interface ArticleQuoteProps {
  text: string;
  attribution?: string;
  sourceUrl?: string;
}

export function ArticleQuote({ text, attribution, sourceUrl }: ArticleQuoteProps) {
  return (
    <figure className="article-quote relative my-8 pl-8 text-text-secondary leading-relaxed italic">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 text-gold/30 text-6xl leading-none select-none"
      >
        “
      </span>
      <blockquote className="mb-4 font-medium text-text-primary not-italic">{text}</blockquote>
      {attribution && (
        <figcaption className="article-quote-attribution text-sm text-text-tertiary not-italic">
          {sourceUrl ? (
            <Link href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              {attribution}
            </Link>
          ) : (
            attribution
          )}
        </figcaption>
      )}
    </figure>
  );
}

/* ─────────────────────────────────────────────
   AuthorProfile — physician information card
   ───────────────────────────────────────────── */
interface AuthorProfileProps {
  name: string;
  specialty?: string;
  credentials?: string;
  profileUrl?: string;
  isReviewer?: boolean;
  locale?: Locale;
}

export function AuthorProfile({
  name,
  specialty,
  credentials,
  profileUrl,
  isReviewer = false,
  locale = "fa",
}: AuthorProfileProps) {
  const fa = locale === "fa";
  const ProfileLink = profileUrl ? Link : "span";
  return (
    <div className="article-author-profile flex items-start gap-4">
      <div className="article-author-avatar shrink-0">
        <span className="h-10 w-10 rounded-full border border-border/60 bg-bg flex items-center justify-center font-semibold text-primary">
          {name.charAt(0)}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="article-author-name font-semibold text-primary">
            {profileUrl ? (
              <ProfileLink href={profileUrl} className="hover:text-primary transition-colors">
                {name}
              </ProfileLink>
            ) : (
              name
            )}
          </span>
          {isReviewer && (
            <span className="article-author-reviewer text-xs font-medium text-gold uppercase tracking-wider">
              {fa ? "مراجع" : "Reviewer"}
            </span>
          )}
        </div>
        {specialty && <p className="article-author-specialty mt-0.5 text-sm text-text-secondary">{specialty}</p>}
        {credentials && <p className="article-author-credentials mt-0.5 text-xs text-text-tertiary">{credentials}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ReferencesSection — scientific references list
   ───────────────────────────────────────────── */
interface ReferenceItem {
  title: string;
  url: string;
  publisher?: string;
}

interface ReferencesSectionProps {
  title?: string;
  items: ReferenceItem[];
  className?: string;
}

export function ReferencesSection({ title, items, className }: ReferencesSectionProps) {
  return (
    <section className={["article-references", className].filter(Boolean).join(" ")}>
      {title && <h3 className="article-references-title mb-4">{title}</h3>}
      <ol className="list-none p-0 counter-reset refs grid gap-3">
        {items.map((item) => (
          <li
            key={item.url}
            className="article-reference-item text-sm leading-relaxed"
            style={{ counterIncrement: "refs" }}
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="article-reference-link text-primary underline underline-offset-2 hover:no-underline transition-colors"
            >
              {item.title}
            </a>
            {item.publisher && (
              <span className="article-reference-publisher block mt-1 text-xs text-text-tertiary">
                — {item.publisher}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}


/* ─────────────────────────────────────────────
   FAQSection — accessible expandable FAQ
   ───────────────────────────────────────────── */
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQSection({ title, items, className }: FAQSectionProps) {
  return (
    <section className={["article-faq", className].filter(Boolean).join(" ")}>
      {title && <h2 className="article-faq-title mb-6">{title}</h2>}
      <div className="article-faq-list space-y-1">
        {items.map((item, i) => (
          <details key={i} className="article-faq-item border-b border-border/60 last:border-b-0">
            <summary className="article-faq-question flex justify-between items-center py-4 cursor-pointer list-none font-medium text-text-primary hover:text-primary transition-colors">
              {item.question}
              <span aria-hidden="true" className="shrink-0 text-gold transition-transform duration-200">+</span>
            </summary>
            <p className="article-faq-answer pb-4 text-text-secondary leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────
   ConsultationCTA — restrained contact invitation
   ───────────────────────────────────────────── */
interface ConsultationCTAProps {
  title?: string;
  text?: string;
  buttonText?: string;
  buttonHref?: string;
  phone?: string;
  locale?: Locale;
}

export function ConsultationCTA({
  title,
  text,
  buttonText,
  buttonHref,
  phone,
  locale = "fa",
}: ConsultationCTAProps) {
  const fa = locale === "fa";
  return (
    <section className="article-consultation-cta my-12 p-6 sm:p-8 text-start sm:text-start">
      <div className="mx-auto sm:mx-0 max-w-2xl">
        <h2 className="article-consultation-title mb-2 text-primary font-semibold">{title ?? (fa ? "مشاوره رزرو کنید" : "Book a consultation")}</h2>
        <p className="article-consultation-text mb-6 text-text-secondary leading-relaxed">
          {text ?? (fa ? "برای رزمر مشاوره یا دریافت اطلاعات بیشتر، با ما در ارتباط باشید." : "To book a consultation or request more information, get in touch.")}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3">
          {buttonText && buttonHref && (
            <a href={buttonHref} className="ui-button ui-button-primary px-5 py-2.5 text-sm font-medium whitespace-nowrap">{buttonText}</a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="ui-button ui-button-ghost px-5 py-2.5 text-sm font-medium whitespace-nowrap">{phone}</a>
          )}
        </div>
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────────
   RelatedArticles — refined card list
   ───────────────────────────────────────────── */
interface RelatedArticlesProps {
  posts: BlogPostSummary[];
  isFa: boolean;
  title?: string;
}

export function RelatedArticles({ posts, isFa, title }: RelatedArticlesProps) {
  if (posts.length === 0) return null;
  return (
    <section className="article-related">
      <h2 className="article-related-title mb-6">{title ?? (isFa ? "مقالات مرتبط" : "Related articles")}</h2>
      <div className="article-related-grid grid gap-4 sm:gap-6 md:grid-cols-2">
        {posts.map((post) => <RelatedArticleCard key={post.id} post={post} isFa={isFa} />)}
      </div>
    </section>
  );
}

function RelatedArticleCard({ post, isFa }: { post: BlogPostSummary; isFa: boolean }) {
  const title = isFa ? post.titleFA : post.titleEN || post.titleFA;
  const category = isFa ? post.categoryFA : post.categoryEN || post.categoryFA;
  const author = isFa ? post.authorFA : post.authorEN || post.authorFA;

  return (
    <Link href={`/${isFa ? "fa" : "en"}/blog/${post.slug || post.id}/`} className="block">
      <article className="article-related-card group">
        {post.image && (
          <div className="relative h-32 overflow-hidden">
            <Image
              src={post.image || "/images/blog-default.webp"}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 48vw"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4 pt-3">
          <span className="article-related-eyebrow text-xs font-semibold text-primary uppercase tracking-wider">
            {category}
          </span>
          <h3 className="article-related-title mt-1 mb-2 text-base font-semibold text-text-primary leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{author}</span>
            {post.publishedAt && (
              <>
                <span className="h-1 w-1 rounded-full bg-border-soft" />
                <span>{new Date(post.publishedAt).toLocaleDateString(isFa ? "fa-IR" : "en-US")}</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

