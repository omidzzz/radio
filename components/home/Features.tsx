import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import FeatureCard from "./FeatureCard";

export interface Feature {
  code: string;
  title: string;
  desc: string;
}

interface FeaturesProps {
  dict: any;
  isFa: boolean;
}

/**
 * Three features, each paired with a modality icon.
 *
 * Accent rotation (primary -> secondary -> gold) gives the row rhythmic
 * color without breaking the site's consistent theme palette.
 */
const accents = [0, 1, 2];

export default function Features({ dict, isFa }: FeaturesProps) {
  const features: Feature[] = [
    {
      code: "MRI",
      title: dict.home.feature1Title,
      desc: dict.home.feature1Desc,
    },
    {
      code: "CT",
      title: dict.home.feature2Title,
      desc: dict.home.feature2Desc,
    },
    {
      code: "US",
      title: dict.home.feature3Title,
      desc: dict.home.feature3Desc,
    },
  ];

  return (
    <section className="content-visibility relative bg-bg section-pad">
      {/* Decorative background — soft orbs + a vertical glow stem */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-px bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute right-0 top-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-24 top-24 h-40 w-40 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl">
          <SectionHeader
            eyebrow={isFa ? "مراقبت بیمارمحور" : "Patient-Centered Care"}
            title={dict.home.featuresTitle}
            subtitle={
              isFa
                ? "همراهی شما در هر گام درمان — فناوری پیشرفته در خدمت آرامش شما"
                : "Walking beside you at every step — advanced technology in service of your comfort"
            }
            goldRule
          />
        </Reveal>

        <div className="relative mt-12 grid gap-6 sm:mt-14 md:grid-cols-3 md:gap-7">
          {features.map((feature, i) => (
            <Reveal key={feature.code} delay={i * 140}>
              <FeatureCard
                feature={feature}
                accent={accents[i % accents.length] as 0 | 1 | 2}
                isFa={isFa}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
