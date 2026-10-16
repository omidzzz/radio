"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import LiveSlotBadge from "@/components/ui/LiveSlotBadge";
import { RadiationIcon } from "@/components/ui/icons";

export interface NavbarStrings {
  clinicName: string;
  bookNow: string;
  toggleMenu: string;
  nav: {
    home: string;
    about: string;
    services: string;
    blog: string;
    forum: string;
    bookSession: string;
    contact: string;
    search: string;
  };
}

interface NavbarProps {
  strings: NavbarStrings;
  isFa: boolean;
}

/**
 * Console rail — the fixed left sidebar navigation for the
 * "precision-instrument" concept.
 *
 * Desktop (lg+): a fixed instrument rail pinned to the inline-start edge
 * with channel-style nav links, search, theme/language toggles, and a
 * booking readout. Mobile (<lg): collapses to a slim top bar that opens
 * the same rail as a slide-in drawer. Positioning uses logical properties
 * (via .console-rail / .rail-link) so it mirrors under RTL automatically.
 */
export default function Navbar({ strings, isFa }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/", label: strings.nav.home },
    { href: "/about", label: strings.nav.about },
    { href: "/services", label: strings.nav.services },
    { href: "/blog", label: strings.nav.blog },
    { href: "/forum", label: strings.nav.forum },
    { href: "/booking", label: strings.nav.bookSession },
    { href: "/contact", label: strings.nav.contact },
  ];

  // Active-route test: home is exact-match, everything else matches on
  // prefix so nested routes (e.g. /blog/[slug]) keep their section lit.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // rAF-throttled scroll flag for the mobile bar's shadow.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
        ticking = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the drawer on resize to desktop.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Shared nav list — rendered once for the desktop rail, once for the drawer.
  const NavList = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <nav
      className="flex flex-col"
      aria-label={strings.toggleMenu}
      role="navigation"
    >
      {navLinks.map((link, i) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          onClick={inDrawer ? () => setMobileOpen(false) : undefined}
          className="rail-link"
        >
          <span className="idx" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{link.label}</span>
        </Link>
      ))}
      <Link
        href="/search"
        aria-current={isActive("/search") ? "page" : undefined}
        onClick={inDrawer ? () => setMobileOpen(false) : undefined}
        className="rail-link"
      >
        <span className="idx" aria-hidden="true">
          08
        </span>
        <span>{strings.nav.search}</span>
      </Link>
    </nav>
  );

  // Brand block — trefoil mark + clinic name, used in rail and mobile bar.
  const Brand = () => (
    <Link href="/" className="group flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors duration-200 group-hover:bg-primary/10">
        <RadiationIcon className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-[family-name:var(--font-display)] text-base font-semibold text-text-primary">
          {strings.clinicName}
        </span>
        <span className="readout__label">
          {isFa ? "کلینیک تخصصی" : "Specialist Clinic"}
        </span>
      </span>
    </Link>
  );

  return (
    <>
      {/* ── Desktop console rail (lg+) ───────────────────────────────── */}
      <aside className="console-rail hidden lg:flex" aria-label="Console">
        <div className="border-b border-border px-5 py-5">
          <Brand />
          <div className="mt-4 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
            </span>
            <span className="readout__label">
              {isFa ? "سیستم آماده" : "System Ready"}
            </span>
          </div>
        </div>

        <div className="tick-ruler--h h-2.5 w-full" aria-hidden="true" />

        <div className="py-3">
          <p className="readout__label px-5 pb-2 pt-1">
            {isFa ? "کانال‌ها" : "Channels"}
          </p>
          <NavList />
        </div>

        <div className="flex-1" />

        <div className="border-t border-border px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <LiveSlotBadge isFa={isFa} href="/booking" primary />
        </div>

        <div className="scale-rule" aria-hidden="true" />
        <div className="px-5 py-3">
          <p className="readout__label">
            {isFa ? "پایان جلسه" : "End of Session"} ·{" "}
            {isFa ? "رادیوتراپی" : "Radiotherapy"}
          </p>
        </div>
      </aside>

      {/* ── Mobile top bar (<lg) ─────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 border-b bg-bg/90 backdrop-blur-md transition-all duration-300 lg:hidden ${
          scrolled
            ? "border-primary/25 shadow-[0_8px_30px_-14px_rgba(2,6,23,0.35)]"
            : "border-border"
        }`}
      >
        <nav className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={strings.toggleMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-primary/12 hover:text-text-primary"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <Brand />

          <span className="w-11" aria-hidden="true" />
        </nav>
        <div className="scale-rule" aria-hidden="true" />
      </header>

      {/* ── Mobile drawer: same rail, overlaid ───────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="rail-backdrop lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-drawer"
            className="console-rail lg:hidden"
            aria-label={strings.toggleMenu}
          >
            <div className="border-b border-border px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <Brand />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={strings.toggleMenu}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/12 hover:text-text-primary"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="tick-ruler--h h-2.5 w-full" aria-hidden="true" />

            <div className="py-3">
              <p className="readout__label px-5 pb-2 pt-1">
                {isFa ? "کانال‌ها" : "Channels"}
              </p>
              <NavList inDrawer />
            </div>

            <div className="flex-1" />

            <div className="border-t border-border px-5 py-4">
              <div className="mb-4 flex items-center justify-between">
                <ThemeToggle />
                <LanguageToggle />
              </div>
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-on-signal transition-colors hover:bg-primary-hover"
              >
                {strings.bookNow}
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
