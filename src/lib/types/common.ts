/**
 * Shared, cross-domain types.
 */

/** A single paginated result set. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Pagination metadata returned alongside a list payload. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** A single availability day slot (mirrors availability_day_slots table). */
export interface DaySlot {
  day_of_week: number;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
}

/** Search result categories across the site. */
export type SearchCategory = "blog" | "forum" | "page";

/** Generic API envelope for error responses. */
export interface ApiErrorBody {
  error: string;
  details?: unknown;
}