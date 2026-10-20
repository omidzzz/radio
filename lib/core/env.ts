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
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get a validated env var or throw with a clear message.
 */
export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in your environment or .env file.`
    );
  }
  return value;
}

/**
 * Get an optional env var with a default.
 */
export function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}