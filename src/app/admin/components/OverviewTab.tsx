"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalMessages: number;
  totalForumPosts: number;
  totalForumReplies: number;
}

interface OverviewTabProps {
  admin: Record<string, any>;
}

export default function OverviewTab({ admin }: OverviewTabProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin-stats", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-text-muted">Loading stats…</div>
    );
  }

  const s = stats!;
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <StatCard title={admin.totalBookings as string} value={s.totalBookings} subtitle={admin.bookings as string} />
      <StatCard title={admin.pendingBookings as string} value={s.pendingBookings} subtitle={admin.bookingRequests as string} />
      <StatCard title={admin.confirmedBookings as string} value={s.confirmedBookings} subtitle="Confirmed" />
      <StatCard title={admin.totalMessages as string} value={s.totalMessages} subtitle={admin.contactMessages as string} />
      <StatCard title={admin.totalForumPosts as string} value={s.totalForumPosts} subtitle={admin.forumPosts as string} />
      <StatCard title={admin.totalForumReplies as string} value={s.totalForumReplies} subtitle={admin.forumReplies as string} />
    </section>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-medium text-text-secondary">{title}</p>
      <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{subtitle}</p>
    </div>
  );
}