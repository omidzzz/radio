"use client";

import { useState } from "react";

interface UseForumSubmissionOptions<T extends Record<string, string>> {
  /** API endpoint to POST the form values to */
  endpoint: string;
  /** Initial (and reset) values — must include the `website_field` honeypot */
  initialValues: T;
  /** Localized success message shown after a successful submit */
  successMessage: string;
  /** Called with the parsed JSON response after a successful submit */
  onSuccess?: (data: unknown) => void;
}

/**
 * Shared state + submission logic for the anonymous forum forms
 * (new post / reply). Handles the honeypot field, pending state,
 * error/success messaging, and form reset.
 */
export function useForumSubmission<T extends Record<string, string>>({
  endpoint,
  initialValues,
  successMessage,
  onSuccess,
}: UseForumSubmissionOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetValues = () => setValues(initialValues);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Honeypot check — silently accept bot submissions
      if (values.website_field) {
        setSuccess(successMessage);
        resetValues();
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit. Please try again.");
        return;
      }

      setSuccess(successMessage);
      resetValues();
      onSuccess?.(data);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Forum submission error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return { values, handleChange, submitting, error, success, handleSubmit };
}