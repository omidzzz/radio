import type { Metadata } from "next";
import Link from "next/link";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import StateIllustration from "@/components/ui/StateIllustration";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center bg-bg px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative flex flex-col items-center text-center">
        <StateIllustration
          variant="not-found"
          className="h-36 w-36 opacity-90 sm:h-44 sm:w-44"
        />
        <div className="mt-2 text-5xl font-extrabold tracking-tight text-primary/25 sm:text-6xl">
          {toFarsiDigits("404")}
        </div>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">
          صفحه پیدا نشد
        </h1>
        <p className="mt-3 text-text-secondary">
          صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary-fill px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition-colors duration-300 hover:bg-primary-fill-hover"
          >
            بازگشت به صفحه اصلی
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition-colors duration-300 hover:border-primary/40 hover:text-primary"
          >
            مشاهده مقالات
          </Link>
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition-colors duration-300 hover:border-primary/40 hover:text-primary"
          >
            انجمن گفتگو
          </Link>
        </div>
      </div>
    </div>
  );
}