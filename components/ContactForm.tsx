"use client";

import { useDictionary } from "@/lib/i18n/client";
import { useForm } from "@/lib/hooks/useForm";
import Honeypot from "./Honeypot";
import { SpinnerIcon } from "@/components/ui/icons";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website_field?: string;
}

const initialValues: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website_field: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm() {
  const dict = useDictionary();

  const {
    values,
    errors,
    submitting,
    error,
    success,
    handleChange,
    handleSubmit,
    setValues,
    setSuccess,
  } = useForm<ContactFormData>({
    initialValues,
    validate: (v) => {
      const errs: Record<string, string> = {};
      if (!v.name.trim()) errs.name = dict.contact.invalidName;
      if (!EMAIL_REGEX.test(v.email.trim()))
        errs.email = dict.contact.invalidEmail;
      if (!v.subject.trim()) errs.subject = dict.contact.invalidSubject;
      if (v.message.trim().length < 10)
        errs.message = dict.contact.invalidMessage;
      return errs;
    },
    onSubmit: async (formData) => {
      // Honeypot check - silently reject if filled
      if (formData.website_field) {
        setSuccess(dict.contact.successMessage);
        setValues(initialValues);
        return;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(dict.contact.successMessage);
      setValues(initialValues);
    },
  });

  const inputClasses = (hasError: boolean) =>
    `w-full rounded-lg border bg-surface px-4 py-2.5 text-text-primary placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      hasError ? "border-danger" : "border-border"
    }`;

  const labelClasses = "mb-1 block text-sm font-medium text-text-primary";

  const fieldError = (name: keyof ContactFormData) =>
    errors[name] ? (
      <p
        id={`${name}-error`}
        className="mt-1.5 text-xs font-medium text-danger"
        role="alert"
      >
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="mod-form border border-border bg-surface p-8 sm:p-10">
      <p className="text-sm leading-relaxed text-text-secondary">
        {dict.contact.formSubtitle}
      </p>

      <Honeypot />

      <div className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClasses}>
              {dict.contact.yourName}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              placeholder={dict.contact.yourNamePlaceholder}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={inputClasses(!!errors.name)}
            />
            {fieldError("name")}
          </div>
          <div>
            <label htmlFor="email" className={labelClasses}>
              {dict.booking.emailAddress}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              value={values.email}
              onChange={handleChange}
              placeholder={dict.booking.emailPlaceholder}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClasses(!!errors.email)}
            />
            {fieldError("email")}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className={labelClasses}>
            {dict.contact.subject}
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={values.subject}
            onChange={handleChange}
            placeholder={dict.contact.subjectPlaceholder}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            className={inputClasses(!!errors.subject)}
          />
          {fieldError("subject")}
        </div>

        <div>
          <label htmlFor="message" className={labelClasses}>
            {dict.contact.message}
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={values.message}
            onChange={handleChange}
            placeholder={dict.contact.messagePlaceholder}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`${inputClasses(!!errors.message)} min-h-[120px] resize-y`}
          />
          {fieldError("message")}
        </div>

        {/* Status announcements for screen readers */}
        <div aria-live="polite">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="rounded-lg border border-positive/30 bg-positive-soft px-4 py-3 text-sm font-medium text-positive"
            >
              {success}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-deep shadow-sm transition-all hover:bg-primary-hover hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting && <SpinnerIcon className="h-4 w-4" />}
          {submitting ? dict.common.sending : dict.common.send}
        </button>
      </div>
    </form>
  );
}