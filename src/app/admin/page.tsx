"use client";

import { useState, useEffect } from "react";
import { useDictionary } from "@/lib/i18n/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/seo/seo";
import OverviewTab from "@/app/admin/components/OverviewTab";
import ReservationsTab from "@/app/admin/components/ReservationsTab";
import LeadsTab from "@/app/admin/components/LeadsTab";
import BlogCommentsTab from "@/app/admin/components/BlogCommentsTab";
import ForumTab from "@/app/admin/components/ForumTab";
import BlogTab from "@/app/admin/components/BlogTab";
import AvailabilityTab from "@/app/admin/components/AvailabilityTab";

type Tab =
  | "overview"
  | "reservations"
  | "leads"
  | "blogComments"
  | "forumPosts"
  | "blog"
  | "availability";

const TABS: { key: Tab; labelKey: string }[] = [
  { key: "overview", labelKey: "overview" },
  { key: "reservations", labelKey: "bookings" },
  { key: "leads", labelKey: "leads" },
  { key: "blogComments", labelKey: "blogComments" },
  { key: "forumPosts", labelKey: "forumPosts" },
  { key: "blog", labelKey: "blogPosts" },
  { key: "availability", labelKey: "availability" },
];

export default function AdminPage() {
  const dict = useDictionary();
  const admin = dict.admin;
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin-stats", { credentials: "include" });
        if (res.status === 401 || !res.ok) {
          router.push("/admin/login");
          return;
        }
        setAuthed(true);
      } catch {
        router.push("/admin/login");
      }
    })();
  }, [router]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <p className="text-text-secondary">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary font-semibold"
            >
              <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                R
              </span>
              <span className="hidden sm:inline">{siteConfig.name || "Dr. Pari Ghadamgahi"}</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">{admin.clinicManagement}</span>
            <button
              onClick={async () => {
                await fetch("/api/admin-logout", { method: "POST", credentials: "include" });
                router.push("/admin/login");
              }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-accent hover:text-accent-ink transition"
            >
              {dict.common.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="hidden md:flex md:w-64 flex-col border-r border-border bg-surface/50">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-6">
              Menu
            </h2>
            <ul className="space-y-1">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <li key={t.key}>
                    <button
                      onClick={() => setTab(t.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition ${
                        active
                          ? "bg-primary-fill text-on-primary"
                          : "text-text-secondary hover:bg-accent hover:text-text-primary"
                      }`}
                    >
                      {active ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-on-primary-fill" />
                      ) : null}
                      {String(admin[t.labelKey as keyof typeof admin])}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text-primary">
              {String(admin[tab === "overview" ? "dashboard" : TABS.find((t) => t.key === tab)!.labelKey as keyof typeof admin])}
            </h1>
          </div>

          {tab === "overview" && <OverviewTab admin={admin} />}
          {tab === "reservations" && <ReservationsTab admin={admin} />}
          {tab === "leads" && <LeadsTab admin={admin} />}
          {tab === "blogComments" && <BlogCommentsTab admin={admin} />}
          {tab === "forumPosts" && <ForumTab admin={admin} />}
          {tab === "blog" && <BlogTab admin={admin} />}
          {tab === "availability" && <AvailabilityTab admin={admin} />}
        </main>
      </div>
    </div>
  );
}