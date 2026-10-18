import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/i18n/server";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import ParticleBackground from "@/components/ui/ParticleBackground";

export const metadata: Metadata = {
  title: "شرایط استفاده",
  description:
    "شرایط استفاده از وب‌سایت دکتر پری غدامگاهی: قوانین استفاده از خدمات، محتوا و مسئولیت‌ها.",
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
    { name: "خانه", path: "/" },
    { name: "شرایط استفاده", path: "/terms" },
  ]);

  const sections = isFa
    ? [
        {
          title: "پذیرش شرایط",
          content:
            "با استفاده از وب‌سایت دکتر پری غدامگاهی، شما موافقت خود را با این شرایط استفاده اعلام می‌کنید. اگر با هر یک از این شرایط موافق نیستید، لطفاً از وب‌سایت استفاده نکنید.",
        },
        {
          title: "محتوا و اطلاعات پزشکی",
          content:
            "محتویات این وب‌سایت صرفاً برای اطلاع‌رسانی عمومی است و جایگزین مشاوره، تشخیص یا درمان پزشکی حرفه‌ای نیست. همیشه برای مسائل پزشکی با پزشک یا متخصص مراقبت‌های بهداشتی خود مشورت کنید.",
        },
        {
          title: "استفاده از خدمات",
          content:
            "شما موافقت می‌کنید که از خدمات وب‌سایت فقط برای مقاصد قانونی استفاده کنید و از هرگونه سوءاستفاده، ارسال محتوای نامناسب یا نقض حقوق دیگران خودداری کنید.",
        },
        {
          title: "انجمن گفتگو",
          content:
            "مطالب ارسال‌شده در انجمن گفتگو نظرات شخصی کاربران است و لزوماً منعکس‌کننده نظرات کلینیک نیست. کلینیک حق حذف محتوای نامناسب را برای خود محفوظ می‌دارد.",
        },
        {
          title: "رزرو نوبت",
          content:
            "رزرو نوبت از طریق وب‌سایت یک درخواست اولیه است و پس از تأیید توسط تیم ما قطعی می‌شود. لطفاً در صورت عدم امکان حضور، نوبت خود را لغو کنید.",
        },
        {
          title: "مالکیت معنوی",
          content:
            "تمام محتوا، طراحی، لوگو و تصاویر این وب‌سایت متعلق به دکتر پری غدامگاهی است و استفاده از آن‌ها بدون اجازه کتبی ممنوع است.",
        },
        {
          title: "محدودیت مسئولیت",
          content:
            "دکتر پری غدامگاهی در قبال خسارات مستقیم یا غیرمستقیم ناشی از استفاده از این وب‌سایت مسئولیتی ندارد. اطلاعات ارائه‌شده ممکن است بدون اطلاع قبلی تغییر کند.",
        },
        {
          title: "قوانین حاکم",
          content:
            "این شرایط تحت قوانین جمهوری اسلامی ایران تفسیر و اجرا می‌شود. هرگونه اختلاف در دادگاه‌های صالح تهران رسیدگی خواهد شد.",
        },
      ]
    : [
        {
          title: "Acceptance of Terms",
          content:
            "By using the Dr. Pari Ghadamgahi website, you agree to these terms of use. If you do not agree with any of these terms, please do not use the website.",
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
            "All content, design, logos, and images on this website belong to the Dr. Pari Ghadamgahi and may not be used without written permission.",
        },
        {
          title: "Limitation of Liability",
          content:
            "The Dr. Pari Ghadamgahi is not liable for direct or indirect damages arising from the use of this website. Information provided may change without prior notice.",
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
        <ParticleBackground id="particles-terms" className="text-muted" />
      </div>

      <PageHero
        badge={isFa ? "شرایط استفاده" : "Terms of Use"}
        title={isFa ? "شرایط استفاده" : "Terms of Use"}
        subtitle={
          isFa
            ? "قوانین و مقررات استفاده از وب‌سایت"
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
              ? `آخرین به‌روزرسانی: ${new Date().toLocaleDateString("fa-IR")}`
              : `Last updated: ${new Date().toLocaleDateString("en-US")}`}
          </p>
        </div>
      </section>
    </div>
  );
}