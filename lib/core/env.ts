/**
 * Environment variable validation.
 * Fails fast at startup with clear error messages if required vars are missing.
 */

const requiredVars = [
  "SESSION_SECRET",
  "ADMIN_PASSWORD",
] as const;

const optionalVars = [
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_PATH",
] as const;

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const key of requiredVars) {
    const value = process.env[key];
    if (!value) {
      errors.push(
        `${key} is required. Set it in your environment or .env file.`
      );
    } else if (key === "SESSION_SECRET" && value.length < 32) {
      errors.push(
        "SESSION_SECRET must be at least 32 characters long for security."
      );
    }
  }

  // Warn on trivially weak passwords (the deployed .env used 123456)
  if (process.env.ADMIN_PASSWORD) {
    const trimmed = process.env.ADMIN_PASSWORD.trim();
    if (trimmed.length < 8 || trimmed === "123456" || trimmed === "admin123") {
      errors.push(
        "ADMIN_PASSWORD is too weak. Use a long, random password (at least 8 characters)."
      );
    }
  }

  // Validate URL format if provided
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      new URL(appUrl);
    } catch {
      errors.push(
        "NEXT_PUBLIC_APP_URL must be a valid URL (e.g., https://example.com)"
      );
    }

    // Guard against the well-known placeholder domain
    if (appUrl === "https://yourdomain.com") {
      errors.push(
        "NEXT_PUBLIC_APP_URL is still set to the placeholder 'https://yourdomain.com'. " +
          "Set it to your real domain in your deployment environment (no trailing slash)."
      );
    }
  }

  // Enforce production environment
  if (process.env.NODE_ENV === "production") {
    if (errors.length === 0 && !process.env.NEXT_PUBLIC_APP_URL) {
      errors.push(
        "NEXT_PUBLIC_APP_URL is required in production (it is used for canonical URLs, " +
          "sitemap, RSS, and JSON-LD). Set it in your deployment environment."
      );
    }
  } else if (process.env.NODE_ENV !== "development") {
    errors.push(
      `NODE_ENV is set to '${process.env.NODE_ENV}'. Expected 'development' or 'production'.`
    );
  }

  return { valid: errors.length === 0, errors };
}

/** Get a validated env var or throw with a clear message. */
export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in your environment or .env file.`
    );
  }
  return value;
}

/** Get an optional env var with a default. */
export function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
