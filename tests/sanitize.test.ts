import { describe, it, expect } from "vitest";
import { sanitizeContent, sanitizeText } from "../lib/sanitize";

describe("HTML sanitization", () => {
  it("should strip script tags", () => {
    const result = sanitizeContent('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain("<script");
    expect(result).toContain("<p>Hello</p>");
  });

  it("should strip javascript: URLs", () => {
    const result = sanitizeContent('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  });

  it("should allow safe HTML tags", () => {
    const result = sanitizeContent("<p><strong>Bold</strong> text</p>");
    expect(result).toContain("<strong>Bold</strong>");
  });

  it("should add nofollow to links", () => {
    const result = sanitizeContent('<a href="https://example.com">Link</a>');
    expect(result).toContain('rel="noopener noreferrer nofollow"');
    expect(result).toContain('target="_blank"');
  });

  it("should strip all HTML from plain text", () => {
    const result = sanitizeText("<b>Name</b> <script>alert(1)</script>");
    expect(result).toBe("Name");
  });

  it("should handle empty input", () => {
    expect(sanitizeContent("")).toBe("");
    expect(sanitizeText("")).toBe("");
  });
});