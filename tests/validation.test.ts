import { describe, it, expect } from "vitest";
import { validateBooking } from "../lib/validation/booking";
import { validateContact } from "../lib/validation/contact";
import { validateForumPost, validateForumReply } from "../lib/validation/forum";

describe("Booking validation", () => {
  it("should accept valid booking data", () => {
    const result = validateBooking({
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      session_type: "initial-consultation",
      preferred_date: "2026-08-15",
      preferred_time: "10:00",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = validateBooking({
      full_name: "John Doe",
      email: "invalid-email",
      phone: "+1234567890",
      session_type: "initial-consultation",
      preferred_date: "2026-08-15",
      preferred_time: "10:00",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("should reject missing required fields", () => {
    const result = validateBooking({
      full_name: "",
      email: "",
      phone: "",
      session_type: "initial-consultation",
      preferred_date: "",
      preferred_time: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("Contact validation", () => {
  it("should accept valid contact data", () => {
    const result = validateContact({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Question about treatment",
      message: "I have a question about radiation therapy.",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = validateContact({
      name: "Jane Doe",
      email: "not-an-email",
      subject: "Test",
      message: "Hello",
    });
    expect(result.success).toBe(false);
  });
});

describe("Forum validation", () => {
  it("should accept valid forum post", () => {
    const result = validateForumPost({
      author_name: "Sarah",
      title: "What to expect?",
      content: "I'm nervous about my first session.",
      category: "treatment",
    });
    expect(result.success).toBe(true);
  });

  it("should default category to general", () => {
    const result = validateForumPost({
      author_name: "Sarah",
      title: "Hello",
      content: "Just saying hi.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("general");
    }
  });

  it("should reject invalid category", () => {
    const result = validateForumPost({
      author_name: "Sarah",
      title: "Hello",
      content: "Just saying hi.",
      category: "invalid-category",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid forum reply", () => {
    const result = validateForumReply({
      post_id: 1,
      author_name: "John",
      content: "Great question!",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid post_id", () => {
    const result = validateForumReply({
      post_id: -1,
      author_name: "John",
      content: "Great question!",
    });
    expect(result.success).toBe(false);
  });
});