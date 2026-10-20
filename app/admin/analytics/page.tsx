"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDictionary, useFarsiDigits } from "@/lib/i18n/client";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatDate } from "@/lib/i18n";
import { csrfHeaders } from "@/lib/http/csrf";
import { toCsv, downloadCsv } from "@/lib/utils/csv";

interface AnalyticsData {
  bookingsOverTime: { day: string; count: number }[];
  messagesOverTime: { day: string; count: number }[];
  postsOverTime: { day: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  sessionTypeBreakdown: { session_type: string; count: number }[];
  recentActivity: { type: string; id: number; title: string; created_at: string }[];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const sessionTypeLabels: Record<string, string> = {
  consultation: "Consultation",
  simulation: "Simulation",
  treatment: "Treatment",
  followup: "Follow-up",
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const dict = useDictionary();
  const toFarsi = useFarsiDigits();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch(`/api/admin/analytics?range=${range}`, {
      headers: csrfHeaders(),
    });
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    const result = await res.json();
    setData(result);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (unauthorized) {
      router.replace("/admin/login");
    }
  }, [unauthorized, router]);

  const exportAnalytics = () => {
    if (!data) return;

    const rows: Record<string, unknown>[] = [];

    data.bookingsOverTime.forEach((item) => {
      rows.push({ section: "Bookings Over Time", day: item.day, count: item.count });
    });
    data.statusBreakdown.forEach((item) => {
      rows.push({ section: "Booking Status", status: item.status, count: item.count });
    });
    data.sessionTypeBreakdown.forEach((item) => {
      rows.push({ section: "Session Types", session_type: item.session_type, count: item.count });
    });
    data.recentActivity.forEach((item) => {
      rows.push({ section: "Recent Activity", type: item.type, id: item.id, title: item.title, created_at: item.created_at });
    });

    const csv = toCsv(rows, [
      { key: "section", label: "Section" },
      { key: "day", label: "Day" },
      { key: "count", label: "Count" },
      { key: "status", label: "Status" },
      { key: "session_type", label: "Session Type" },
      { key: "type", label: "Type" },
      { key: "id", label: "ID" },
      { key: "title", label: "Title" },
      { key: "created_at", label: "Created" },
    ]);
    downloadCsv(`analytics-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-bg">
        <div className="text-lg text-text-secondary">{dict.common.loading}</div>
      </div>
    );
  }

  if (!data) return null;

  const totalBookings = data.bookingsOverTime.reduce((sum, item) => sum + item.count, 0);
  const totalMessages = data.messagesOverTime.reduce((sum, item) => sum + item.count, 0);
  const totalPosts = data.postsOverTime.reduce((sum, item) => sum + item.count, 0);

  const maxBookings = Math.max(...data.bookingsOverTime.map((d) => d.count), 1);
  const maxMessages = Math.max(...data.messagesOverTime.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fill text-lg font-bold text-white">
              A
            </span>
            <div>
              <h1 className="text-lg font-bold text-text-primary">
                {dict.admin.dashboard}
              </h1>
              <p className="text-xs text-muted">
                {dict.admin.clinicManagement}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-gray-200"
            >
              ← {dict.admin.dashboard}
            </Link>
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-gray-100 hover:text-primary"
            >
              {dict.common.viewSite}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-text-primary">
              {dict.admin.analytics}
            </h2>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <button
            onClick={exportAnalytics}
            className="rounded-lg bg-soft px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            📥 Export CSV
          </button>
        </div>

        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">
              {dict.admin.totalBookings}
            </p>
            <p className="mt-2 text-4xl font-bold text-text-primary">
              {toFarsi(totalBookings)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">
              {dict.admin.contactMessages}
            </p>
            <p className="mt-2 text-4xl font-bold text-text-primary">
              {toFarsi(totalMessages)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">
              {dict.admin.forumPosts}
            </p>
            <p className="mt-2 text-4xl font-bold text-text-primary">
              {toFarsi(totalPosts)}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Bookings Over Time
            </h3>
            <div className="space-y-2">
              {data.bookingsOverTime.map((item) => (
                <div key={item.day} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-muted">
                    {new Date(item.day).toLocaleDateString(
                      locale === "fa" ? "fa-IR" : "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-6 rounded bg-gradient-to-r from-primary to-secondary"
                      style={{
                        width: `${(item.count / maxBookings) * 100}%`,
                        minWidth: "2px",
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-text-primary">
                    {toFarsi(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Contact Messages Over Time
            </h3>
            <div className="space-y-2">
              {data.messagesOverTime.map((item) => (
                <div key={item.day} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-muted">
                    {new Date(item.day).toLocaleDateString(
                      locale === "fa" ? "fa-IR" : "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-6 rounded bg-gradient-to-r from-[#145c41] to-[#4c9b7a]"
                      style={{
                        width: `${(item.count / maxMessages) * 100}%`,
                        minWidth: "2px",
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-text-primary">
                    {toFarsi(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Booking Status Breakdown
            </h3>
            <div className="space-y-3">
              {data.statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {statusLabels[item.status] || item.status}
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-sm font-semibold text-primary">
                    {toFarsi(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Session Type Breakdown
            </h3>
            <div className="space-y-3">
              {data.sessionTypeBreakdown.map((item) => (
                <div key={item.session_type} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {sessionTypeLabels[item.session_type] || item.session_type}
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-sm font-semibold text-primary">
                    {toFarsi(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {data.recentActivity.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.type === "booking" ? "📅" : "✉️"}
                  </span>
                  <span className="text-sm text-text-primary">{item.title}</span>
                </div>
                <span className="text-xs text-muted">
                  {formatDate(item.created_at, locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
