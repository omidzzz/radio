"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsProps {
  isFa: boolean;
}

const testimonialsFa: Testimonial[] = [
  {
    quote:
      "تیم درمان با دقت و مهربانی فوق‌العاده‌ای همراه من بودند. هر جلسه پرتودرمانی کاملاً برنامه‌ریزی‌شده و بدون استرس بود.",
    name: "مریم احمدی",
    role: "بیمار تحت درمان",
  },
  {
    quote:
      "از رزرو آنلاین تا دریافت گزارش، همه‌چیز سریع و شفاف بود. پزشکم نتیجه را در کمتر از ۲۴ ساعت دریافت کرد.",
    name: "رضا کریمی",
    role: "همراه بیمار",
  },
  {
    quote:
      "دستگاه‌های پیشرفته و تیم مجرب باعث شد با اطمینان کامل درمانم را ادامه دهم. واقعاً از کلینیک سپاسگزارم.",
    name: "سارا محمدی",
    role: "بیمار تحت درمان",
  },
];

const testimonialsEn: Testimonial[] = [
  {
    quote:
      "The treatment team supported me with incredible precision and kindness. Every radiation session was well-planned and stress-free.",
    name: "Maryam Ahmadi",
    role: "Patient in Treatment",
  },
  {
    quote:
      "From online booking to receiving the report, everything was fast and transparent. My doctor had results within 24 hours.",
    name: "Reza Karimi",
    role: "Patient Companion",
  },
  {
    quote:
      "Advanced equipment and an experienced team gave me full confidence to continue my treatment. Truly grateful to the clinic.",
    name: "Sara Mohammadi",
    role: "Patient in Treatment",
  },
];

export default function Testimonials({ isFa }: TestimonialsProps) {
  const items = isFa ? testimonialsFa : testimonialsEn;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <section className="content-visibility band-dark section-pad">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            tone="dark"
            eyebrow={isFa ? "نظرات بیماران" : "Patient Stories"}
            title={isFa ? "تجربه بیماران ما" : "What Our Patients Say"}
          />
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mt-14">
            {/* Quote mark */}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 text-7xl font-black text-primary/20 select-none">
              &ldquo;
            </div>

            {/* Crossfading slides */}
            <div className="relative min-h-[220px] sm:min-h-[190px]">
              {items.map((t, i) => (
                <figure
                  key={t.name}
                  className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700 ${
                    i === active
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                  aria-hidden={i !== active}
                >
                  <blockquote className="max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6">
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="mt-1 text-sm text-muted">{t.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* 44px dots for touch */}
            <div className="mt-10 flex items-center justify-center gap-1">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className="flex h-11 w-11 items-center justify-center"
                  aria-label={`Testimonial ${i + 1}`}
                  aria-current={i === active}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-8 bg-primary-fill"
                        : "w-2.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}