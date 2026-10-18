import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import ParticleBackground from "@/components/ui/ParticleBackground";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description:
    "سیاست حفظ حریم خصوصی دکتر پری غدامگاهی: نحوه جمع‌آوری، استفاده و محافظت از اطلاعات شخصی شما.",
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
    { name: "خانه", path: "/" },
    { name: "حریم خصوصی", path: "/privacy" },
  ]);

  const sections = isFa
    ? [
        {
          title: "جمع‌آوری اطلاعات",
          content:
            "ما اطلاعاتی را که شما به صورت داوطلبانه از طریق فرم‌های رزرو نوبت، تماس، انجمن گفتگو و نظرات وبلاگ ارائه می‌دهید جمع‌آوری می‌کنیم. این اطلاعات شامل نام، شماره تلفن، ایمیل و محتوای پیام‌های شما می‌شود.",
        },
        {
          title: "استفاده از اطلاعات",
          content:
            "اطلاعات شما صرفاً برای پاسخگویی به درخواست‌های شما، مدیریت نوبت‌ها، بهبود خدمات و ارسال اطلاعات مرتبط با درمان استفاده می‌شود. ما اطلاعات شما را به هیچ شخص ثالثی بدون رضایت شما نمی‌فروشیم یا اجاره نمی‌دهیم.",
        },
        {
          title: "محافظت از اطلاعات",
          content:
            "ما از پروتکل‌های امنیتی استاندارد صنعتی برای محافظت از اطلاعات شما استفاده می‌کنیم. تمام ارتباطات با وب‌سایت از طریق HTTPS رمزنگاری می‌شود و دسترسی به داده‌های حساس محدود به پرسنل مجاز است.",
        },
        {
          title: "کوکی‌ها",
          content:
            "وب‌سایت ما از کوکی‌ها برای بهبود تجربه کاربری، ذخیره تنظیمات زبان و تحلیل ترافیک استفاده می‌کند. شما می‌توانید کوکی‌ها را از طریق تنظیمات مرورگر خود مدیریت یا حذف کنید.",
        },
        {
          title: "حقوق شما",
          content:
            "شما حق دارید در هر زمان به اطلاعات شخصی خود دسترسی داشته باشید، آن‌ها را تصحیح یا حذف کنید. برای اعمال این حقوق، لطفاً با ما از طریق صفحه تماس ارتباط برقرار کنید.",
        },
        {
          title: "تغییرات در سیاست حریم خصوصی",
          content:
            "ما ممکن است این سیاست را به‌روزرسانی کنیم. تغییرات مهم در این صفحه اعلام خواهد شد. ادامه استفاده از وب‌سایت پس از تغییرات به معنای پذیرش سیاست جدید است.",
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

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <ParticleBackground id="particles-privacy" className="text-muted" />
      </div>

      <PageHero
        badge={isFa ? "حریم خصوصی" : "Privacy Policy"}
        title={isFa ? "حریم خصوصی" : "Privacy Policy"}
        subtitle={
          isFa
            ? "چگونه از اطلاعات شخصی شما محافظت می‌کنیم"
            : "How we protect your personal information"
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
              ? `آخرین به‌روزرسانی: ${new Date().toLocaleDateString("fa-IR")}`
              : `Last updated: ${new Date().toLocaleDateString("en-US")}`}
          </p>
        </div>
      </section>
    </div>
  );
}