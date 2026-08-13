// ─────────────────────────────────────────────────────────────────────────────
// param-types.ts — Specification-only request parameter types.
//
// Every query parameter object that the three features send to the backend.
// All types are strict (no `any`, no `object`) and every field has a JSDoc
// annotation documenting its meaning, valid values, and format.
//
// Verified against the FastAPI OpenAPI spec at /docs on 2026-08-13.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared date-range filter used by most metrics endpoints.
 * Both bounds are inclusive ISO date strings (`YYYY-MM-DD`).
 *
 * When a field is `undefined`, the parameter is omitted from the query string
 * and the API treats it as unbounded.
 */
export interface DateRangeFilter {
  /** Inclusive lower bound, ISO date string `YYYY-MM-DD` format. */
  start_date?: string
  /** Inclusive upper bound, ISO date string `YYYY-MM-DD` format. */
  end_date?: string
}

/**
 * Query parameters for `GET /api/metrics/alerts`.
 * Consumed by Feature 2 — Anomaly alerts table.
 */
export interface AlertsParams {
  /**
   * Fractional outcome-increase threshold.
   * The backend accepts `>= 0` (0 returns every period as an alert).
   * The UI should clamp to `[0.01, 1.0]` before sending.
   * Defaults to `0.3` when omitted.
   */
  threshold?: number
  /**
   * Granularity of the periods compared.
   * One of `"day"`, `"week"`, `"month"`.
   * Defaults to `"month"` when omitted.
   */
  group_by?: "day" | "week" | "month"
  /** Inclusive lower bound, ISO date string `YYYY-MM-DD` format. */
  start_date?: string
  /** Inclusive upper bound, ISO date string `YYYY-MM-DD` format. */
  end_date?: string
  /**
   * Optional filter to restrict alerts to one business type.
   * Values: `"B2B"` | `"B2C"`.
   */
  business_type?: "B2B" | "B2C"
}

/**
 * Query parameters for `GET /api/metrics/categories/top`.
 * Consumed by Feature 3 — B2B vs B2C comparison view.
 */
export interface TopCategoriesParams {
  /**
   * Operation type to aggregate.
   * Values: `"income"` | `"outcome"`.
   * Defaults to `"outcome"` when omitted.
   * For the B2B vs B2C comparison view, this is always `"income"`.
   */
  operation_type?: "income" | "outcome"
  /**
   * Maximum number of categories returned.
   * The backend enforces `>= 1` and `<= 20` (returns HTTP 422 outside this range).
   * Defaults to `5` when omitted.
   */
  limit?: number
  /** Inclusive lower bound, ISO date string `YYYY-MM-DD` format. */
  start_date?: string
  /** Inclusive upper bound, ISO date string `YYYY-MM-DD` format. */
  end_date?: string
  /**
   * Optional filter to restrict aggregation to one business type.
   * Values: `"B2B"` | `"B2C"`.
   * For the comparison view, this is required — one request per business type.
   */
  business_type?: "B2B" | "B2C"
}