// ─────────────────────────────────────────────────────────────────────────────
// api-types.ts — Specification-only type definitions.
//
// These types describe the **response shapes** of every API endpoint consumed
// by the three features. They are kept in the specs/ folder as a single source
// of truth for the data contract between frontend and backend.
//
// Verified against the running FastAPI server at /docs on 2026-08-13.
// No `any` or `object` types are used.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Literal union types (shared across all response types)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Whether a movement increased or decreased cash.
 * Values: `"income"` | `"outcome"`.
 */
export type OperationType = "income" | "outcome"

/**
 * Business area a movement belongs to.
 * Values: `"suppliers"` | `"sales"` | `"operational"` | `"administrative"` | `"others"`.
 */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others"

/**
 * Whether the counterpart is a business or a consumer.
 * Values: `"B2B"` | `"B2C"`.
 */
export type BusinessType = "B2B" | "B2C"

/**
 * Granularity used when summarizing periods.
 * Values: `"day"` | `"week"` | `"month"`.
 */
export type GroupBy = "day" | "week" | "month"

// ─────────────────────────────────────────────────────────────────────────────
// Feature 1 — Date range filter (shared across features)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single financial movement as returned by `GET /api/metrics`.
 * Matches the `FinancialMovement` Pydantic model.
 */
export interface FinancialMovement {
  /** ISO 8601 date string, e.g. "2025-08-01". */
  create_date: string
  /** Monetary amount of the movement in USD. */
  amount: number
  /** Whether the movement increased or decreased cash. */
  operation_type: OperationType
  /** Business area the movement belongs to. */
  category: Category
  /** Whether the counterpart is a business or a consumer. */
  business_type: BusinessType
}

/**
 * Response body for `GET /api/metrics/facets`.
 * Lists every value available for each filter dimension.
 * Matches the `MetricsFacets` Pydantic model.
 */
export interface FacetsResponse {
  /** Every operation type present in the dataset. */
  operation_types: OperationType[]
  /** Every business type present in the dataset. */
  business_types: BusinessType[]
  /** Every category present in the dataset. */
  categories: Category[]
  /** Earliest movement date in the dataset, ISO date string. */
  min_date: string
  /** Latest movement date in the dataset, ISO date string. */
  max_date: string
}

/**
 * A single period-over-period summary row for `GET /api/metrics/summary`.
 * Matches the `MetricsSummaryItem` Pydantic model.
 */
export interface MetricsSummaryItem {
  /** Period key, e.g. "2025-08", "2025-W32" or "2025-08-01". */
  period: string
  /** Total income for the period in USD. */
  income: number
  /** Total outcome for the period in USD. */
  outcome: number
  /** Income minus outcome for the period in USD. */
  net: number
}

/**
 * Comparison of net value between two periods for `GET /api/metrics/comparison`.
 * Matches the `MetricsComparison` Pydantic model.
 */
export interface MetricsComparison {
  /** Net value (income - outcome) for the current period in USD. */
  current_period: number
  /** Net value (income - outcome) for the previous period in USD. */
  previous_period: number
  /** Absolute difference between current and previous net in USD. */
  delta_abs: number
  /** Percentage change; `null` when the previous period net was zero. */
  delta_pct: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature 2 — Anomaly alerts table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single outcome alert for `GET /api/metrics/alerts`.
 * Matches the `MetricsAlert` Pydantic model.
 */
export interface AlertEntry {
  /** Period key where the spike occurred, e.g. "2025-12". */
  period: string
  /** Outcome total for the alerted period in USD. */
  outcome_total: number
  /** Average outcome of all prior periods in USD. */
  baseline_average: number
  /** Fractional increase over baseline (0.58 = 58%). */
  increase_ratio: number
}

/**
 * Response body for `GET /api/metrics/alerts`.
 * A list of periods whose outcome spiked above baseline.
 */
export type AlertsResponse = AlertEntry[]

// ─────────────────────────────────────────────────────────────────────────────
// Feature 3 — B2B vs B2C comparison view
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single top-category row for `GET /api/metrics/categories/top`.
 * Matches the `TopCategoryItem` Pydantic model.
 */
export interface CategoryEntry {
  /** Category being aggregated. */
  category: Category
  /** Operation type the aggregation was filtered by. */
  operation_type: OperationType
  /** Aggregated amount for the category in USD. */
  total_amount: number
}

/**
 * Response body for `GET /api/metrics/categories/top`.
 * A ranked list of categories, highest total first.
 */
export type TopCategoriesResponse = CategoryEntry[]