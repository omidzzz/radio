import Reveal from "@/components/ui/Reveal";
import SpotLightCard from "@/components/ui/SpotLightCard";
import SectionHeader from "@/components/ui/SectionHeader";

interface FeaturesProps {
  dict: any;
  isFa: boolean;
}

const featureSvgs = {
  MRI: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Outer field rings */}
      <circle cx="40" cy="40" r="30" strokeOpacity="0.15" strokeDasharray="3 5" />
      <circle cx="40" cy="40" r="26" strokeOpacity="0.3" />
      {/* Main bore ring */}
      <circle cx="40" cy="40" r="20" strokeWidth="1.8" />
      {/* Inner bore depth */}
      <circle cx="40" cy="40" r="14" strokeOpacity="0.25" strokeDasharray="2 3" />
      <circle cx="40" cy="40" r="8" strokeOpacity="0.4" />
      {/* Patient cross-section silhouette */}
      <ellipse cx="40" cy="38" rx="6" ry="9" strokeOpacity="0.5" strokeWidth="1.2" />
      {/* Crosshair targeting */}
      <path d="M40 16v8M40 56v8M18 40h8M54 40h8" strokeOpacity="0.3" strokeWidth="1.2" />
      {/* Core highlight */}
      <circle cx="40" cy="40" r="2.5" fill="currentColor" stroke="none" />
      {/* Field strength indicator */}
      <text x="40" y="72" textAnchor="middle" fontSize="5" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" letterSpacing="0.5">3.0T</text>
    </svg>
  ),
  CT: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Gantry outer ring */}
      <circle cx="40" cy="40" r="26" strokeOpacity="0.2" strokeDasharray="4 6" />
      <circle cx="40" cy="40" r="23" strokeWidth="1.8" />
      {/* Aperture */}
      <circle cx="40" cy="40" r="14" strokeOpacity="0.35" />
      <circle cx="40" cy="40" r="9" strokeOpacity="0.5" strokeWidth="1.2" />
      {/* X-ray beam indicator */}
      <path d="M40 18v8M40 54v8M18 40h8M52 40h8" strokeOpacity="0.35" strokeWidth="1.2" />
      {/* Rotating detector arc */}
      <path d="M28 28a16 16 0 0 1 24 0" strokeOpacity="0.3" strokeLinecap="round" />
      <path d="M28 52a16 16 0 0 0 24 0" strokeOpacity="0.3" strokeLinecap="round" />
      {/* Core */}
      <circle cx="40" cy="40" r="3" fill="currentColor" stroke="none" />
      {/* Slice indicator */}
      <rect x="33" y="12" width="14" height="5" rx="1.5" strokeOpacity="0.4" strokeWidth="1" />
      <text x="40" y="72" textAnchor="middle" fontSize="5" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" letterSpacing="0.5">SLICE</text>
    </svg>
  ),
  US: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Transducer probe shape */}
      <path d="M28 18h24a4 4 0 0 1 4 4v6c0 8-4 14-8 18l-4 4a6 6 0 0 1-8 0l-4-4c-4-4-8-10-8-18v-6a4 4 0 0 1 4-4z" strokeLinejoin="round" />
      {/* Sound wave pulses */}
      <path d="M40 12v6" strokeOpacity="0.4" strokeWidth="1.2" />
      <path d="M36 8v4M44 8v4" strokeOpacity="0.25" strokeWidth="1" />
      {/* Ultrasound beam cone */}
      <path d="M34 32l-8 20M46 32l8 20" strokeOpacity="0.3" strokeLinecap="round" />
      {/* Image scan lines */}
      <path d="M30 42h20M32 48h16M34 54h12" strokeOpacity="0.25" strokeWidth="0.8" />
      {/* Doppler pulse */}
      <circle cx="40" cy="40" r="2" fill="currentColor" stroke="none" />
      <text x="40" y="72" textAnchor="middle" fontSize="5" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" letterSpacing="0.5">DOPPLER</text>
    </svg>
  ),
};

export default function Features({ dict, isFa }: FeaturesProps) {
  const features = [
    { code: "MRI", title: dict.home.feature1Title, desc: dict.home.feature1Desc },
    { code: "CT", title: dict.home.feature2Title, desc: dict.home.feature2Desc },
    { code: "US", title: dict.home.feature3Title, desc: dict.home.feature3Desc },
  ];

  return (
    <section className="content-visibility relative bg-bg section-pad">
      <div className="pointer-events-none absolute -left-10 top-20 hidden h-64 w-64 rounded-full border border-primary/20 lg:block" />
      <div className="pointer-events-none absolute -right-16 bottom-10 hidden h-48 w-48 rounded-full border border-secondary/20 lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl">
          <SectionHeader
            eyebrow={isFa ? "خدمات تصویربرداری" : "Imaging Services"}
            title={dict.home.featuresTitle}
            subtitle={
              isFa
                ? "ترکیبی از تخصص پزشکی و فناوری پیشرفته تصویربرداری"
                : "Precision medicine powered by cutting-edge imaging technology"
            }
          />
        </Reveal>

        <div className="relative mt-14 grid gap-6 sm:mt-16 md:grid-cols-3 md:gap-8">
          {features.map((feature, i) => (
            <Reveal key={feature.code} delay={i * 120}>
              <SpotLightCard className="h-full rounded-3xl">
                <div className="surface-card no-lift-touch group relative h-full overflow-hidden p-8">
                  <div className="dose-gradient absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 opacity-80 transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    MOD / {feature.code}
                  </div>

                  <div className="relative mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-soft text-primary shadow-inner transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                    {featureSvgs[feature.code as keyof typeof featureSvgs]}
                  </div>

                  <h3 className="relative mt-8 text-center text-xl font-semibold text-text-primary transition-colors duration-200 group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="relative mt-3 text-center leading-relaxed text-text-secondary">
                    {feature.desc}
                  </p>

                  <div className="relative mx-auto mt-6 h-px w-12 bg-border transition-all duration-200 group-hover:w-20 group-hover:bg-highlight" />
                </div>
              </SpotLightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}