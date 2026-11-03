// Central SEO & GEO configuration
// All site-wide SEO values live here for consistency.
// Identity data sourced from Dr. Ghadamgahi's visit card.

export const siteConfig = {
  name: "دکتر پری قدمگاهی ",
  shortName: "دکتر پری قدمگاهی",
  // Page <title> strings per locale (used in metadata templates)
  title: {
    fa: "دکتر پری قدمگاهی | متخصص رادیوتراپی و آنکولوژی",
    en: "Dr. Pari Ghadamgahi | Radiotherapy & Oncology Specialist",
  },
  description: {
    fa: "وب‌سایت دکتر پری قدمگاهی، متخصص رادیوتراپی و آنکولوژی — پرتودرمانی با تمرکز بر نوروانکولوژی و تومورهای سیستم عصبی مرکزی (CNS). رزرو مشاوره، پرسش در انجمن گفتگو و آشنایی با گزینه‌های درمانی.",
    en: "The website of Dr. Pari Ghadamgahi, specialist in radiotherapy and oncology — radiotherapy with a focus on neuro-oncology and tumours of the central nervous system (CNS). Book a consultation, ask questions in the forum, and learn about treatment options.",
  },
  url: process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com",
  locale: "fa_IR",
  alternateLocale: "en_US",
  defaultOgImage: "/images/og-default.jpg",
  twitterHandle: "@radiotherapyclinic",
  phone: "09125044953",
  phoneHref: "tel:09125044953",
  mobile: "09125044953",
  mobileHref: "tel:09125044953",
  email: "dr.pghadamgahi@gmail.com",
  mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(
    "Day Hospital, Valiasr Street, Tehran"
  )}&z=15&output=embed`,
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    "Day Hospital, Valiasr Street, Tehran"
  )}`,
  address: {
    street:
      "Valiasr St., opposite Day Hospital ER, Day Medical Tower, 10th Floor, Unit C",
    city: "Tehran",
    country: "IR",
    postalCode: "",
  },
  geo: {
    latitude: 35.6892,
    longitude: 51.389,
  },
  hours: [
    { day: "Saturday-Thursday", hours: "08:00-17:00" },
    { day: "Friday", hours: "Closed" },
  ],
  socials: {
    instagram: "https://instagram.com/radiotherapyclinic",
    linkedin: "https://linkedin.com/company/radiotherapyclinic",
    googleBusiness: "https://g.page/radiotherapyclinic",
    telegram: "https://t.me/radiotherapyclinic",
    whatsapp: "https://wa.me/989124599949",
  },
  keywords: [
    "دکتر پری قدمگاهی",
    "متخصص رادیوتراپی",
    "پرتودرمانی",
    "رادیوتراپی",
    "رادیوسرجری",
    "متخصص آنکولوژی",
    "درCTOR پری Fußgary",
    "radiotherapy",
    "radiation oncology",
    "radiosurgery",
    "cancer treatment",
    "brain tumor radiation",
    "head and neck cancer",
    "breast cancer radiotherapy",
    "prostate cancer radiation",
  ],
} as const;


/**
 * Per-path hreflang alternates following the middleware's path-based
 * locale routing (Persian /en prefix). Used by the sitemap and page
 * metadata so every language version self-lists its counterpart.
 */
export function localizedAlternates(path: string) {
  const faUrl = `${siteConfig.url}/fa${path === "/" ? "" : path}`;
  const enUrl = `${siteConfig.url}/en${path === "/" ? "" : path}`;
  return {
    canonical: faUrl,
    languages: {
      "fa-IR": faUrl,
      "en-US": enUrl,
      "x-default": faUrl,
    },
  };
}
export type SiteConfig = typeof siteConfig;