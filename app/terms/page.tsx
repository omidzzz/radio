import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/i18n/server";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Ø´Ø±Ø§ÛŒØ· Ø§Ø³ØªÙØ§Ø¯Ù‡",
  description:
    "Ø´Ø±Ø§ÛŒØ· Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ: Ù‚ÙˆØ§Ù†ÛŒÙ† Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ø®Ø¯Ù…Ø§ØªØŒ Ù…Ø­ØªÙˆØ§ Ùˆ Ù…Ø³Ø¦ÙˆÙ„ÛŒØªâ€ŒÙ‡Ø§.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default async function TermsPage() {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  const breadcrumbs = breadcrumbSchema([
    { name: "Ø®Ø§Ù†Ù‡", path: "/" },
    { name: "Ø´Ø±Ø§ÛŒØ· Ø§Ø³ØªÙØ§Ø¯Ù‡", path: "/terms" },
  ]);

  const sections = isFa
    ? [
        {
          title: "Ù¾Ø°ÛŒØ±Ø´ Ø´Ø±Ø§ÛŒØ·",
          content:
            "Ø¨Ø§ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒØŒ Ø´Ù…Ø§ Ù…ÙˆØ§ÙÙ‚Øª Ø®ÙˆØ¯ Ø±Ø§ Ø¨Ø§ Ø§ÛŒÙ† Ø´Ø±Ø§ÛŒØ· Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø¹Ù„Ø§Ù… Ù…ÛŒâ€ŒÚ©Ù†ÛŒØ¯. Ø§Ú¯Ø± Ø¨Ø§ Ù‡Ø± ÛŒÚ© Ø§Ø² Ø§ÛŒÙ† Ø´Ø±Ø§ÛŒØ· Ù…ÙˆØ§ÙÙ‚ Ù†ÛŒØ³ØªÛŒØ¯ØŒ Ù„Ø·ÙØ§Ù‹ Ø§Ø² ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù†Ú©Ù†ÛŒØ¯.",
        },
        {
          title: "Ù…Ø­ØªÙˆØ§ Ùˆ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù¾Ø²Ø´Ú©ÛŒ",
          content:
            "Ù…Ø­ØªÙˆÛŒØ§Øª Ø§ÛŒÙ† ÙˆØ¨â€ŒØ³Ø§ÛŒØª ØµØ±ÙØ§Ù‹ Ø¨Ø±Ø§ÛŒ Ø§Ø·Ù„Ø§Ø¹â€ŒØ±Ø³Ø§Ù†ÛŒ Ø¹Ù…ÙˆÙ…ÛŒ Ø§Ø³Øª Ùˆ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…Ø´Ø§ÙˆØ±Ù‡ØŒ ØªØ´Ø®ÛŒØµ ÛŒØ§ Ø¯Ø±Ù…Ø§Ù† Ù¾Ø²Ø´Ú©ÛŒ Ø­Ø±ÙÙ‡â€ŒØ§ÛŒ Ù†ÛŒØ³Øª. Ù‡Ù…ÛŒØ´Ù‡ Ø¨Ø±Ø§ÛŒ Ù…Ø³Ø§Ø¦Ù„ Ù¾Ø²Ø´Ú©ÛŒ Ø¨Ø§ Ù¾Ø²Ø´Ú© ÛŒØ§ Ù…ØªØ®ØµØµ Ù…Ø±Ø§Ù‚Ø¨Øªâ€ŒÙ‡Ø§ÛŒ Ø¨Ù‡Ø¯Ø§Ø´ØªÛŒ Ø®ÙˆØ¯ Ù…Ø´ÙˆØ±Øª Ú©Ù†ÛŒØ¯.",
        },
        {
          title: "Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ø®Ø¯Ù…Ø§Øª",
          content:
            "Ø´Ù…Ø§ Ù…ÙˆØ§ÙÙ‚Øª Ù…ÛŒâ€ŒÚ©Ù†ÛŒØ¯ Ú©Ù‡ Ø§Ø² Ø®Ø¯Ù…Ø§Øª ÙˆØ¨â€ŒØ³Ø§ÛŒØª ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ù…Ù‚Ø§ØµØ¯ Ù‚Ø§Ù†ÙˆÙ†ÛŒ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ù†ÛŒØ¯ Ùˆ Ø§Ø² Ù‡Ø±Ú¯ÙˆÙ†Ù‡ Ø³ÙˆØ¡Ø§Ø³ØªÙØ§Ø¯Ù‡ØŒ Ø§Ø±Ø³Ø§Ù„ Ù…Ø­ØªÙˆØ§ÛŒ Ù†Ø§Ù…Ù†Ø§Ø³Ø¨ ÛŒØ§ Ù†Ù‚Ø¶ Ø­Ù‚ÙˆÙ‚ Ø¯ÛŒÚ¯Ø±Ø§Ù† Ø®ÙˆØ¯Ø¯Ø§Ø±ÛŒ Ú©Ù†ÛŒØ¯.",
        },
        {
          title: "Ø§Ù†Ø¬Ù…Ù† Ú¯ÙØªÚ¯Ùˆ",
          content:
            "Ù…Ø·Ø§Ù„Ø¨ Ø§Ø±Ø³Ø§Ù„â€ŒØ´Ø¯Ù‡ Ø¯Ø± Ø§Ù†Ø¬Ù…Ù† Ú¯ÙØªÚ¯Ùˆ Ù†Ø¸Ø±Ø§Øª Ø´Ø®ØµÛŒ Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø§Ø³Øª Ùˆ Ù„Ø²ÙˆÙ…Ø§Ù‹ Ù…Ù†Ø¹Ú©Ø³â€ŒÚ©Ù†Ù†Ø¯Ù‡ Ù†Ø¸Ø±Ø§Øª Ú©Ù„ÛŒÙ†ÛŒÚ© Ù†ÛŒØ³Øª. Ú©Ù„ÛŒÙ†ÛŒÚ© Ø­Ù‚ Ø­Ø°Ù Ù…Ø­ØªÙˆØ§ÛŒ Ù†Ø§Ù…Ù†Ø§Ø³Ø¨ Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ø®ÙˆØ¯ Ù…Ø­ÙÙˆØ¸ Ù…ÛŒâ€ŒØ¯Ø§Ø±Ø¯.",
        },
        {
          title: "Ø±Ø²Ø±Ùˆ Ù†ÙˆØ¨Øª",
          content:
            "Ø±Ø²Ø±Ùˆ Ù†ÙˆØ¨Øª Ø§Ø² Ø·Ø±ÛŒÙ‚ ÙˆØ¨â€ŒØ³Ø§ÛŒØª ÛŒÚ© Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§ÙˆÙ„ÛŒÙ‡ Ø§Ø³Øª Ùˆ Ù¾Ø³ Ø§Ø² ØªØ£ÛŒÛŒØ¯ ØªÙˆØ³Ø· ØªÛŒÙ… Ù…Ø§ Ù‚Ø·Ø¹ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù„Ø·ÙØ§Ù‹ Ø¯Ø± ØµÙˆØ±Øª Ø¹Ø¯Ù… Ø§Ù…Ú©Ø§Ù† Ø­Ø¶ÙˆØ±ØŒ Ù†ÙˆØ¨Øª Ø®ÙˆØ¯ Ø±Ø§ Ù„ØºÙˆ Ú©Ù†ÛŒØ¯.",
        },
        {
          title: "Ù…Ø§Ù„Ú©ÛŒØª Ù…Ø¹Ù†ÙˆÛŒ",
          content:
            "ØªÙ…Ø§Ù… Ù…Ø­ØªÙˆØ§ØŒ Ø·Ø±Ø§Ø­ÛŒØŒ Ù„ÙˆÚ¯Ùˆ Ùˆ ØªØµØ§ÙˆÛŒØ± Ø§ÛŒÙ† ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ù…ØªØ¹Ù„Ù‚ Ø¨Ù‡ Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ Ø§Ø³Øª Ùˆ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ø¢Ù†â€ŒÙ‡Ø§ Ø¨Ø¯ÙˆÙ† Ø§Ø¬Ø§Ø²Ù‡ Ú©ØªØ¨ÛŒ Ù…Ù…Ù†ÙˆØ¹ Ø§Ø³Øª.",
        },
        {
          title: "Ù…Ø­Ø¯ÙˆØ¯ÛŒØª Ù…Ø³Ø¦ÙˆÙ„ÛŒØª",
          content:
            "Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ Ø¯Ø± Ù‚Ø¨Ø§Ù„ Ø®Ø³Ø§Ø±Ø§Øª Ù…Ø³ØªÙ‚ÛŒÙ… ÛŒØ§ ØºÛŒØ±Ù…Ø³ØªÙ‚ÛŒÙ… Ù†Ø§Ø´ÛŒ Ø§Ø² Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ø§ÛŒÙ† ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ù…Ø³Ø¦ÙˆÙ„ÛŒØªÛŒ Ù†Ø¯Ø§Ø±Ø¯. Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø§Ø±Ø§Ø¦Ù‡â€ŒØ´Ø¯Ù‡ Ù…Ù…Ú©Ù† Ø§Ø³Øª Ø¨Ø¯ÙˆÙ† Ø§Ø·Ù„Ø§Ø¹ Ù‚Ø¨Ù„ÛŒ ØªØºÛŒÛŒØ± Ú©Ù†Ø¯.",
        },
        {
          title: "Ù‚ÙˆØ§Ù†ÛŒÙ† Ø­Ø§Ú©Ù…",
          content:
            "Ø§ÛŒÙ† Ø´Ø±Ø§ÛŒØ· ØªØ­Øª Ù‚ÙˆØ§Ù†ÛŒÙ† Ø¬Ù…Ù‡ÙˆØ±ÛŒ Ø§Ø³Ù„Ø§Ù…ÛŒ Ø§ÛŒØ±Ø§Ù† ØªÙØ³ÛŒØ± Ùˆ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù‡Ø±Ú¯ÙˆÙ†Ù‡ Ø§Ø®ØªÙ„Ø§Ù Ø¯Ø± Ø¯Ø§Ø¯Ú¯Ø§Ù‡â€ŒÙ‡Ø§ÛŒ ØµØ§Ù„Ø­ ØªÙ‡Ø±Ø§Ù† Ø±Ø³ÛŒØ¯Ú¯ÛŒ Ø®ÙˆØ§Ù‡Ø¯ Ø´Ø¯.",
        },
      ]
    : [
        {
          title: "Acceptance of Terms",
          content:
            "By using the Radiotherapy Clinic website, you agree to these terms of use. If you do not agree with any of these terms, please do not use the website.",
        },
        {
          title: "Medical Content and Information",
          content:
            "The content on this website is for general information purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified health provider with any questions you may have regarding a medical condition.",
        },
        {
          title: "Use of Services",
          content:
            "You agree to use the website services only for lawful purposes and to refrain from any misuse, posting inappropriate content, or violating the rights of others.",
        },
        {
          title: "Community Forum",
          content:
            "Content posted in the community forum reflects the personal opinions of users and does not necessarily represent the views of the clinic. The clinic reserves the right to remove inappropriate content.",
        },
        {
          title: "Appointment Booking",
          content:
            "Booking an appointment through the website is an initial request and becomes confirmed only after approval by our team. Please cancel your appointment if you are unable to attend.",
        },
        {
          title: "Intellectual Property",
          content:
            "All content, design, logos, and images on this website belong to the Radiotherapy Clinic and may not be used without written permission.",
        },
        {
          title: "Limitation of Liability",
          content:
            "The Radiotherapy Clinic is not liable for direct or indirect damages arising from the use of this website. Information provided may change without prior notice.",
        },
        {
          title: "Governing Law",
          content:
            "These terms are governed by and interpreted in accordance with the laws of the Islamic Republic of Iran. Any disputes will be resolved in the competent courts of Tehran.",
        },
      ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
      </div>

      <PageHero
        badge={isFa ? "Ø´Ø±Ø§ÛŒØ· Ø§Ø³ØªÙØ§Ø¯Ù‡" : "Terms of Use"}
        title={isFa ? "Ø´Ø±Ø§ÛŒØ· Ø§Ø³ØªÙØ§Ø¯Ù‡" : "Terms of Use"}
        subtitle={
          isFa
            ? "Ù‚ÙˆØ§Ù†ÛŒÙ† Ùˆ Ù…Ù‚Ø±Ø±Ø§Øª Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² ÙˆØ¨â€ŒØ³Ø§ÛŒØª"
            : "Rules and regulations for using the website"
        }
      />

      <section className="relative z-10 overflow-hidden py-20 lg:py-24">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="rounded-[1.6rem] border border-border/60 bg-surface p-7 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-sm font-bold text-primary ring-1 ring-primary/15">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {section.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-muted">
            {isFa
              ? `Ø¢Ø®Ø±ÛŒÙ† Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ: ${new Date().toLocaleDateString("fa-IR")}`
              : `Last updated: ${new Date().toLocaleDateString("en-US")}`}
          </p>
        </div>
      </section>
    </div>
  );
}