import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ChapterHead from "@/components/ui/ChapterHead";
import { ArrowIcon } from "@/components/ui/icons";

interface CTAProps {
  dict: any;
}

/**
 * Closing chapter — an ink band with an oversized Fraunces prompt and two
 * ruled buttons. The dossier "end of file" call to action: forum first
 * (ask the community), contact second. No magnetic glow, no conic border.
 */
export default function CTA({ dict }: CTAProps) {
  return (
    <section className="band-dark section-pad">
      <div className="grain-pattern pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ChapterHead
          tone="dark"
          title={dict.home.ctaTitle}
          lede={dict.home.ctaSubtitle}
        />

        <Reveal delay={150}>
          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/forum"
              className="btn btn-primary group w-full sm:w-auto"
            >
              {dict.home.visitForum}
              <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline w-full border-[var(--color-rule-strong)] text-text-on-dark hover:border-highlight hover:text-highlight sm:w-auto"
            >
              {dict.home.contactUs}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}