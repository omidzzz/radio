import { NextResponse } from "next/server";

/**
 * Unified API error class for consistent error handling across routes.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static tooManyRequests(message = "Too many requests", retryAfter?: number) {
    const err = new ApiError(429, message);
    if (retryAfter) {
      (err as unknown as { retryAfter?: number }).retryAfter = retryAfter;
    }
    return err;
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}

/**
 * Wrap a route handler with uniform error handling.
 * Catches ApiError and returns proper JSON response.
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        const headers: Record<string, string> = {};
        const retryAfter = (error as unknown as { retryAfter?: number }).retryAfter;
        if (retryAfter) {
          headers["Retry-After"] = String(retryAfter);
        }
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status, headers }
        );
      }

      console.error("Unhandled API error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}