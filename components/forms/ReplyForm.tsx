"use client";

import { useRouter } from "next/navigation";
import { useDictionary } from "@/lib/i18n/client";
import Honeypot from "../Honeypot";
import { useForumSubmission } from "@/lib/hooks/useForumSubmission";

const INITIAL_VALUES = {
  author_name: "",
  content: "",
  website_field: "",
};

interface ReplyFormProps {
  postId: number;
}

export default function ReplyForm({ postId }: ReplyFormProps) {
  const router = useRouter();
  const dict = useDictionary();

  const {
    values,
    handleChange,
    submitting,
    error,
    success,
    handleSubmit,
  } = useForumSubmission({
    endpoint: `/api/forum/posts/${postId}/replies`,
    initialValues: INITIAL_VALUES,
    successMessage: dict.forum.successReply,
    // Refresh the server-rendered reply list immediately
    onSuccess: () => router.refresh(),
  });

  const inputClasses =
    "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const labelClasses = "mb-1 block text-sm font-medium text-text-secondary";

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-text-primary">
        {dict.forum.replyTitle}
      </h3>
      <p className="mt-1 text-sm text-text-secondary">
        {dict.forum.replySubtitle}
      </p>

      <Honeypot />

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="reply_author_name" className={labelClasses}>
            {dict.forum.yourName}
          </label>
          <input
            id="reply_author_name"
            name="author_name"
            type="text"
            required
            maxLength={100}
            value={values.author_name}
            onChange={handleChange}
            placeholder={dict.forum.namePlaceholder}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="reply_content" className={labelClasses}>
            {dict.forum.yourReply}
          </label>
          <textarea
            id="reply_content"
            name="content"
            required
            rows={3}
            maxLength={5000}
            value={values.content}
            onChange={handleChange}
            placeholder={dict.forum.replyPlaceholder}
            className={inputClasses}
          />
        </div>

        {/* Dark-theme-aware status alerts */}
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500 ring-1 ring-red-500/25 dark:text-red-400"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400"
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-fill px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-fill-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {submitting ? dict.forum.posting : dict.forum.postReply}
        </button>
      </div>
    </form>
  );
}