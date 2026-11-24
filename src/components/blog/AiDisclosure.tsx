import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/* ─────────────────────────────────────────────
   AiDisclosure — concise bilingual note that AI
   assisted the research and edit of an article.
   ───────────────────────────────────────────── */
interface AiDisclosureProps {
  locale: Locale;
  className?: string;
}

export default function AiDisclosure({ locale, className }: AiDisclosureProps) {
  const dict = getDictionary(locale);
  return (
    <p className={["ai-disclosure", className].filter(Boolean).join(" ")}>
      <span aria-hidden="true" className="shrink-0">
        ✨
      </span>
      {dict.article.aiDisclosure}
    </p>
  );
}
