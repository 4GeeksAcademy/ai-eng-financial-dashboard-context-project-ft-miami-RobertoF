# Financial Dashboard — Data Contract Documentation

> Verified against the running FastAPI backend at `/docs` and through direct
> API calls. All endpoint paths, response shapes, parameter constraints, and
> edge-case behaviors described below match the **actual** implementation.

---

## Feature 1 — Date range filter on the home dashboard

### Endpoint consumed

| Purpose | Endpoint | Method |
|---------|----------|--------|
| Available date range hint | `GET /api/metrics/facets` | `GET` |
| Filtered data | `GET /api/metrics` (+ optional `start_date`, `end_date`) | `GET` |

### TypeScript types used

- **Request:** `DateRangeFilter` (from `frontend/specs/param-types.ts`)
- **Response — facets:** `FacetsResponse` (from `frontend/specs/api-types.ts`)
- **Response — movements:** `FinancialMovement[]` (from `frontend/specs/api-types.ts`)

### `DateRangeFilter`

```
interface DateRangeFilter {
  /** Inclusive lower bound, ISO date string YYYY-MM-DD format. */
  start_date?: string
  /** Inclusive upper bound, ISO date string YYYY-MM-DD format. */
  end_date?: string
}
```

### Parameter constraints

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `start_date` | `string` (ISO date) | No | `null` | Must be `YYYY-MM-DD`. When absent, no lower bound is applied. |
| `end_date` | `string` (ISO date) | No | `null` | Must be `YYYY-MM-DD`. When absent, no upper bound is applied. |

### Response shape: `FacetsResponse`

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-08-01",
  "max_date": "2026-07-28"
}
```

### Edge cases

| # | Scenario | Expected UI behavior |
|---|----------|---------------------|
| 1 | **Only start_date filled in** | The API returns all movements on or after `start_date`. The date input shows the selected value, the end input is empty. The range hint still shows the full available range from facets. |
| 2 | **Only end_date filled in** | The API returns all movements on or before `end_date`. Same as above but the start input is empty. |
| 3 | **start_date > end_date** | The API still processes the request; it returns an empty result set because no movement satisfies `start_date >= x >= end_date`. Every consuming component must render its empty state. |
| 4 | **Both dates empty** | `start_date` and `end_date` are omitted from the query string. The API returns the full 360-movement dataset. No empty state is shown. |
| 5 | **Invalid date string typed** | The `<input type="date">` element natively prevents submitting non-date values. The browser's built-in validation catches malformed input before the callback fires. |

---

## Feature 2 — Anomaly alerts table

### Endpoint consumed

| Purpose | Endpoint | Method |
|---------|----------|--------|
| Spending anomaly alerts | `GET /api/metrics/alerts` | `GET` |

### TypeScript types used

- **Request:** `AlertsParams` (extends `DateRangeFilter`)
- **Response item:** `AlertEntry`
- **Response body:** `AlertsResponse` (= `AlertEntry[]`)

### `AlertsParams`

```typescript
interface AlertsParams {
  /** Fractional outcome-increase threshold; defaults to 0.3. */
  threshold?: number
  /** Granularity of the periods compared; defaults to "month". */
  group_by?: GroupBy
  /** Inclusive lower bound, ISO date string YYYY-MM-DD format. */
  start_date?: string
  /** Inclusive upper bound, ISO date string YYYY-MM-DD format. */
  end_date?: string
  /** Optional filter to restrict alerts to one business type. */
  business_type?: BusinessType
}
```

### Parameter constraints

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `threshold` | `number` | No | `0.3` | `>= 0` (backend). Values >= 0.01 recommended; values below 1 trigger many false positives. Value `0` returns every period. **Values below 0 return HTTP 422.** |
| `group_by` | `string` | No | `"month"` | One of `"day"`, `"week"`, `"month"`. |
| `start_date` | `string` (ISO date) | No | `null` | Same as Feature 1. |
| `end_date` | `string` (ISO date) | No | `null` | Same as Feature 1. |
| `business_type` | `string` | No | `null` | `"B2B"` or `"B2C"`. |

### Response shape: `AlertEntry`

```json
{
  "period": "2025-12",
  "outcome_total": 103378.98,
  "baseline_average": 65227.42,
  "increase_ratio": 0.5849
}
```

### Edge cases

| # | Scenario | Expected UI behavior |
|---|----------|---------------------|
| 1 | **Empty alerts array (`[]`)** | The table is **not rendered**. A centered block reads **"No anomalies detected for the current threshold."** (data-slot="alerts-empty"). This state must be explicit even when the table previously had rows — e.g. switching threshold from 0.3 to 0.99 yields 0 alerts. |
| 2 | **Threshold out of range (< 0.01)** | The backend returns `HTTP 422` for negative values. The UI must clamp the value to `0.01` before sending the request. If the user types `-1`, show an inline error: "Threshold must be between 0.01 and 1.0." and keep the last valid result. |
| 3 | **Threshold out of range (> 1.0)** | The backend accepts values up to any positive number (no upper bound validation). A threshold of `2.0` returns `[]`. The UI should clamp the value to `1.0` before sending and show an inline error if the user types above 1.0. |
| 4 | **Threshold = 0** | The backend accepts `0` (ge constraint). This returns every period as an alert — the table will be long. The UI should show a warning message: "Threshold is 0 — all periods will appear as anomalies." |
| 5 | **Date range filters active** | The alerts request includes `start_date`/`end_date`. If the filtered range has no alerts, the empty state (same as #1) is shown. |
| 6 | **Non-numeric threshold input** | `<input type="number">` natively prevents non-numeric input. The field shows a hint: "Enter a number between 0.01 and 1.0." No request is fired. The last valid table data is preserved. |

---

## Feature 3 — B2B vs B2C comparison view

### Endpoints consumed

| Purpose | Endpoint | Method |
|---------|----------|--------|
| Top income categories for one business line | `GET /api/metrics/categories/top?operation_type=income&limit=5` | `GET` |
| Available facets (categories) | `GET /api/metrics/facets` | `GET` |
| B2B-only movements | `GET /api/metrics/b2b` | `GET` |
| B2C-only movements | `GET /api/metrics/b2c` | `GET` |

### TypeScript types used

- **Request (categories):** `TopCategoriesParams`
- **Response (categories):** `CategoryEntry`, `TopCategoriesResponse`
- **Response (facets):** `FacetsResponse`
- **Response (b2b/b2c):** `FinancialMovement[]`

### `TopCategoriesParams`

```typescript
interface TopCategoriesParams {
  /** Operation type to aggregate; defaults to "outcome". For the comparison view, always "income". */
  operation_type?: OperationType
  /** Maximum number of categories returned; 1..20, defaults to 5. */
  limit?: number
  /** Inclusive lower bound, ISO date string YYYY-MM-DD format. */
  start_date?: string
  /** Inclusive upper bound, ISO date string YYYY-MM-DD format. */
  end_date?: string
  /** Optional filter to restrict aggregation to one business type. */
  business_type?: BusinessType
}
```

### Parameter constraints

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `operation_type` | `string` | No | `"outcome"` | `"income"` or `"outcome"`. For this feature, always `"income"`. |
| `limit` | `integer` | No | `5` | `>= 1` and `<= 20` (backend returns 422 outside this range). |
| `start_date` | `string` (ISO date) | No | `null` | Same as Feature 1. |
| `end_date` | `string` (ISO date) | No | `null` | Same as Feature 1. |
| `business_type` | `string` | No | `null` | `"B2B"` or `"B2C"`. Required for this feature — one request per type. |

### Response shape: `CategoryEntry`

```json
{
  "category": "sales",
  "operation_type": "income",
  "total_amount": 1132097.38
}
```

### `B2B2CPanel` — percentage calculation

```
% of group total = (entry.total_amount / totalAmount) * 100
```

Where `totalAmount` is the sum of all income movements for that business
type over the applied date range. When `totalAmount === 0`, every cell in
the "% of group total" column renders `"—"` (not `"0.0%"`).

### Edge cases

| # | Scenario | Expected UI behavior |
|---|----------|---------------------|
| 1 | **Empty top-5 list (`[]`) for one panel** | The panel's table is **not rendered**. A centered message reads **"No income categories available for B2B."** (or B2C, respectively). The other panel continues to render normally. The comparison chart below still shows both bars (one will be `$0`). |
| 2 | **Empty top-5 list for both panels** | Both panels show their empty state. The comparison chart shows both bars at `$0`. A centered chart-level message reads **"No income data available for the selected range."** |
| 3 | **Date range with only one bound filled** | The `/categories/top` request for each business type is sent with only `start_date` or only `end_date`. Panels render whatever the API returns for that filter. The range hint shows the full available range. |
| 4 | **`totalAmount === 0` (no income data) but items list is non-empty** | This shouldn't happen in practice (API returns consistent data), but the UI handles it defensively: every "% of group total" cell renders `"—"` to avoid division by zero. |
| 5 | **`limit` out of range (< 1 or > 20)** | The backend returns `HTTP 422`. The UI must never send an out-of-range `limit` — it always clamps to `[1, 20]` and defaults to `5`. |
| 6 | **Comparison chart with both totals = 0** | The chart is not drawn. A centered empty state reads **"No income data available for the selected range."** (data-slot="comparison-empty"). |

---

## Cross-cutting concerns

### Loading state
Every component that fetches data accepts a `loading: boolean` prop. When
`true`, the component renders skeleton placeholders (`<Skeleton>` from
`src/components/ui/skeleton.tsx`) matching the real layout dimensions.
Switching between loading and ready states must be smooth — no layout
shift.

### Error state
Every feature-level component accepts an `error: string | null` prop. When
non-null, a destructive-styled banner is rendered instead of the normal
content. The banner displays the error message. The previous data (if any)
is hidden.

### Empty state
Every component that renders a list/table must handle the empty array case
with an explicit message, never a blank area. The empty state is **not**
the same as the loading state or the error state.

### Input validation philosophy
Date inputs use `<input type="date">` for native browser validation.
Threshold inputs use `<input type="number" min="0.01" max="1.0" step="0.01">`.
The UI never sends invalid requests to the API — it clamps values and shows
inline feedback before the request fires.

---

## API endpoint summary

All endpoints mounted on `http://localhost:8000` (or `VITE_API_BASE_URL`).

| Path | Method | Purpose |
|------|--------|---------|
| `/health` | `GET` | Health check |
| `/api/metrics` | `GET` | All movements (filterable) |
| `/api/metrics/facets` | `GET` | Available filter values |
| `/api/metrics/summary` | `GET` | Time-series summary |
| `/api/metrics/categories/top` | `GET` | Top categories by operation type |
| `/api/metrics/comparison` | `GET` | Period-over-period net comparison |
| `/api/metrics/alerts` | `GET` | Outcome spike alerts |
| `/api/metrics/b2b` | `GET` | B2B-only movements |
| `/api/metrics/b2c` | `GET` | B2C-only movements |