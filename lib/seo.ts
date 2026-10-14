// Central SEO & GEO configuration
// All site-wide SEO values live here for consistency.

export const siteConfig = {
  name: "کلینیک پرتودرمانی | Radiotherapy Clinic",
  shortName: "پرتودرمانی",
  // Page <title> strings per locale (used in metadata templates)
  title: {
    fa: "کلینیک پرتودرمانی | مراقبت تخصصی سرطان",
    en: "Radiotherapy Clinic | Specialized Cancer Care",
  },
  description: {
    fa: "خدمات حرفه‌ای پرتودرمانی و درمان سرطان. رزرو مشاوره، پرسش در انجمن گفتگو و آشنایی با گزینه‌های درمانی.",
    en: "Professional radiotherapy and cancer treatment services. Book a consultation, ask questions in our forum, and learn about treatment options.",
  },
  url: process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com",
  locale: "fa_IR",
  alternateLocale: "en_US",
  defaultOgImage: "/images/og-default.jpg",
  twitterHandle: "@radiotherapyclinic",
  phone: "+1 (234) 567-890",
  phoneHref: "tel:+1234567890",
  email: "info@radiotherapyclinic.com",
  mapsEmbedUrl: `https://www.google.com/maps?q=${35.6892},${51.389}&z=15&output=embed`,
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${35.6892},${51.389}`,
  address: {
    street: "123 Medical Center Blvd",
    city: "Tehran",
    country: "IR",
    postalCode: "12345",
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
    whatsapp: "https://wa.me/1234567890",
  },
  keywords: [
    "پرتودرمانی",
    "درمان سرطان",
    "رادیوتراپی",
    "کلینیک پرتودرمانی",
    "radiotherapy",
    "cancer treatment",
    "radiation therapy",
    "radiation oncology",
    "MRI",
    "CT scan",
  ],
} as const;

export type SiteConfig = typeof siteConfig;