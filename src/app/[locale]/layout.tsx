import { LocaleProvider } from "@/components/providers/LocaleProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingContactLazy from "@/components/feedback/FloatingContactLazy";
import { BookingModalProvider } from "@/components/forms/BookingModalProvider";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);

  return (
    <LocaleProvider initialLocale={locale}>
      <BookingModalProvider>
        <Navbar />
        <main className="flex-1 pt-18.5 min-[1220px]:pt-25">{children}</main>
        <Footer />
      </BookingModalProvider>
      <FloatingContactLazy
        labels={{
          telegram: dict.floating.telegram,
          whatsapp: dict.floating.whatsapp,
          phone: dict.floating.phone,
          backToTop: dict.footer.backToTop,
          officeHours: dict.contact.officeHours,
          openNow: dict.contact.openNow,
          closedNow: dict.contact.closedNow,
        }}
        locale={locale}
      />
    </LocaleProvider>
  );
}