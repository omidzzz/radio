"use client";

/**
 * Honeypot field for spam protection.
 * Hidden from real users but visible to bots.
 * If filled, the form submission should be silently rejected.
 */
export default function Honeypot() {
  return (
    <div
      className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden"
      aria-hidden="true"
    >
      <label htmlFor="website_field">
        Leave this field empty
        <input
          type="text"
          id="website_field"
          name="website_field"
          tabIndex={-1}
          autoComplete="off"
          className="h-0 w-0 border-0 p-0"
        />
      </label>
    </div>
  );
}