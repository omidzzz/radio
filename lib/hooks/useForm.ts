"use client";

import { useState, useCallback, FormEvent } from "react";

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  submitting: boolean;
  error: string;
  success: string;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  setValues: (values: T) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  reset: () => void;
}

export function useForm<T extends object>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error for this field when user types (functional update avoids dependency)
      setErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    []
  );

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      setError("");
      setSuccess("");

      // Validate if validator provided
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setSubmitting(false);
          return;
        }
      }

      try {
        await onSubmit(values);
      } catch (err) {
        console.error("Form submission error:", err);
        setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setError("");
    setSuccess("");
  }, [initialValues]);

  return {
    values,
    errors,
    submitting,
    error,
    success,
    handleChange,
    setValue,
    handleSubmit,
    setValues,
    setError,
    setSuccess,
    reset,
  };
}
