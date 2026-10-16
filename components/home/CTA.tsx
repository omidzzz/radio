import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ChapterHead from "@/components/ui/ChapterHead";
import { ArrowIcon } from "@/components/ui/icons";

interface CTAProps {
  dict: any;
}

/**
 * Closing chapter — a terminal window on the ink ground: a blinking-prompt
 * header line, the oversized closing statement, and two squared console
 * keys (live key first, outline key second). Distinct from every other
 * section's panel/rule language — this one is "the command line".
 */
export default function CTA({ dict }: CTAProps) {
  return (
    <section className="mod-cta mod-frame-terminal band-dark section-pad">
      <div className="grain-pattern pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Terminal chrome strip */}
        <div className="mb-8 flex items-center justify-between border-b border-[var(--color-rule-strong)] pb-3">
          <span className="term-line readout__label text-highlight">
            radiotherapist@clinic:~$
          </span>
          <span className="readout__label text-muted">
            / end-of-session · CTRL+D
          </span>
        </div>

        <ChapterHead
          tone="dark"
          title={dict.home.ctaTitle}
          lede={dict.home.ctaSubtitle}
        />

        <Reveal delay={150}>
          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
            <Link href="/forum" className="key key--live group">
              {dict.home.visitForum}
              <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <Link href="/contact" className="key">
              {dict.home.contactUs}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}