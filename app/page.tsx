import { getServerDictionary } from "@/lib/i18n/server";
import HeroSlider from "@/components/home/HeroSlider";
import TrustStrip from "@/components/home/TrustStrip";
import AreasOfExpertise from "@/components/home/AreasOfExpertise";
import Features from "@/components/home/Features";
import Process from "@/components/home/Process";
import Equipment from "@/components/home/Equipment";
import Precision from "@/components/home/Precision";
import Credibility from "@/components/home/Credibility";
import FAQ from "@/components/FAQ";
import CTA from "@/components/home/CTA";
import Testimonials from "@/components/home/Testimonials";
import CertificationBand from "@/components/home/CertificationBand";
import ScanLineDivider from "@/components/ui/ScanLineDivider";
import SliceDivider from "@/components/ui/SliceDivider";
import HeroEntrance from "@/components/ui/HeroEntrance";
import AmbientFx from "@/components/ui/AmbientFx";
import MorphingBlob from "@/components/ui/MorphingBlob";
import NodeNetwork from "@/components/ui/NodeNetwork";
import JsonLdScript from "@/components/JsonLd";
import { faqSchema } from "@/lib/json-ld";

export const revalidate = 3600;

export default async function HomePage() {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  // FAQ content lives in the i18n dictionaries (lib/i18n/dictionaries/*)
  const faqItems = dict.home.faq;
  const faqJsonLd = faqSchema(faqItems);

  return (
    <div className="relative overflow-hidden bg-bg">
      <JsonLdScript data={faqJsonLd} />

      {/* Calm ambient background — two soft blobs, desktop-reduced blur.
          AmbientFx still swaps to a static glow on low-end / reduced-motion. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <AmbientFx
          fallback={
            <div className="absolute -left-32 top-[15%] h-[420px] w-[420px] rounded-full bg-primary/[0.05] blur-[100px]" />
          }
        >
          <MorphingBlob
            color="rgba(26, 115, 82, 0.07)"
            colorSecondary="rgba(76, 155, 122, 0.04)"
            size={400}
            blur={80}
            speed="slow"
            className="absolute -left-32 top-[15%]"
          />
          <MorphingBlob
            color="rgba(46, 125, 91, 0.05)"
            colorSecondary="rgba(26, 115, 82, 0.03)"
            size={420}
            blur={80}
            speed="medium"
            className="absolute -right-40 top-[40%]"
          />
        </AmbientFx>
      </div>

      {/* Modality strip — static wrapped pill list (RTL-aware, no motion) */}
      <div className="relative z-10 border-b border-border/80 bg-bg py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
            {dict.home.modalities.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition-colors duration-300 hover:border-primary/40 hover:text-primary"
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <HeroEntrance>
        <HeroSlider dict={dict} isFa={isFa} />
      </HeroEntrance>
      <TrustStrip isFa={isFa} />
      <AreasOfExpertise dict={dict} isFa={isFa} />
      <Features dict={dict} isFa={isFa} />
      {/* Below-the-fold sections skip offscreen rendering/painting until
          scrolled into view (content-visibility: auto) */}
      <div className="content-visibility">
        <Process isFa={isFa} />
        <Equipment isFa={isFa} />
        <Precision isFa={isFa} />
        <ScanLineDivider />
        <Testimonials isFa={isFa} />
        <Credibility isFa={isFa} />
        <SliceDivider label={isFa ? "برش ۰.۵ میلی‌متر" : "SLICE · 0.5 mm"} />
        <CertificationBand isFa={isFa} />
        <FAQ
          title={dict.home.faqTitle}
          subtitle={dict.home.faqSubtitle}
          items={faqItems}
        />
        <CTA dict={dict} />
      </div>

      {/* Quiet node network above the footer — desktop only, mobile gets
          a static hairline from the footer itself */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 hidden h-80 opacity-20 lg:block">
        <NodeNetwork nodeCount={12} width={1400} height={320} nodeRadius={2.5} />
      </div>
    </div>
  );
}
