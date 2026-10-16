import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo";
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
  RadiationIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Editorial dossier "colophon" label - mono, letter-spaced, on-dark. */
function ColophonHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-highlight">
      {children}
      <span
        aria-hidden="true"
        className="mt-2 block h-px w-10 bg-[var(--color-rule-strong)]"
      />
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
  }[] = [
    {
      href: siteConfig.socials?.telegram ?? "https://t.me/radiotherapyclinic",
      label: "Telegram",
      Icon: TelegramIcon,
    },
    {
      href: siteConfig.socials?.whatsapp ?? "https://wa.me/1234567890",
      label: "WhatsApp",
      Icon: WhatsAppIcon,
    },
    {
      href: siteConfig.socials?.instagram ?? "https://instagram.com/radiotherapyclinic",
      label: "Instagram",
      Icon: InstagramIcon,
    },
  ];

  return (
    <footer
      className="relative overflow-hidden bg-deep text-text-on-dark"
      aria-label="Site footer"
    >
      <RadiationIcon className="pointer-events-none absolute -end-24 -top-24 hidden h-80 w-80 opacity-[0.05] lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-rule-strong)]" />
          <span className="mono text-[0.6rem] uppercase tracking-[0.3em] text-muted">
            {isFa ? "پایان پرونده" : "End of file"}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-rule-strong)]" />
        </div>

        <div className="mt-12 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-primary">
                <RadiationIcon className="h-6 w-6" />
              </span>
              <span className="font-[family-name:var(--font-newsreader)] text-lg font-semibold">
                {dict.common.clinicName}
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-text-secondary">
              {dict.footer.tagline}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                {isOpen && (
                  <span className="absolute hidden h-full w-full animate-ping rounded-full bg-positive opacity-75 motion-reduce:animate-none sm:inline-flex" />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    isOpen ? "bg-positive" : "bg-muted"
                  }`}
                />
              </span>
              <span className="text-xs font-medium text-text-secondary">
                {isOpen ? dict.contact.openNow : dict.contact.closedNow}
              </span>
            </div>
          </div>

          <nav className="md:col-span-3" aria-label={dict.footer.quickLinks}>
            <ColophonHeading>{dict.footer.quickLinks}</ColophonHeading>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-text-secondary transition-colors duration-200 hover:text-highlight"
                  >
                    <ArrowIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-5">
            <ColophonHeading>{dict.footer.contact}</ColophonHeading>

            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              <div className="space-y-3 text-sm">
                <a
                  href={siteConfig.phoneHref}
                  className="flex items-center gap-2.5 text-text-secondary transition-colors duration-200 hover:text-highlight"
                >
                  <PhoneIcon className="h-4 w-4 text-primary" />
                  <span dir="ltr">
                    {isFa ? toFarsiDigits(siteConfig.phone) : siteConfig.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2.5 text-text-secondary transition-colors duration-200 hover:text-highlight"
                >
                  <MailIcon className="h-4 w-4 text-primary" />
                  <span dir="ltr" className="break-all">
                    {siteConfig.email}
                  </span>
                </a>
                <a
                  href={siteConfig.mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-text-secondary transition-colors duration-200 hover:text-highlight"
                >
                  <ArrowIcon className="mt-1 h-4 w-4 text-primary rtl:rotate-180" />
                  <span>
                    {dict.footer.addressLine1}
                    <br />
                    {dict.footer.addressLine2}
                    <br />
                    {dict.footer.addressLine3}
                  </span>
                </a>
                <a
                  href={siteConfig.mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-primary transition-colors duration-200 hover:text-highlight"
                >
                  <ArrowIcon className="h-3 w-3 rtl:rotate-180" />
                  {dict.footer.getDirections}
                </a>
              </div>

              <ul className="divide-y divide-[var(--color-border)]">
                {workingHours.map((entry) => (
                  <li
                    key={entry.label}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span className="text-text-secondary">{entry.label}</span>
                    <span
                      className={
                        entry.isClosed
                          ? "tnum font-medium text-muted"
                          : "tnum font-medium text-text-on-dark"
                      }
                    >
                      {entry.isClosed ? closedLabel : entry.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
              <div className="flex items-center gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-text-secondary transition-all duration-200 hover:border-primary/60 hover:text-highlight"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <Link
                href="/admin/login"
                className="mono text-[0.66rem] uppercase tracking-[0.14em] text-muted transition-colors duration-200 hover:text-highlight"
              >
                {dict.footer.adminLogin}
              </Link>
            </div>
          </div>
        </div>

        <div className="relative mt-14 border-t border-[var(--color-rule-strong)] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted">
              &copy;{" "}
              {isFa
                ? toFarsiDigits(new Date().getFullYear())
                : new Date().getFullYear()}{" "}
              {dict.common.clinicName}. {dict.footer.rightsReserved}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted">
              <Link
                href="/privacy"
                className="transition-colors hover:text-highlight"
              >
                {dict.footer.privacy}
              </Link>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--color-rule-strong)]" />
              <Link
                href="/terms"
                className="transition-colors hover:text-highlight"
              >
                {dict.footer.terms}
              </Link>
              <a
                href="#top"
                aria-label={dict.footer.backToTop}
                title={dict.footer.backToTop}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:text-highlight"
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