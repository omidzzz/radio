import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {index > 0 && (
                <svg
                  className="h-3.5 w-3.5 text-muted/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span className="font-medium text-text-primary" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}