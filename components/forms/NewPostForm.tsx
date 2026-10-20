"use client";

import { useRouter } from "next/navigation";
import { useDictionary } from "@/lib/i18n/client";
import Honeypot from "../Honeypot";
import { useForumSubmission } from "@/lib/hooks/useForumSubmission";

const INITIAL_VALUES = {
  author_name: "",
  title: "",
  content: "",
  category: "general",
  website_field: "",
};

export default function NewPostForm() {
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
    endpoint: "/api/forum/posts",
    initialValues: INITIAL_VALUES,
    successMessage: dict.forum.successPost,
    // Navigate to the freshly created topic so the author sees it immediately
    onSuccess: (data) => {
      const post = (data as { post?: { id?: number } }).post;
      if (post?.id) router.push(`/forum/${post.id}`);
      else router.refresh();
    },
  });

  const categories = Object.entries(dict.forum.categories).map(
    ([value, label]) => ({ value, label })
  );

  const inputClasses =
    "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const labelClasses = "mb-1 block text-sm font-medium text-text-secondary";

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-text-primary">
        {dict.forum.newQuestionTitle}
      </h3>
      <p className="mt-1 text-sm text-text-secondary">
        {dict.forum.newQuestionSubtitle}
      </p>

      <Honeypot />

      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="author_name" className={labelClasses}>
              {dict.forum.yourName}
            </label>
            <input
              id="author_name"
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
            <label htmlFor="category" className={labelClasses}>
              {dict.forum.category}
            </label>
            <select
              id="category"
              name="category"
              value={values.category}
              onChange={handleChange}
              className={inputClasses}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="title" className={labelClasses}>
            {dict.forum.questionTitle}
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={300}
            value={values.title}
            onChange={handleChange}
            placeholder={dict.forum.questionTitlePlaceholder}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="content" className={labelClasses}>
            {dict.forum.yourQuestion}
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={4}
            maxLength={10000}
            value={values.content}
            onChange={handleChange}
            placeholder={dict.forum.questionPlaceholder}
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-fill px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-fill-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
          {submitting ? dict.forum.posting : dict.forum.postQuestion}
        </button>
      </div>
    </form>
  );
}