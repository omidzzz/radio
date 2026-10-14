import { describe, it, expect } from "vitest";
import { formatDate, formatShortDate, formatRelativeTime } from "../lib/i18n/dates";

describe("Date formatting", () => {
  const testDate = new Date("2026-08-15T10:30:00Z");

  it("should format date in Farsi with Persian calendar", () => {
    const result = formatDate(testDate, "fa");
    // Should contain Farsi digits (۰-۹)
    expect(result).toMatch(/[۰-۹]/);
  });

  it("should format date in English with Gregorian calendar", () => {
    const result = formatDate(testDate, "en");
    expect(result).toContain("2026");
    expect(result).toContain("August");
  });

  it("should format short date in Farsi", () => {
    const result = formatShortDate(testDate, "fa");
    expect(result).toMatch(/[۰-۹]/);
  });

  it("should format short date in English", () => {
    const result = formatShortDate(testDate, "en");
    expect(result).toContain("2026");
  });

  it("should return empty string for invalid date", () => {
    expect(formatDate("invalid-date", "fa")).toBe("");
    expect(formatDate("invalid-date", "en")).toBe("");
  });

  it("should format relative time", () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const result = formatRelativeTime(past, "en");
    expect(result).toContain("3");
  });
});