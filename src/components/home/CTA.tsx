import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionHeader from "@/components/ui/SectionHeader";

interface CTAProps {
  dict: any;
  isFa: boolean;
}

export default function CTA({ dict, isFa }: CTAProps) {
  const locale = isFa ? "fa" : "en";
  return (
    <section className="band-dark">
      <div className="section-pad relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader tone="dark" title={dict.home.ctaTitle} subtitle={dict.home.ctaSubtitle} />
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <MagneticButton
              as={Link}
              href={`/${locale}/forum`}
              prefetch={false}
              strength={0.2}
              variant="primary"
              className="conic-border"
            >
              <span className="btn-sheen relative inline-flex items-center justify-center overflow-hidden px-9 py-4 text-base">
                <span className="relative">{dict.home.visitForum}</span>
              </span>
            </MagneticButton>
            <MagneticButton
              as={Link}
              href={`/${locale}/contact`}
              prefetch={false}
              strength={0.2}
              variant="ghost"
              className="ui-button-on-dark"
            >
              <span className="inline-flex items-center justify-center px-9 py-4 text-base">
                {dict.home.contactUs}
              </span>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}