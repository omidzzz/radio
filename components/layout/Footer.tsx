import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo/seo";
import {
  getWorkingHoursSummary,
  getOpenNowStatus,
} from "@/lib/services/working-hours";
import {
  ArrowIcon,
  ArrowUpIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Column heading with a small gradient underline accent */
function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-highlight/90">
      {children}
      <span className="mt-2 block h-px w-8 bg-gradient-to-r from-primary/70 to-transparent" />
    </h3>
  );
}

export default async function Footer() {
  const { dict, locale } = await getServerDictionary();
  const workingHours = getWorkingHoursSummary(locale);
  const closedLabel = dict.footer.closed;
  const { isOpen } = getOpenNowStatus();
  const isFa = locale === "fa";

  const quickLinks = [
    { href: "/about", label: dict.footer.aboutUs },
    { href: "/services", label: dict.footer.ourServices },
    { href: "/forum", label: dict.footer.communityForum },
    { href: "/booking", label: dict.footer.bookSession },
    { href: "/blog", label: dict.nav?.blog || "Blog" },
    { href: "/contact", label: dict.nav?.contact || "Contact" },
  ];

  const socials: {
    href: string;
    label: string;
    Icon: IconComponent;
    hoverClasses: string;
  }[] = [
    {
      href: siteConfig.socials?.telegram ?? "https://t.me/radiotherapyclinic",
      label: "Telegram",
      Icon: TelegramIcon,
      hoverClasses:
        "hover:border-sky-400/50 hover:bg-sky-500/15 hover:text-sky-400",
    },
    {
      href: siteConfig.socials?.whatsapp ?? "https://wa.me/1234567890",
      label: "WhatsApp",
      Icon: WhatsAppIcon,
      hoverClasses:
        "hover:border-green-400/50 hover:bg-green-500/15 hover:text-green-400",
    },
    {
      href: siteConfig.socials?.instagram ?? "https://instagram.com/radiotherapyclinic",
      label: "Instagram",
      Icon: InstagramIcon,
      hoverClasses:
        "hover:border-pink-400/50 hover:bg-pink-500/15 hover:text-pink-400",
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-deep" aria-label="Site footer">
      {/* Single soft top hairline instead of full planning grid */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Radiation trefoil watermark — static (rotation is desktop-only in CSS) */}
      <div className="trefoil-static trefoil-spin pointer-events-none absolute -end-16 -top-16 hidden h-64 w-64 opacity-[0.05] lg:block">
        <svg viewBox="0 0 100 100" fill="none" className="h-full w-full" stroke="currentColor" strokeWidth="1.5">
          <circle cx="50" cy="50" r="8" fill="currentColor" stroke="none" />
          <path d="M50 42v-22M50 58v22M42 50H20M58 50h22" strokeLinecap="round" />
          <path d="M50 42c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 42c-8 0-14-6-14-14s6-14 14-14 14 6 14 14-6 14-14 14z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 58c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Consolidated ambient glow field — one painted layer instead of
          three blurred DOM nodes (cheaper paint, RTL-safe) */}
      <div className="footer-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Top energy line */}
      <div className="relative">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute inset-x-0 -top-1 h-3 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-md" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary text-base font-bold text-on-primary transition-all duration-300 group-hover:shadow-[0_0_32px_-2px_rgba(26,115,82,0.85)] group-hover:scale-[1.04]">
                <span className="relative z-10">R</span>
                <span className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-highlight">
                {dict.common.doctorName}
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              {dict.footer.tagline}
            </p>

            {/* Social icons under brand */}
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map(({ href, label, Icon, hoverClasses }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-slate-400 transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary ${hoverClasses}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Primary conversion CTA */}
            <Link
              href="/booking"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-deep shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 focus-visible:ring-2 focus-visible:ring-highlight"
            >
              {dict.footer.bookSession}
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>

          {/* Quick Links */}
          <nav aria-label={dict.footer.quickLinks}>
            <FooterHeading>{dict.footer.quickLinks}</FooterHeading>
            <ul className="mt-5 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-highlight"
                  >
                    {/* Persistent faint bullet that brightens + extends on hover */}
                    <span className="h-px w-2 bg-white/15 transition-all duration-300 group-hover:w-3 group-hover:bg-primary-fill" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <FooterHeading>{dict.footer.contact}</FooterHeading>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
              <li>
                {/* Semantic address element linked to Google Maps directions */}
                <address className="not-italic leading-relaxed">
                  <a
                    href={siteConfig.mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col transition-colors duration-300 hover:text-highlight"
                  >
                    {dict.footer.addressLine1}
                    <br />
                    {dict.footer.addressLine2}
                    <br />
                    {dict.footer.addressLine3}
                  </a>
                </address>
                <a
                  href={siteConfig.mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 transition-colors duration-300 hover:text-highlight"
                >
                  <ArrowIcon className="h-3 w-3" />
                  {dict.footer.getDirections}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.phoneHref}
                  dir="ltr"
                  className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-highlight"
                >
                  <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  {isFa ? toFarsiDigits(siteConfig.phone) : siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  dir="ltr"
                  className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-highlight"
                >
                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FooterHeading>{dict.footer.officeHours}</FooterHeading>
              {/* Live open/closed status computed in clinic timezone */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  isOpen
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {isOpen && (
                    <span className="absolute hidden h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none sm:inline-flex" />
                  )}
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                      isOpen ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                </span>
                {isOpen ? dict.contact.openNow : dict.contact.closedNow}
              </span>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm">
              {workingHours.map((entry) => (
                <li
                  key={entry.label}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <span className="text-slate-400">{entry.label}</span>
                  <span
                    className={
                      entry.isClosed
                        ? "font-medium text-slate-500"
                        : "font-medium text-slate-300"
                    }
                  >
                    {entry.isClosed ? closedLabel : entry.hours}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/admin/login"
                className="text-xs text-slate-500 transition-colors duration-300 hover:text-primary"
              >
                {dict.footer.adminLogin}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar — gradient divider echoing the top energy line */}
        <div className="relative mt-14 pt-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-sm text-slate-400">
                &copy;{" "}
                {isFa
                  ? toFarsiDigits(new Date().getFullYear())
                  : new Date().getFullYear()}{" "}
                {dict.common.doctorName}. {dict.footer.rightsReserved}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {dict.footer.designerBy}{" "}
                <a
                  href="https://sinisteroid.ir/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-400 transition-colors duration-300 hover:text-highlight"
                >
                  sinisteroid
                </a>
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <Link
                href="/privacy"
                className="transition-colors hover:text-slate-200"
              >
                {dict.footer.privacy}
              </Link>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <Link
                href="/terms"
                className="transition-colors hover:text-slate-200"
              >
                {dict.footer.terms}
              </Link>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <a
                href="#top"
                aria-label={dict.footer.backToTop}
                title={dict.footer.backToTop}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-highlight"
              >
                <ArrowUpIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}