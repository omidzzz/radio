import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Ø­Ø±ÛŒÙ… Ø®ØµÙˆØµÛŒ",
  description:
    "Ø³ÛŒØ§Ø³Øª Ø­ÙØ¸ Ø­Ø±ÛŒÙ… Ø®ØµÙˆØµÛŒ Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ: Ù†Ø­ÙˆÙ‡ Ø¬Ù…Ø¹â€ŒØ¢ÙˆØ±ÛŒØŒ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ùˆ Ù…Ø­Ø§ÙØ¸Øª Ø§Ø² Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ø®ØµÛŒ Ø´Ù…Ø§.",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default async function PrivacyPage() {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  const breadcrumbs = breadcrumbSchema([
    { name: "Ø®Ø§Ù†Ù‡", path: "/" },
    { name: "Ø­Ø±ÛŒÙ… Ø®ØµÙˆØµÛŒ", path: "/privacy" },
  ]);

  const sections = isFa
    ? [
        {
          title: "Ø¬Ù…Ø¹â€ŒØ¢ÙˆØ±ÛŒ Ø§Ø·Ù„Ø§Ø¹Ø§Øª",
          content:
            "Ù…Ø§ Ø§Ø·Ù„Ø§Ø¹Ø§ØªÛŒ Ø±Ø§ Ú©Ù‡ Ø´Ù…Ø§ Ø¨Ù‡ ØµÙˆØ±Øª Ø¯Ø§ÙˆØ·Ù„Ø¨Ø§Ù†Ù‡ Ø§Ø² Ø·Ø±ÛŒÙ‚ ÙØ±Ù…â€ŒÙ‡Ø§ÛŒ Ø±Ø²Ø±Ùˆ Ù†ÙˆØ¨ØªØŒ ØªÙ…Ø§Ø³ØŒ Ø§Ù†Ø¬Ù…Ù† Ú¯ÙØªÚ¯Ùˆ Ùˆ Ù†Ø¸Ø±Ø§Øª ÙˆØ¨Ù„Ø§Ú¯ Ø§Ø±Ø§Ø¦Ù‡ Ù…ÛŒâ€ŒØ¯Ù‡ÛŒØ¯ Ø¬Ù…Ø¹â€ŒØ¢ÙˆØ±ÛŒ Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ…. Ø§ÛŒÙ† Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ø§Ù…Ù„ Ù†Ø§Ù…ØŒ Ø´Ù…Ø§Ø±Ù‡ ØªÙ„ÙÙ†ØŒ Ø§ÛŒÙ…ÛŒÙ„ Ùˆ Ù…Ø­ØªÙˆØ§ÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ Ø´Ù…Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯.",
        },
        {
          title: "Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ø§Ø·Ù„Ø§Ø¹Ø§Øª",
          content:
            "Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ù…Ø§ ØµØ±ÙØ§Ù‹ Ø¨Ø±Ø§ÛŒ Ù¾Ø§Ø³Ø®Ú¯ÙˆÛŒÛŒ Ø¨Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ Ø´Ù…Ø§ØŒ Ù…Ø¯ÛŒØ±ÛŒØª Ù†ÙˆØ¨Øªâ€ŒÙ‡Ø§ØŒ Ø¨Ù‡Ø¨ÙˆØ¯ Ø®Ø¯Ù…Ø§Øª Ùˆ Ø§Ø±Ø³Ø§Ù„ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù…Ø±ØªØ¨Ø· Ø¨Ø§ Ø¯Ø±Ù…Ø§Ù† Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù…Ø§ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ù…Ø§ Ø±Ø§ Ø¨Ù‡ Ù‡ÛŒÚ† Ø´Ø®Øµ Ø«Ø§Ù„Ø«ÛŒ Ø¨Ø¯ÙˆÙ† Ø±Ø¶Ø§ÛŒØª Ø´Ù…Ø§ Ù†Ù…ÛŒâ€ŒÙØ±ÙˆØ´ÛŒÙ… ÛŒØ§ Ø§Ø¬Ø§Ø±Ù‡ Ù†Ù…ÛŒâ€ŒØ¯Ù‡ÛŒÙ….",
        },
        {
          title: "Ù…Ø­Ø§ÙØ¸Øª Ø§Ø² Ø§Ø·Ù„Ø§Ø¹Ø§Øª",
          content:
            "Ù…Ø§ Ø§Ø² Ù¾Ø±ÙˆØªÚ©Ù„â€ŒÙ‡Ø§ÛŒ Ø§Ù…Ù†ÛŒØªÛŒ Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯ ØµÙ†Ø¹ØªÛŒ Ø¨Ø±Ø§ÛŒ Ù…Ø­Ø§ÙØ¸Øª Ø§Ø² Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ù…Ø§ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ…. ØªÙ…Ø§Ù… Ø§Ø±ØªØ¨Ø§Ø·Ø§Øª Ø¨Ø§ ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ø§Ø² Ø·Ø±ÛŒÙ‚ HTTPS Ø±Ù…Ø²Ù†Ú¯Ø§Ø±ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ Ø¯Ø³ØªØ±Ø³ÛŒ Ø¨Ù‡ Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ Ø­Ø³Ø§Ø³ Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ù‡ Ù¾Ø±Ø³Ù†Ù„ Ù…Ø¬Ø§Ø² Ø§Ø³Øª.",
        },
        {
          title: "Ú©ÙˆÚ©ÛŒâ€ŒÙ‡Ø§",
          content:
            "ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ù…Ø§ Ø§Ø² Ú©ÙˆÚ©ÛŒâ€ŒÙ‡Ø§ Ø¨Ø±Ø§ÛŒ Ø¨Ù‡Ø¨ÙˆØ¯ ØªØ¬Ø±Ø¨Ù‡ Ú©Ø§Ø±Ø¨Ø±ÛŒØŒ Ø°Ø®ÛŒØ±Ù‡ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø²Ø¨Ø§Ù† Ùˆ ØªØ­Ù„ÛŒÙ„ ØªØ±Ø§ÙÛŒÚ© Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ø´Ù…Ø§ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ú©ÙˆÚ©ÛŒâ€ŒÙ‡Ø§ Ø±Ø§ Ø§Ø² Ø·Ø±ÛŒÙ‚ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ù…Ø±ÙˆØ±Ú¯Ø± Ø®ÙˆØ¯ Ù…Ø¯ÛŒØ±ÛŒØª ÛŒØ§ Ø­Ø°Ù Ú©Ù†ÛŒØ¯.",
        },
        {
          title: "Ø­Ù‚ÙˆÙ‚ Ø´Ù…Ø§",
          content:
            "Ø´Ù…Ø§ Ø­Ù‚ Ø¯Ø§Ø±ÛŒØ¯ Ø¯Ø± Ù‡Ø± Ø²Ù…Ø§Ù† Ø¨Ù‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ø®ØµÛŒ Ø®ÙˆØ¯ Ø¯Ø³ØªØ±Ø³ÛŒ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´ÛŒØ¯ØŒ Ø¢Ù†â€ŒÙ‡Ø§ Ø±Ø§ ØªØµØ­ÛŒØ­ ÛŒØ§ Ø­Ø°Ù Ú©Ù†ÛŒØ¯. Ø¨Ø±Ø§ÛŒ Ø§Ø¹Ù…Ø§Ù„ Ø§ÛŒÙ† Ø­Ù‚ÙˆÙ‚ØŒ Ù„Ø·ÙØ§Ù‹ Ø¨Ø§ Ù…Ø§ Ø§Ø² Ø·Ø±ÛŒÙ‚ ØµÙØ­Ù‡ ØªÙ…Ø§Ø³ Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø±Ù‚Ø±Ø§Ø± Ú©Ù†ÛŒØ¯.",
        },
        {
          title: "ØªØºÛŒÛŒØ±Ø§Øª Ø¯Ø± Ø³ÛŒØ§Ø³Øª Ø­Ø±ÛŒÙ… Ø®ØµÙˆØµÛŒ",
          content:
            "Ù…Ø§ Ù…Ù…Ú©Ù† Ø§Ø³Øª Ø§ÛŒÙ† Ø³ÛŒØ§Ø³Øª Ø±Ø§ Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ú©Ù†ÛŒÙ…. ØªØºÛŒÛŒØ±Ø§Øª Ù…Ù‡Ù… Ø¯Ø± Ø§ÛŒÙ† ØµÙØ­Ù‡ Ø§Ø¹Ù„Ø§Ù… Ø®ÙˆØ§Ù‡Ø¯ Ø´Ø¯. Ø§Ø¯Ø§Ù…Ù‡ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ù¾Ø³ Ø§Ø² ØªØºÛŒÛŒØ±Ø§Øª Ø¨Ù‡ Ù…Ø¹Ù†Ø§ÛŒ Ù¾Ø°ÛŒØ±Ø´ Ø³ÛŒØ§Ø³Øª Ø¬Ø¯ÛŒØ¯ Ø§Ø³Øª.",
        },
      ]
    : [
        {
          title: "Information Collection",
          content:
            "We collect information you voluntarily provide through our booking forms, contact forms, community forum, and blog comments. This includes your name, phone number, email address, and message content.",
        },
        {
          title: "Use of Information",
          content:
            "Your information is used solely to respond to your requests, manage appointments, improve our services, and send treatment-related information. We never sell or rent your information to third parties without your consent.",
        },
        {
          title: "Data Protection",
          content:
            "We use industry-standard security protocols to protect your information. All communications with the website are encrypted via HTTPS, and access to sensitive data is restricted to authorized personnel.",
        },
        {
          title: "Cookies",
          content:
            "Our website uses cookies to improve user experience, store language preferences, and analyze traffic. You can manage or delete cookies through your browser settings.",
        },
        {
          title: "Your Rights",
          content:
            "You have the right to access, correct, or delete your personal information at any time. To exercise these rights, please contact us through our contact page.",
        },
        {
          title: "Changes to This Policy",
          content:
            "We may update this policy from time to time. Significant changes will be announced on this page. Continued use of the website after changes constitutes acceptance of the new policy.",
        },
      ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />


      <PageHero
        badge={isFa ? "Ø­Ø±ÛŒÙ… Ø®ØµÙˆØµÛŒ" : "Privacy Policy"}
        title={isFa ? "Ø­Ø±ÛŒÙ… Ø®ØµÙˆØµÛŒ" : "Privacy Policy"}
        subtitle={
          isFa
            ? "Ú†Ú¯ÙˆÙ†Ù‡ Ø§Ø² Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ø®ØµÛŒ Ø´Ù…Ø§ Ù…Ø­Ø§ÙØ¸Øª Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ…"
            : "How we protect your personal information"
        }
      />

      <section className="section-pad">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="surface-card p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="mono tnum flex h-9 w-9 shrink-0 items-center justify-center border border-primary/30 bg-soft text-sm font-bold text-primary">
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
