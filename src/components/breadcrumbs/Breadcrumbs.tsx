import Link from "next/link";
import { Fragment } from "react";
import type { ReactNode } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
  /** Render in a light tone suitable for dark hero backgrounds. */
  onDark?: boolean;
}

export default function Breadcrumbs({ items, separator, className, onDark = false }: BreadcrumbsProps) {
  const sep = separator ?? (
    onDark ? <span className="text-text-on-dark/50" aria-hidden="true">/</span> : <span aria-hidden="true">/</span>
  );
  const linkClass = onDark
    ? "text-sm font-medium text-text-on-dark hover:text-highlight transition-colors"
    : "text-sm font-medium text-text-primary hover:text-primary transition-colors";
  const currentClass = onDark
    ? "text-sm font-medium text-text-on-dark/70"
    : "text-sm font-medium text-text-secondary";
  return (
    <nav className={`blog-breadcrumb inline-flex items-center gap-2 ${className ?? ""}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && sep}
          {item.isCurrent ? (
            <span className={currentClass}>{item.label}</span>
          ) : (
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
