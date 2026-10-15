"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  active: string;
}

/**
 * Category filter pills with client-side navigation and a pending
 * state so switching categories feels instant instead of a hard reload.
 */
export default function CategoryFilter({ categories, active }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const select = (value: string) => {
    const href = value === "all" ? pathname : `${pathname}?category=${encodeURIComponent(value)}`;
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  const pillClass = (isActive: boolean) =>
    `chip transition ${
      isActive
        ? "bg-primary text-deep shadow-sm"
        : "border border-border/70 bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
    }`;

  return (
    <div
      className={`mb-8 flex flex-wrap gap-2 transition-opacity duration-200 ${
        isPending ? "pointer-events-none opacity-60" : "opacity-100"
      }`}
      role="group"
      aria-label="Filter by category"
    >
      <button type="button" onClick={() => select("all")} className={pillClass(active === "all")}>
        همه
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => select(cat.value)}
          className={pillClass(active === cat.value)}
          aria-pressed={active === cat.value}
        >
          {cat.label}
        </button>
      ))}
      {/* Keep a crawlable link for SEO while buttons handle the UX */}
      <Link href="/blog" className="sr-only">
        همه مقالات
      </Link>
    </div>
  );
}