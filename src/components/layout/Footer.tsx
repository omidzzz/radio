"use client";

import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useDictionary, useFarsiDigits, useLocale } from "@/lib/i18n/client";
import { siteConfig } from "@/lib/seo/seo";
import {
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
    <h3 className="footer-heading text-xs font-semibold uppercase tracking-[0.15em] text-highlight/90">
      {children}
      <span className="mt-2 block h-px w-8 bg-gradient-to-r from-primary/70 to-transparent" />
    </h3>
  );
}

export default function Footer({
  workingHours,
  isOpen,
}: {
  workingHours: Array<{ label: string; hours: string; isClosed: boolean }>;
  isOpen: boolean;
}) {
  const currentDict = useDictionary();
  const { locale } = useLocale();
  const toFarsi = useFarsiDigits();
  const isFa = locale === "fa";
  const localePrefix = `/${locale}`;
  const closedLabel = currentDict.footer.closed;

  const quickLinks = [
    { href: `${localePrefix}/about`, label: currentDict.footer.aboutUs },
    { href: `${localePrefix}/services`, label: currentDict.footer.ourServices },
    { href: `${localePrefix}/forum`, label: currentDict.footer.communityForum },
    { href: `${localePrefix}/booking`, label: currentDict.footer.bookSession },
    { href: `${localePrefix}/blog`, label: currentDict.nav?.blog || "Blog" },
    { href: `${localePrefix}/contact`, label: currentDict.nav?.contact || "Contact" },
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
    <footer className="footer-shell relative overflow-hidden bg-deep" aria-label="Site footer">
      {/* Single soft top hairline instead of full planning grid */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Consolidated ambient glow field — one painted layer instead of
          three blurred DOM nodes (cheaper paint, RTL-safe) */}
      <div className="footer-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Top energy line */}
      <div className="footer-energy-line relative">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute inset-x-0 -top-1 h-3 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-md" />
      </div>

      <div className="footer-container relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="footer-grid grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_1.15fr_0.95fr] lg:gap-8">
          {/* Brand */}
          <div className="footer-brand-panel lg:col-span-1">
            <Link href={localePrefix} prefetch={false} className="footer-brand-lockup group inline-flex max-w-full items-center gap-3">
              <span>
                <span className="block text-lg font-semibold text-white transition-colors group-hover:text-highlight">
                  {currentDict.common.doctorName}
                </span>
              </span>
            </Link>
            <p className="footer-brand-copy mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              {currentDict.footer.tagline}
            </p>

            {/* Social icons under brand */}
            <div className="footer-socials mt-6 flex items-center gap-2.5">
              {socials.map(({ href, label, Icon, hoverClasses }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`footer-social ui-icon-button ui-icon-button-compact h-9 w-9 border-white/12 bg-white/5 text-slate-400 hover:-translate-y-0.5 ${hoverClasses}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Primary conversion CTA */}
            <Link
              href={`${localePrefix}/booking`}
              prefetch={false}
              className="ui-button ui-button-primary footer-booking-button group mt-7 px-5 py-2.5 text-sm"
            >
              {currentDict.footer.bookSession}
            </Link>
          </div>

          {/* Quick Links */}
          <nav className="footer-nav" aria-label={currentDict.footer.quickLinks}>
            <FooterHeading>{currentDict.footer.quickLinks}</FooterHeading>
            <ul className="mt-5 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="footer-quick-link group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-highlight"
                  >
                    {/* Persistent faint bullet that brightens + extends on hover */}
                    <span className="footer-link-bullet h-px w-2 bg-white/15 transition-all duration-300 group-hover:w-3 group-hover:bg-primary-fill" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="footer-contact-panel">
            <FooterHeading>{currentDict.footer.contact}</FooterHeading>
            <ul className="footer-contact-list mt-5 space-y-2.5 text-sm text-slate-400">
              <li>
                {/* Semantic address element linked to Google Maps directions */}
                <address className="not-italic leading-relaxed">
                  <a
                    href={siteConfig.mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col transition-colors duration-300 hover:text-highlight"
                  >
                    {currentDict.footer.addressLine1}
                    <br />
                    {currentDict.footer.addressLine2}
                    <br />
                    {currentDict.footer.addressLine3}
                  </a>
                </address>
                <a
                  href={siteConfig.mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 transition-colors duration-300 hover:text-highlight"
                >
                  {currentDict.footer.getDirections}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.phoneHref}
                  dir={isFa ? "rtl" : "ltr"}
                  className="footer-contact-row inline-flex items-center gap-2 transition-colors duration-300 hover:text-highlight"
                >
                  <PhoneIcon className="footer-contact-icon h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span dir="ltr" className="footer-contact-value">
                    {isFa ? toFarsi(siteConfig.phone) : siteConfig.phone}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  dir={isFa ? "rtl" : "ltr"}
                  className="footer-contact-row inline-flex items-center gap-2 transition-colors duration-300 hover:text-highlight"
                >
                  <MailIcon className="footer-contact-icon h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span dir="ltr" className="footer-contact-value">
                    {siteConfig.email}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="footer-hours-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FooterHeading>{currentDict.footer.officeHours}</FooterHeading>
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
                {isOpen ? currentDict.contact.openNow : currentDict.contact.closedNow}
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
                href="https://test.sinisteroid.ir/api/admin.php"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                className="text-xs text-slate-500 transition-colors duration-300 hover:text-primary"
              >
                {currentDict.footer.adminLogin}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar — redesigned utility row with visible back-to-top control */}
        <div className="footer-bottom relative mt-10 border-t border-white/10 pt-5 sm:mt-12 sm:pt-6 lg:mt-14">
          <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center lg:text-left">
              <p className="text-sm text-slate-400">
                &copy;{" "}
                {isFa
                  ? toFarsi(new Date().getFullYear())
                  : new Date().getFullYear()}{" "}
                {currentDict.common.doctorName}. {currentDict.footer.rightsReserved}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {currentDict.footer.designerBy}{" "}
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

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400 sm:gap-3 lg:justify-end">
              <Link
                href={`${localePrefix}/privacy`}
                prefetch={false}
                className="rounded-full px-2 py-1 transition-colors hover:text-slate-200"
              >
                {currentDict.footer.privacy}
              </Link>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] ring-1 ring-white/10 dark:bg-primary/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]" aria-hidden="true" />
              <Link
                href={`${localePrefix}/terms`}
                prefetch={false}
                className="rounded-full px-2 py-1 transition-colors hover:text-slate-200"
              >
                {currentDict.footer.terms}
              </Link>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] ring-1 ring-white/10 dark:bg-primary/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]" aria-hidden="true" />
              <a
                href="#top"
                aria-label={currentDict.footer.backToTop}
                title={currentDict.footer.backToTop}
                className="ui-button ui-button-on-dark ui-button-compact group inline-flex px-3 text-[11px]"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M10 14.5V4.5M6 8.5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">{currentDict.footer.backToTop}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}