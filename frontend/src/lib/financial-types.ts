// ─────────────────────────────────────────────────────────────────────────────
// Types grounded in the real backend API responses.
// Verified against the running FastAPI server (open /docs on the backend).
// No `any` or `object` types are used anywhere in this file.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single financial movement as returned by the backend.
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

/**
 * Response body for `GET /api/metrics/alerts`.
 * A list of periods whose outcome spiked above baseline.
 */
export type AlertsResponse = AlertEntry[]

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
// Request parameter types.
// All query parameters accepted by the backend endpoints.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared date-range filter used by most metrics endpoints.
 * Both bounds are inclusive ISO date strings (`YYYY-MM-DD`).
 */
export interface DateRangeFilter {
  /** Inclusive lower bound, ISO date string `YYYY-MM-DD`. */
  start_date?: string
  /** Inclusive upper bound, ISO date string `YYYY-MM-DD`. */
  end_date?: string
}

/**
 * Query parameters for `GET /api/metrics/alerts`.
 */
export interface AlertsParams {
  /** Fractional outcome-increase threshold; defaults to `0.3`. */
  threshold?: number
  /** Granularity of the periods compared; defaults to `month`. */
  group_by?: GroupBy
  /** Inclusive lower bound, ISO date string `YYYY-MM-DD`. */
  start_date?: string
  /** Inclusive upper bound, ISO date string `YYYY-MM-DD`. */
  end_date?: string
  /** Optional filter to restrict alerts to one business type. */
  business_type?: BusinessType
}

/**
 * Query parameters for `GET /api/metrics/categories/top`.
 */
export interface TopCategoriesParams {
  /** Operation type to aggregate; defaults to `outcome`. */
  operation_type?: OperationType
  /** Maximum number of categories returned; 1..20, defaults to 5. */
  limit?: number
  /** Inclusive lower bound, ISO date string `YYYY-MM-DD`. */
  start_date?: string
  /** Inclusive upper bound, ISO date string `YYYY-MM-DD`. */
  end_date?: string
  /** Optional filter to restrict aggregation to one business type. */
  business_type?: BusinessType
}

// ─────────────────────────────────────────────────────────────────────────────
// Literal union types matching backend enums.
// ─────────────────────────────────────────────────────────────────────────────

/** Whether a movement increased or decreased cash. */
export type OperationType = "income" | "outcome"

/** Business area a movement belongs to. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others"

/** Whether the counterpart is a business or a consumer. */
export type BusinessType = "B2B" | "B2C"

/** Granularity used when summarizing periods. */
export type GroupBy = "day" | "week" | "month"

// ─────────────────────────────────────────────────────────────────────────────
// Derived / computed types used by the UI layer.
// (Not returned directly by any single endpoint.)
// ─────────────────────────────────────────────────────────────────────────────

/** Aggregated key performance indicators for the dashboard. */
export interface KPIMetrics {
  /** Sum of all income movements in USD. */
  totalIncome: number
  /** Sum of all outcome movements in USD. */
  totalOutcome: number
  /** Income minus outcome in USD. */
  profit: number
  /** Profit as a percentage of total income (0-100). */
  profitPercent: number
}

/** A single month's aggregated values for charting. */
export interface MonthlyDataPoint {
  /** Human-readable month label, e.g. "Dec 2025". */
  month: string
  /** Total income for the month in USD. */
  income: number
  /** Total outcome for the month in USD. */
  outcome: number
  /** Profit as a percentage of the month's income (0-100). */
  profitPercent: number
}
