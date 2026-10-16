"use client";

import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  /** Position in the list — renders the Q.00n channel index */
  index?: number;
}

export default function FAQItem({
  question,
  answer,
  defaultOpen = false,
  index = 0,
}: FAQItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-surface transition-colors duration-200 hover:border-primary/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
        aria-expanded={open}
      >
        <span className="flex items-baseline gap-4">
          <span className="readout__label shrink-0 text-primary">
            Q.{String(index + 1).padStart(3, "0")}
          </span>
          <span className="font-semibold text-text-primary">{question}</span>
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-soft text-primary transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 leading-relaxed text-text-secondary">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}