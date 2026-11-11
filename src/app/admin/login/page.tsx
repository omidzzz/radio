"use client";

import { useState, useCallback } from "react";
import { useDictionary } from "@/lib/i18n/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/seo/seo";

export default function AdminLoginPage() {
  const dict = useDictionary();
  const router = useRouter();
  const adminDict = dict.admin;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || adminDict.invalidPassword || "Invalid password");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [password, adminDict.invalidPassword, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-md px-6 sm:px-8">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <div className="mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary font-semibold"
            >
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                R
              </span>
              <span>{siteConfig.name || "Dr. Pari Ghadamgahi"}</span>
            </Link>
            <h2 className="mt-4 text-2xl font-bold text-text-primary">
              {adminDict.loginTitle}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {adminDict.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-primary">
                {adminDict.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={adminDict.passwordPlaceholder}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <p className="text-xs text-text-muted">
              {adminDict.defaultPasswordNote}
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary-fill px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-fill-hover disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? adminDict.loggingIn : adminDict.loginButton}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              ← {dict.common.back}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}