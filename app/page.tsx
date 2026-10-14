import { getServerDictionary } from "@/lib/i18n/server";
import HeroSlider from "@/components/home/HeroSlider";
import TrustStrip from "@/components/home/TrustStrip";
import Features from "@/components/home/Features";
import Process from "@/components/home/Process";
import Equipment from "@/components/home/Equipment";
import Precision from "@/components/home/Precision";
import Credibility from "@/components/home/Credibility";
import FAQ from "@/components/FAQ";
import CTA from "@/components/home/CTA";
import Testimonials from "@/components/home/Testimonials";
import CertificationBand from "@/components/home/CertificationBand";
import Marquee from "@/components/ui/Marquee";
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
    <div className="relative">
      <JsonLdScript data={faqJsonLd} />

      {/* Modality ticker strip — ruled mono bar of imaging techniques */}
      <div className="relative z-10 border-b border-[var(--color-border)] bg-surface py-3">
        <Marquee
          items={dict.home.modalities}
          duration={38}
          itemClassName="mono text-xs font-medium uppercase tracking-[0.18em] text-text-secondary hover:text-primary transition-colors duration-200"
        />
      </div>

      <HeroSlider dict={dict} isFa={isFa} />
      <TrustStrip isFa={isFa} />
      <Features dict={dict} isFa={isFa} />
      {/* Below-the-fold sections skip offscreen rendering/painting until
          scrolled into view (content-visibility: auto) */}
      <div className="content-visibility">
        <Process isFa={isFa} />
        <Equipment isFa={isFa} />
        <Precision isFa={isFa} />
        <Testimonials isFa={isFa} />
        <Credibility isFa={isFa} />
        <CertificationBand isFa={isFa} />
        <FAQ
          title={dict.home.faqTitle}
          subtitle={dict.home.faqSubtitle}
          items={faqItems}
        />
        <CTA dict={dict} />
      </div>
    </div>
  );
}
