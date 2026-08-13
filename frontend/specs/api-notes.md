# API Inspection Notes — Verified Response Shapes

> Inspected on **2026-08-13** against the live FastAPI backend running at
> `http://localhost:8000`. Source of truth: the `/docs` (OpenAPI) schema
> **and** actual HTTP responses retrieved via `curl`. Every field documented
> below was observed, not assumed.

---

## Endpoint 1: `GET /api/metrics/facets`

### Request signature

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| *(none)* | | | | No query parameters exist on this endpoint. |

### Response shape (as observed)

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-08-01",
  "max_date": "2026-07-28"
}
```

### Field breakdown

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `operation_types` | `string[]` | Never | Enum values: `"income"`, `"outcome"`. Always both present. |
| `business_types` | `string[]` | Never | Enum values: `"B2B"`, `"B2C"`. Always both present. |
| `categories` | `string[]` | Never | Enum values: `"administrative"`, `"operational"`, `"others"`, `"sales"`, `"suppliers"`. Always all 5 present. Sorted alphabetically. |
| `min_date` | `string` (ISO date) | Never | Format: `YYYY-MM-DD`. Earliest `create_date` in the dataset. |
| `max_date` | `string` (ISO date) | Never | Format: `YYYY-MM-DD`. Latest `create_date` in the dataset. |

### Edge-case behavior

- **No parameters**: The endpoint has no optional query parameters. It always returns the same shape.
- **Deterministic**: With `seed=42`, the facets are always the same — 2 operation types, 2 business types, 5 categories, date range `2025-08-01` to `2026-07-28`.
- **Empty dataset (seed=0)**: Not tested — the production code always uses `seed=42`, so the dataset is never empty.

### Discrepancy between /docs and actual response

None observed. The `/docs` schema (`MetricsFacets`) matches the actual response exactly — all fields present, no nullable fields, types match.

---

## Endpoint 2: `GET /api/metrics/alerts`

### Request signature

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `threshold` | `number` | No | `0.3` | `>= 0` (defined in /docs as `minimum: 0`). **No upper bound.** Values > 0 return `[]`, not an error. Values < 0 return HTTP 422. |
| `group_by` | `string` | No | `"month"` | Enum: `"day"`, `"week"`, `"month"`. |
| `start_date` | `string` (ISO date) | No | `null` | Format `YYYY-MM-DD`. When absent, no lower bound. |
| `end_date` | `string` (ISO date) | No | `null` | Format `YYYY-MM-DD`. When absent, no upper bound. |
| `business_type` | `string` | No | `null` | Enum: `"B2B"`, `"B2C"`. |

### Response shape (as observed)

```json
[
  {
    "period": "2025-12",
    "outcome_total": 103378.98,
    "baseline_average": 65227.42,
    "increase_ratio": 0.5849
  }
]
```

### Field breakdown

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `period` | `string` | Never | Format depends on `group_by`: `"YYYY-MM"` (month), `"YYYY-MM-DD"` (day), `"YYYY-WNN"` (week). |
| `outcome_total` | `number` | Never | Sum of outcome amounts for the period, rounded to 2 decimals. |
| `baseline_average` | `number` | Never | Mean of all prior periods' outcome totals, rounded to 2 decimals. |
| `increase_ratio` | `number` | Never | `(outcome_total - baseline_average) / baseline_average`, rounded to 4 decimals. |

### Edge-case behavior (all verified live)

| Scenario | HTTP Status | Response | Notes |
|----------|-------------|----------|-------|
| `threshold=0` | `200` | `[3 items]` | Every period whose outcome increased (even fractionally) over baseline. |
| `threshold=2.0` | `200` | `[]` | No period exceeded a 200% increase. **No error** — the backend has no upper bound validation. |
| `threshold=-1` | `422` | `{"detail":[{"type":"greater_than_equal","loc":["query","threshold"],"msg":"Input should be greater than or equal to 0","input":"-1","ctx":{"ge":0.0}}]}` | Returns structured Pydantic validation error. |
| `threshold=0.99` | `200` | `[]` | No period exceeded a 99% increase. |
| `group_by=day` | `200` | `[74 items]` | Period format: `"2025-08-04"`, `"2025-08-11"`, etc. |
| `group_by=week` | `200` | `[15 items]` | Period format: `"2025-W32"`, `"2025-W33"`, etc. |
| single date: `start_date=2026-06-01` | `200` | `[]` | No anomalies in the filtered range. |
| `start_date > end_date` | `200` | `[]` | No movements satisfy the inverted range. |
| `business_type=B2B` | `200` | `[1 item]` | Only 1 alert for B2B-only spending. |
| invalid date (`start_date=not-a-date`) | `422` | Structured error: `"invalid character in year"` | Pydantic date parsing error. |
| invalid business_type (`business_type=XYZ`) | `422` | Structured error: `"Input should be 'B2B' or 'B2C'"` | Pydantic literal error. |

### Discrepancy between /docs and actual response

**None observed.** The `/docs` schema shows `threshold` with `minimum: 0` and no maximum — consistent with behavior where `threshold=2.0` returns `[]` (valid) and `threshold=-1` returns 422. The `MetricsAlert` schema fields match the actual response exactly.

---

## Endpoint 3: `GET /api/metrics/categories/top`

### Request signature

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `operation_type` | `string` | No | `"outcome"` | Enum: `"income"`, `"outcome"`. |
| `limit` | `integer` | No | `5` | `>= 1`, `<= 20`. Values outside this range return HTTP 422. |
| `start_date` | `string` (ISO date) | No | `null` | Format `YYYY-MM-DD`. When absent, no lower bound. |
| `end_date` | `string` (ISO date) | No | `null` | Format `YYYY-MM-DD`. When absent, no upper bound. |
| `business_type` | `string` | No | `null` | Enum: `"B2B"`, `"B2C"`. |

### Response shape (as observed)

```json
[
  {
    "category": "sales",
    "operation_type": "income",
    "total_amount": 1132097.38
  },
  {
    "category": "others",
    "operation_type": "income",
    "total_amount": 126049.49
  }
]
```

### Field breakdown

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `category` | `string` | Never | Enum: `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"`. |
| `operation_type` | `string` | Never | Enum: `"income"`, `"outcome"`. Matches the request parameter. |
| `total_amount` | `number` | Never | Aggregated amount for the category, rounded to 2 decimals. |

### Edge-case behavior (all verified live)

| Scenario | HTTP Status | Response | Notes |
|----------|-------------|----------|-------|
| `limit=0` | `422` | Structured error: `"Input should be greater than or equal to 1"` | Pydantic validation error (`ge=1`). |
| `limit=25` | `422` | Structured error: `"Input should be less than or equal to 20"` | Pydantic validation error (`le=20`). |
| default (no `operation_type`) | `200` | `[4 items]` | Defaults to `"outcome"`. Returns 4 outcome categories: `"others"`, `"operational"`, `"administrative"`, `"suppliers"`. |
| `operation_type=income&limit=20` | `200` | `[2 items]` | Only 2 income categories exist in the data (`"sales"`, `"others"`). The response has fewer items than `limit`. |
| `operation_type=income&business_type=B2B` | `200` | `[2 items]` | Same 2 categories, different amounts filtered to B2B. |
| `operation_type=income&business_type=B2C` | `200` | `[2 items]` | Same 2 categories, different amounts filtered to B2C. |
| far-future date: `start_date=2099-01-01` | `200` | `[]` | No movements in that date range. Returns empty array. |
| single date: `start_date=2026-06-01` | `200` | `[2 items]` | Items filtered to movements on or after 2026-06-01. |
| invalid `operation_type=bogus` | `422` | Structured error: `"Input should be 'income' or 'outcome'"` | Pydantic literal error. |

### Discrepancy between /docs and actual response

**None observed.** The `/docs` schema (`TopCategoryItem`) matches the actual response exactly — all fields present, no nullable fields, types match. The `limit` constraint (`ge=1`, `le=20`) in /docs matches the 422 behavior for out-of-range values.

---

## Summary of discrepancies found

| Endpoint | Discrepancy |
|----------|-------------|
| `GET /api/metrics/facets` | None. Schema and actual response match exactly. |
| `GET /api/metrics/alerts` | None. The `/docs` correctly shows `threshold` with `minimum: 0` and no maximum — the behavior where `threshold=2.0` returns `[]` (not an error) is consistent with this. |
| `GET /api/metrics/categories/top` | None. Schema and actual response match exactly. |