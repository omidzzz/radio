"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/lib/i18n/client";
import { logger } from "@/lib/core/logger";

export default function AdminLoginForm() {
  const router = useRouter();
  const dict = useDictionary();
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, totpCode: totpCode || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requires2fa) setNeedsTotp(true);
        setError(data.error || dict.admin.invalidPassword);
        setSubmitting(false);
        return;
      }

      // Store CSRF token from response header for subsequent admin API calls
      const csrfToken = response.headers.get("X-CSRF-Token");
      if (csrfToken) {
        sessionStorage.setItem("admin_csrf_token", csrfToken);
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      logger.error("Error during login", { error: err });
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-fill text-2xl font-bold text-white">
          A
        </div>
        <h1 className="mt-4 text-2xl font-bold text-text-primary">
          {dict.admin.loginTitle}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {dict.admin.loginSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-text-primary"
          >
            {dict.admin.password}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={dict.admin.passwordPlaceholder}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-text-primary placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {needsTotp && (
          <div>
            <label
              htmlFor="totp"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              {dict.admin.totpLabel}
            </label>
            <input
              id="totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              placeholder={dict.admin.totpPlaceholder}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 font-mono tracking-[0.3em] text-text-primary placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary-fill px-8 py-3 text-base font-semibold text-white transition hover:bg-primary-fill-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? dict.admin.loggingIn : dict.admin.loginButton}
        </button>

        <p className="text-center text-xs text-muted">
          {dict.admin.defaultPasswordNote}
        </p>
      </form>
    </div>
  );
}