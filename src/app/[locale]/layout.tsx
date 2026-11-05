import { LocaleProvider } from "@/components/providers/LocaleProvider";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: "fa" | "en" };

  return (
    <LocaleProvider initialLocale={locale}>
      <main className="flex-1 pt-18.5 min-[1220px]:pt-25">{children}</main>
    </LocaleProvider>
  );
}