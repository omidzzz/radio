import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import SectionHeader from "@/components/ui/SectionHeader";

interface CTAProps {
  dict: any;
}

export default function CTA({ dict }: CTAProps) {
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
              href="/forum"
              strength={0.2}
              className="conic-border rounded-full"
            >
              <span className="btn-sheen group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-9 py-4 text-base font-semibold text-deep shadow-[0_0_35px_-8px_rgba(6,182,212,0.65)] transition-colors duration-200 hover:bg-primary-hover active:scale-[0.97]">
                <span className="relative">{dict.home.visitForum}</span>
              </span>
            </MagneticButton>
            <MagneticButton
              as={Link}
              href="/contact"
              strength={0.2}
              className="inline-block"
            >
              <span className="group inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-9 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:border-primary/50 hover:bg-white/10 active:scale-[0.97]">
                {dict.home.contactUs}
              </span>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}