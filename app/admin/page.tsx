"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDictionary, getSessionTypeLabel, getStatusLabel, useFarsiDigits } from "@/lib/i18n/client";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatDate } from "@/lib/i18n";
import { csrfHeaders } from "@/lib/http/csrf";
import AvailabilityManager from "@/components/admin/AvailabilityManager";
import { toCsv, downloadCsv } from "@/lib/utils/csv";

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalForumPosts: number;
  totalForumReplies: number;
  totalMessages: number;
}

interface Booking {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  created_at: string;
}

interface ForumReply {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  is_admin: number;
  created_at: string;
}

interface ForumPost {
  id: number;
  author_name: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  reply_count?: number;
  replies?: ForumReply[];
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface BlogPost {
  id: number;
  title_fa: string;
  title_en: string;
  excerpt_fa: string;
  author_fa: string;
  category_fa: string;
  is_published: number;
  published_at: string;
  created_at: string;
}

type Tab = "overview" | "bookings" | "forum" | "blog" | "messages" | "availability";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const dict = useDictionary();
  const toFarsi = useFarsiDigits();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    const data = await res.json();
    setStats(data.stats);
  }, []);

  const fetchBookings = useCallback(async () => {
    const res = await fetch("/api/admin/bookings");
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    const data = await res.json();
    setBookings(data.bookings);
  }, []);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/forum");
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    const data = await res.json();
    setPosts(data.posts);
  }, []);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/admin/messages");
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    const data = await res.json();
    setMessages(data.messages);
  }, []);

  const fetchBlogPosts = useCallback(async () => {
    const res = await fetch("/api/admin/blog");
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    const data = await res.json();
    setBlogPosts(data.posts);
  }, []);

  // Initial auth check + load all data in parallel
  useEffect(() => {
    async function loadAll() {
      // Single stats fetch doubles as the auth check
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStats(data.stats);

      // Fetch remaining data in parallel
      await Promise.all([
        fetchBookings(),
        fetchPosts(),
        fetchMessages(),
        fetchBlogPosts(),
      ]);
      setLoading(false);
    }
    loadAll();
  }, [fetchBookings, fetchPosts, fetchMessages, fetchBlogPosts]);

  // Redirect to login if unauthorized
  useEffect(() => {
    if (unauthorized) {
      router.replace("/admin/login");
    }
  }, [unauthorized, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const updateBookingStatus = async (id: number, status: string) => {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: csrfHeaders(),
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      fetchBookings();
      fetchStats();
    }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm(dict.admin.deleteBookingConfirm)) return;
    const res = await fetch(`/api/admin/bookings?id=${id}`, {
      method: "DELETE",
      headers: csrfHeaders(),
    });
    if (res.ok) {
      fetchBookings();
      fetchStats();
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm(dict.admin.deletePostConfirm)) return;
    const res = await fetch(`/api/admin/forum?id=${id}`, {
      method: "DELETE",
      headers: csrfHeaders(),
    });
    if (res.ok) {
      fetchPosts();
      fetchStats();
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm(dict.admin.deleteMessageConfirm)) return;
    const res = await fetch(`/api/admin/messages?id=${id}`, {
      method: "DELETE",
      headers: csrfHeaders(),
    });
    if (res.ok) {
      fetchMessages();
      fetchStats();
    }
  };

  const deleteBlogPost = async (id: number) => {
    if (!confirm("Delete this blog post?")) return;
    const res = await fetch(`/api/blog/${id}`, {
      method: "DELETE",
      headers: csrfHeaders(),
    });
    if (res.ok) {
      fetchBlogPosts();
    }
  };

  // CSV export handlers
  const exportBookings = () => {
    const csv = toCsv(bookings, [
      { key: "id", label: "ID" },
      { key: "full_name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "session_type", label: "Session Type" },
      { key: "preferred_date", label: "Date" },
      { key: "preferred_time", label: "Time" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Notes" },
      { key: "created_at", label: "Submitted" },
    ]);
    downloadCsv(`bookings-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const exportMessages = () => {
    const csv = toCsv(messages, [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "subject", label: "Subject" },
      { key: "message", label: "Message" },
      { key: "created_at", label: "Submitted" },
    ]);
    downloadCsv(`messages-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const exportForumPosts = () => {
    const csv = toCsv(posts, [
      { key: "id", label: "ID" },
      { key: "author_name", label: "Author" },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "content", label: "Content" },
      { key: "reply_count", label: "Replies" },
      { key: "created_at", label: "Created" },
    ]);
    downloadCsv(`forum-posts-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const [replyForms, setReplyForms] = useState<{ [key: number]: boolean }>({});
  const [replyContents, setReplyContents] = useState<{ [key: number]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<{ [key: number]: boolean }>({});

  const toggleReplyForm = (postId: number) => {
    setReplyForms((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleReplyChange = (postId: number, content: string) => {
    setReplyContents((prev) => ({ ...prev, [postId]: content }));
  };

  const submitAdminReply = async (postId: number) => {
    const content = replyContents[postId]?.trim();
    if (!content) return;

    setSubmittingReply((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch("/api/admin/forum/replies", {
        method: "POST",
        headers: csrfHeaders(),
        body: JSON.stringify({ post_id: postId, content }),
      });

      if (res.ok) {
        setReplyContents((prev) => ({ ...prev, [postId]: "" }));
        setReplyForms((prev) => ({ ...prev, [postId]: false }));
        fetchPosts();
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const deleteReply = async (replyId: number, postId: number) => {
    if (!confirm("Delete this reply?")) return;
    const res = await fetch(`/api/admin/forum/replies?id=${replyId}`, {
      method: "DELETE",
      headers: csrfHeaders(),
    });
    if (res.ok) {
      fetchPosts();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-bg">
        <div className="text-lg text-text-secondary">{dict.common.loading}</div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: dict.admin.overview },
    { key: "bookings", label: `${dict.admin.bookings} (${bookings.length})` },
    { key: "forum", label: `${dict.admin.forumPosts} (${posts.length})` },
    { key: "blog", label: `${dict.admin.blogPosts} (${blogPosts.length})` },
    { key: "messages", label: `${dict.admin.messages} (${messages.length})` },
    { key: "availability", label: dict.admin.availability },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fill text-lg font-bold text-on-primary">
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
              href="/admin/seo-audit"
              className="rounded-lg bg-soft px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
            >
              📊 {dict.admin.analytics}
            </Link>
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-gray-100 hover:text-primary"
            >
              {dict.common.viewSite}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-gray-200"
            >
              {dict.common.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-primary-fill text-on-primary"
                  : "bg-surface text-text-secondary hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-text-primary">
              {dict.admin.overview}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-medium text-muted">
                  {dict.admin.totalBookings}
                </p>
                <p className="mt-2 text-4xl font-bold text-text-primary">
                  {toFarsi(stats.totalBookings)}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <p className="text-sm font-medium text-amber-700">
                  {dict.admin.pendingBookings}
                </p>
                <p className="mt-2 text-4xl font-bold text-amber-800">
                  {toFarsi(stats.pendingBookings)}
                </p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <p className="text-sm font-medium text-green-700">
                  {dict.admin.confirmedBookings}
                </p>
                <p className="mt-2 text-4xl font-bold text-green-800">
                  {toFarsi(stats.confirmedBookings)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-medium text-muted">
                  {dict.admin.forumPosts}
                </p>
                <p className="mt-2 text-4xl font-bold text-text-primary">
                  {toFarsi(stats.totalForumPosts)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-medium text-muted">
                  {dict.admin.forumReplies}
                </p>
                <p className="mt-2 text-4xl font-bold text-text-primary">
                  {toFarsi(stats.totalForumReplies)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-medium text-muted">
                  {dict.admin.contactMessages}
                </p>
                <p className="mt-2 text-4xl font-bold text-text-primary">
                  {toFarsi(stats.totalMessages)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">
                {dict.admin.bookingRequests}
              </h2>
              {bookings.length > 0 && (
                <button
                  onClick={exportBookings}
                  className="rounded-lg bg-soft px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  📥 Export CSV
                </button>
              )}
            </div>
            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <div className="text-4xl">📅</div>
                <p className="mt-4 text-text-secondary">{dict.admin.noBookings}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-text-primary">
                            #{booking.id} — {booking.full_name}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}
                          >
                            {getStatusLabel(booking.status, dict)}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm text-text-secondary sm:grid-cols-2">
                          <p>
                            <span className="font-medium text-text-primary">
                              {dict.admin.email}{" "}
                            </span>
                            {booking.email}
                          </p>
                          <p>
                            <span className="font-medium text-text-primary">
                              {dict.admin.phone}{" "}
                            </span>
                            {booking.phone}
                          </p>
                          <p>
                            <span className="font-medium text-text-primary">
                              {dict.admin.session}{" "}
                            </span>
                            {getSessionTypeLabel(booking.session_type, dict)}
                          </p>
                          <p>
                            <span className="font-medium text-text-primary">
                              {dict.admin.preferred}{" "}
                            </span>
                            {booking.preferred_date} at {booking.preferred_time}
                          </p>
                          {booking.notes && (
                            <p className="sm:col-span-2">
                              <span className="font-medium text-text-primary">
                                {dict.admin.notes}{" "}
                              </span>
                              {booking.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted">
                            {dict.admin.submitted} {formatDate(booking.created_at, locale)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {booking.status !== "confirmed" && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                          >
                            {dict.common.confirm}
                          </button>
                        )}
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            className="rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                          >
                            {dict.common.cancel}
                          </button>
                        )}
                        {booking.status !== "completed" && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, "completed")}
                            className="rounded-lg bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                          >
                            {dict.common.complete}
                          </button>
                        )}
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-red-100 hover:text-red-700"
                        >
                          {dict.common.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Forum Tab */}
        {activeTab === "forum" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">
                {dict.admin.forumModeration}
              </h2>
              {posts.length > 0 && (
                <button
                  onClick={exportForumPosts}
                  className="rounded-lg bg-soft px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  📥 Export CSV
                </button>
              )}
            </div>
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <div className="text-4xl">💬</div>
                <p className="mt-4 text-text-secondary">{dict.admin.noPosts}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          {dict.admin.by}{" "}
                          <span className="font-medium text-text-primary">{post.author_name}</span> ·{" "}
                          {formatDate(post.created_at, locale)} · {post.replies?.length ?? 0}{" "}
                          {dict.forum.replies}
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                          {post.content}
                        </p>
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="shrink-0 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                      >
                        {dict.common.delete}
                      </button>
                    </div>

                    {/* Replies Section */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-6 space-y-3 border-t border-border pt-4">
                        <h4 className="text-sm font-semibold text-text-primary">
                          Replies ({post.replies.length})
                        </h4>
                        {post.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`rounded-lg p-4 ${
                              reply.is_admin
                                ? "bg-blue-50 border-2 border-blue-200"
                                : "bg-gray-50 border border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-text-primary">
                                    {reply.author_name}
                                  </span>
                                  {reply.is_admin && (
                                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                                      Admin
                                    </span>
                                  )}
                                  <span className="text-xs text-muted">
                                    {formatDate(reply.created_at, locale)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-text-secondary">
                                  {reply.content}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteReply(reply.id, post.id)}
                                className="shrink-0 rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                              >
                                {dict.common.delete}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Admin Reply Form */}
                    <div className="mt-4 border-t border-border pt-4">
                      {replyForms[post.id] ? (
                        <div className="space-y-3">
                          <textarea
                            value={replyContents[post.id] || ""}
                            onChange={(e) => handleReplyChange(post.id, e.target.value)}
                            placeholder="Write your reply as Admin..."
                            className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => submitAdminReply(post.id)}
                              disabled={submittingReply[post.id]}
                              className="rounded-lg bg-primary-fill px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-fill-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingReply[post.id] ? "Posting..." : "Post Reply as Admin"}
                            </button>
                            <button
                              onClick={() => toggleReplyForm(post.id)}
                              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleReplyForm(post.id)}
                          className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          + Reply as Admin
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">
                {dict.admin.blogPosts}
              </h2>
              <Link
                href="/admin/blog/new"
                className="rounded-lg bg-primary-fill px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-fill-hover"
              >
                + New Post
              </Link>
            </div>
            {blogPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <div className="text-4xl">📝</div>
                <p className="mt-4 text-text-secondary">No blog posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {post.title_fa}
                          </h3>
                          {post.title_en && (
                            <span className="text-sm text-muted">
                              ({post.title_en})
                            </span>
                          )}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              post.is_published
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {post.is_published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          <span className="font-medium text-text-primary">
                            {post.author_fa}
                          </span>{" "}
                          · {post.category_fa} · {formatDate(post.created_at, locale)}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                          {post.excerpt_fa}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="rounded-lg bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteBlogPost(post.id)}
                          className="rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <AvailabilityManager />
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">
                {dict.admin.messages}
              </h2>
              {messages.length > 0 && (
                <button
                  onClick={exportMessages}
                  className="rounded-lg bg-soft px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  📥 Export CSV
                </button>
              )}
            </div>
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <div className="text-4xl">✉️</div>
                <p className="mt-4 text-text-secondary">{dict.admin.noMessages}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {message.subject}
                          </h3>
                          <span className="rounded-full bg-soft px-3 py-1 text-xs font-medium text-primary">
                            {formatDate(message.created_at, locale)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          {dict.admin.from}{" "}
                          <span className="font-medium text-text-primary">{message.name}</span> ·{" "}
                          <a
                            href={`mailto:${message.email}`}
                            className="text-primary hover:text-primary-hover"
                          >
                            {message.email}
                          </a>
                        </p>
                        <p className="mt-3 whitespace-pre-line text-sm text-text-secondary">
                          {message.message}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="shrink-0 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                      >
                        {dict.common.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
