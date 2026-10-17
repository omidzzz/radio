"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
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
 * Pulse top-bar — floating glass navigation for the
 * "surgical kinetic editorial" concept. Desktop shows a centered
 * pill; mobile collapses to brand + hamburger with a drawer.
 */
export default function Navbar({ strings, isFa }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Close the drawer when we cross to desktop.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: "/", label: strings.nav.home },
    { href: "/about", label: strings.nav.about },
    { href: "/services", label: strings.nav.services },
    { href: "/blog", label: strings.nav.blog },
    { href: "/forum", label: strings.nav.forum },
    { href: "/booking", label: strings.nav.bookSession },
    { href: "/contact", label: strings.nav.contact },
    { href: "/search", label: strings.nav.search },
  ];

  // Home is exact-match; everything else matches on prefix so nested
  // routes (e.g. /blog/[slug]) keep their section lit.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const NavList = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <nav
      className={
        inDrawer
          ? "flex flex-col gap-1"
          : "hidden items-center gap-1 lg:flex"
      }
      aria-label={strings.toggleMenu}
    >
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          onClick={inDrawer ? () => setMobileOpen(false) : undefined}
          className={`pulse${inDrawer ? "-drawer" : ""}-link${
            isActive(link.href) ? " is-active" : ""
          }`}
        >
          <span className="pulse-dot" aria-hidden="true" />
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );

  const Brand = () => (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5"
      aria-label={strings.clinicName}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-signal shadow-sm transition-transform duration-200 group-hover:scale-105">
        <RadiationIcon className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-[family-name:var(--font-display)] text-sm font-normal leading-none text-text-primary">
          {strings.clinicName}
        </span>
        <span className="mono text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted">
          {isFa ? "کلینیک تخصصی" : "Specialist Clinic"}
        </span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Desktop Pulse top-bar */}
      <header className="pulse-bar hidden lg:block">
        <nav className="pulse-bar-inner" aria-label={strings.toggleMenu}>
          <Brand />
          <NavList />
          <div className="flex items-center gap-2">
            <Link href="/booking" className="pulse-cta">
              {strings.bookNow}
            </Link>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </nav>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md lg:hidden">
        <nav className="flex items-center justify-between gap-3 px-4 py-3">
          <Brand />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={strings.toggleMenu}
            aria-expanded={mobileOpen}
            aria-controls="pulse-drawer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary"
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
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="pulse-drawer"
            className="pulse-drawer lg:hidden"
            aria-label={strings.toggleMenu}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={strings.toggleMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/10 hover:text-text-primary"
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

            <div className="py-4">
              <NavList inDrawer />
            </div>

            <div className="mt-auto border-t border-border pt-4">
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