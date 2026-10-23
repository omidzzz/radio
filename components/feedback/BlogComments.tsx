"use client";

import { useState } from "react";
import { useLocale } from "../providers/LocaleProvider";
import { formatDate } from "@/lib/i18n";
import type { BlogComment } from "@/lib/types";
import { logger } from "@/lib/core/logger";

interface BlogCommentsProps {
  postId: number;
  initialComments?: BlogComment[];
}

export default function BlogComments({
  postId,
  initialComments = [],
}: BlogCommentsProps) {
  const { locale } = useLocale();
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/blog/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: authorName, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to post comment");
        setSubmitting(false);
        return;
      }

      // Comments are held for moderation — show a notice instead of
      // appending the unapproved comment to the visible list.
      setAuthorName("");
      setContent("");
      setSuccess(
        data.message ||
          "نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود"
      );
      setTimeout(() => setSuccess(""), 6000);
    } catch (err) {
      logger.error("Error posting comment", { error: err });
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-border bg-soft/50 px-4 py-2.5 text-text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";

  return (
    <div>
      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-border/70 bg-soft/40 p-5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/20">
                  {comment.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-text-primary">
                    {comment.authorName}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(comment.createdAt, locale)}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state — invites the first comment instead of dead space */}
      {comments.length === 0 && (
        <div className="mb-8 flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-soft/30 px-6 py-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h8M8 14h5m-9 6V6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H7l-3 3z"
              />
            </svg>
          </span>
          <p className="mt-3 text-sm font-medium text-text-primary">
            {locale === "fa" ? "هنوز دیدگاهی ثبت نشده است" : "No comments yet"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {locale === "fa"
              ? "اولین نفر باشید و دیدگاه خود را با ما به اشتراک بگذارید."
              : "Be the first to share your thoughts."}
          </p>
        </div>
      )}

      {/* Comment form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/70 bg-soft/30 p-5 sm:p-6"
      >
        <h3 className="text-lg font-semibold text-text-primary">ارسال نظر</h3>
        <p className="mt-1 text-sm text-text-secondary">
          دیدگاه خود را درباره این مقاله بنویسید
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="comment_author"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              نام شما
            </label>
            <input
              id="comment_author"
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="نام شما"
              className={inputClasses}
            />
          </div>

          <div>
            <label
              htmlFor="comment_content"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              نظر شما
            </label>
            <textarea
              id="comment_content"
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              className={inputClasses}
            />
          </div>

          {/* aria-live so screen readers announce submission feedback */}
          <div aria-live="polite">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary-fill px-6 py-2.5 text-sm font-semibold text-on-primary shadow-[0_0_20px_-6px_rgba(26,115,82,0.45)] transition hover:bg-primary-fill-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "در حال ارسال..." : "ارسال نظر"}
          </button>
        </div>
      </form>
    </div>
  );
}
