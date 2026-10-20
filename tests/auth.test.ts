import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";

// Mock process.env for tests
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.SESSION_SECRET = "test-secret-key-that-is-at-least-32-characters-long";
  process.env.ADMIN_PASSWORD = "test-password";
});

afterEach(() => {
  process.env = originalEnv;
});

// Import after env setup
import {
  signSession,
  verifySession,
  getAdminPassword,
  getSessionSecret,
} from "../lib/security/auth";

describe("Auth utilities", () => {
  it("should sign and verify a valid session", () => {
    const token = signSession();
    expect(token).toBeDefined();
    expect(verifySession(token)).toBe(true);
  });

  it("should reject an invalid token", () => {
    expect(verifySession("invalid-token")).toBe(false);
    expect(verifySession(undefined)).toBe(false);
  });

  it("should reject a tampered token", () => {
    const token = signSession();
    const parts = token.split(".");
    const tampered = `${parts[0]}.${Buffer.from("tampered").toString("base64url")}`;
    expect(verifySession(tampered)).toBe(false);
  });

  it("should reject expired tokens", () => {
    // Create a token with a past expiry
    const secret = getSessionSecret();
    const payload = JSON.stringify({ exp: Date.now() - 1000 });
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");
    const expiredToken = `${Buffer.from(payload).toString("base64url")}.${signature}`;
    expect(verifySession(expiredToken)).toBe(false);
  });

  it("should get admin password from env", () => {
    expect(getAdminPassword()).toBe("test-password");
  });

  it("should throw if SESSION_SECRET is missing", () => {
    delete process.env.SESSION_SECRET;
    expect(() => getSessionSecret()).toThrow();
  });

  it("should throw if ADMIN_PASSWORD is missing", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(() => getAdminPassword()).toThrow();
  });
});