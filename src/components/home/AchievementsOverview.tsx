import Reveal from "@/components/ui/Reveal";

interface AchievementsOverviewProps {
  isFa: boolean;
}

export default function AchievementsOverview({ isFa }: AchievementsOverviewProps) {
  const highlights = isFa
    ? [
        {
          label: "تمرکز بالینی",
          text: "نوروانکولوژی و تومورهای سیستم عصبی مرکزی",
        },
        {
          label: "تحصیلات تخصصی",
          text: "پزشکی دانشگاه علوم پزشکی تهران؛ تخصص از دانشگاه علوم پزشکی اهواز",
        },
        {
          label: "پژوهش و آموزش",
          text: "سه مقاله منتشرشده و برگزاری جلسات آموزشی تخصصی",
        },
        {
          label: "پرتودرمانی پیشرفته",
          text: "IMRT، VMAT، SBRT، FSRT، SRS، کانتورینگ و طراحی پلن درمان",
        },
      ]
    : [
        {
          label: "Clinical focus",
          text: "Neuro-oncology and central nervous system tumours",
        },
        {
          label: "Medical education",
          text: "Medicine at Tehran University; specialty training at Ahvaz University",
        },
        {
          label: "Research & teaching",
          text: "Three published articles and specialist teaching sessions",
        },
        {
          label: "Advanced radiotherapy",
          text: "IMRT, VMAT, SBRT, FSRT, SRS, contouring and treatment planning",
        },
      ];

  return (
    <section
      dir={isFa ? "rtl" : "ltr"}
      className="content-visibility relative overflow-hidden bg-soft section-pad"
      aria-labelledby="achievements-title"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:px-8">
        <Reveal>
          <div>
            <p className="text-xs font-semibold text-primary">
              {isFa ? "سوابق حرفه‌ای" : "Professional profile"}
            </p>
            <h2
              id="achievements-title"
              className="mt-3 text-2xl font-bold leading-tight text-text-primary sm:text-3xl"
            >
              {isFa ? "دانش تخصصی، مراقبت دقیق" : "Specialist knowledge, precise care"}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-text-secondary">
              {isFa
                ? "خلاصه‌ای از مسیر علمی و تجربه بالینی دکتر پری قدمگاهی"
                : "A brief overview of Dr. Pari Ghadamgahi's academic and clinical background."}
            </p>
            <div className="mt-6 border-r-2 border-primary pr-4 ltr:border-r-0 ltr:border-l-2 ltr:pr-0 ltr:pl-4">
              <p className="text-lg font-bold text-highlight sm:text-xl">
                {isFa ? "دارای بورد تخصصی" : "Board-certified specialist"}
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {isFa ? "رادیوتراپی و آنکولوژی" : "Radiotherapy and oncology"}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-x-8 sm:grid-cols-2">
          {highlights.map((item, index) => (
            <Reveal key={item.label} delay={index * 100}>
              <div className="h-full border-t border-border py-5">
                <h3 className="text-sm font-bold text-text-primary">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}