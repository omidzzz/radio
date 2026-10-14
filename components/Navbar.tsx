"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import SearchDropdown from "./SearchDropdown";
import LiveSlotBadge from "@/components/ui/LiveSlotBadge";

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

export default function Navbar({ strings, isFa }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Lock body scroll when the mobile menu is open (prevents background
  // scroll + layout shift on small screens).
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

  useEffect(() => {
    // rAF-throttled so we evaluate at most once per frame, and we only touch
    // state when the value actually changes.
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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1220) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Theme-aware bar: paper in light, deep in dark via --color-bg.
          Single hairline + one soft shadow when scrolled. */}
      <div
        className={`relative z-20 border-b transition-all duration-300 ${
          scrolled
            ? "border-primary/25 bg-bg/90 shadow-[0_8px_30px_-14px_rgba(2,6,23,0.35)] backdrop-blur-md min-[1220px]:backdrop-blur-xl"
            : "border-border bg-bg/80 backdrop-blur-sm"
        }`}
      >

        <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo — glow only on hover so idle navbar stays cheap */}
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-deep transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-[0_0_28px_-4px_rgba(6,182,212,0.7)]">
              <span className="relative z-10">R</span>
              <span className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-text-primary transition-colors duration-300 group-hover:text-primary">
              {strings.clinicName}
            </span>
          </Link>

          {/* Desktop navigation — theme-aware text, single hover pill */}
          <div className="hidden items-center gap-0.5 min-[1220px]:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-full bg-primary/0 transition-colors duration-200 group-hover:bg-primary/12" />
              </Link>
            ))}

            {/* Search with dropdown */}
            <div className="ml-1">
              <SearchDropdown />
            </div>

            <div className="mx-2.5 h-5 w-px bg-border" />

            {/* Minimal column: theme + language toggles */}
            <div className="flex flex-col items-center gap-1.5">
              <ThemeToggle />
              <LanguageToggle />
            </div>

            <div className="mx-2.5 h-5 w-px bg-border" />

            {/* Live next-slot badge — acts as the primary booking CTA */}
            <LiveSlotBadge
              isFa={isFa}
              href="/booking"
              primary
              className="hidden min-[1220px]:inline-flex mx-1"
            />
          </div>

          {/* Mobile toggle — 44px target, theme-aware */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-primary/12 hover:text-text-primary min-[1220px]:hidden"
            aria-label={strings.toggleMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
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

        {/* Mobile menu — opacity + translate, body scroll locked while open */}
        <div
          id="mobile-menu"
          className={`min-[1220px]:hidden ${
            mobileOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          } transition-[opacity,transform] duration-200 ease-out`}
          role="navigation"
          aria-label={strings.toggleMenu}
          inert={!mobileOpen}
        >
          <div className="border-t border-border bg-bg px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  tabIndex={mobileOpen ? 0 : -1}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/12 hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/search"
                onClick={() => setMobileOpen(false)}
                tabIndex={mobileOpen ? 0 : -1}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/12 hover:text-text-primary"
              >
                {strings.nav.search}
              </Link>

              <div className="my-2.5 h-px bg-border" />

              <div className="flex items-center justify-between gap-3 px-1 pt-1">
                <div className="flex flex-col items-center gap-1.5">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
                <Link
                  href="/booking"
                  onClick={() => setMobileOpen(false)}
                  tabIndex={mobileOpen ? 0 : -1}
                  className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-deep transition-colors hover:bg-primary-hover"
                >
                  {strings.bookNow}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Single 1px hairline under the bar (was double glow + energy border) */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}