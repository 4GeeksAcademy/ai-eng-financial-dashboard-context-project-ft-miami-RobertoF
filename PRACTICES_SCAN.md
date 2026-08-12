# Practices Scan (Evidence-First)

Date: 2026-08-12

This scan documents observed engineering practices in this repository using direct file/line evidence.

## 1) Deterministic mock dataset strategy for API stability

Observed practice:
- Every analytics endpoint builds from `generate_mock_movements(seed=42)` to keep behavior reproducible.

Evidence:
- `backend/app/routes.py:255`
- `backend/app/routes.py:277`
- `backend/app/routes.py:295`
- `backend/app/routes.py:311`
- `backend/app/routes.py:350`

Why this matters:
- Enables stable tests and predictable dashboard behavior while domain logic evolves.

## 2) Strong response contracts with Pydantic + FastAPI `response_model`

Observed practice:
- API schemas are modeled with dedicated classes and attached explicitly to endpoint responses.

Evidence:
- `backend/app/routes.py:22` (`FinancialMovement`)
- `backend/app/routes.py:30` (`MetricsFacets`)
- `backend/app/routes.py:38` (`MetricsSummaryItem`)
- `backend/app/routes.py:51` (`MetricsComparison`)
- `backend/app/routes.py:248` (`/api/metrics` response model)
- `backend/app/routes.py:305` (`/api/metrics/comparison` response model)

Why this matters:
- Reduces contract drift and improves discoverability in OpenAPI docs.

## 3) Query-driven analytics endpoints (filtering + grouping)

Observed practice:
- Endpoints expose analytics dimensions as query params: date range, operation type, category, business type, and group granularity.

Evidence:
- `backend/app/routes.py:249` (`get_metrics`)
- `backend/app/routes.py:269` (`get_metrics_summary` with `group_by`)
- `backend/app/routes.py:288` (`get_top_categories` with bounded `limit`)
- `backend/app/routes.py:343` (`get_metrics_alerts` with `threshold`)

Why this matters:
- Supports reusable API primitives instead of hard-coded dashboard views.

## 4) B2B/B2C segmentation exposed as first-class API paths

Observed practice:
- Business-type segmentation is available both as generic filter usage and dedicated endpoints.

Evidence:
- `backend/app/routes.py:362` (`/api/metrics/b2b`)
- `backend/app/routes.py:378` (`/api/metrics/b2c`)
- `backend/tests/test_routes.py:90` (combined filter test for B2B endpoint)

Why this matters:
- Preserves domain language in API shape and eases frontend consumption.

## 5) Frontend computes KPI and monthly chart data from API payload

Observed practice:
- UI fetches base movements and performs deterministic transformations in utility functions.

Evidence:
- `frontend/src/App.tsx:32` (`computeKPIs`)
- `frontend/src/App.tsx:33` (`computeMonthlyData`)
- `frontend/src/lib/financial-utils.ts:21` (`computeKPIs` implementation)
- `frontend/src/lib/financial-utils.ts:36` (`computeMonthlyData` implementation)

Why this matters:
- Keeps transformation logic isolated and testable, while components remain presentation-focused.

## 6) Progressive loading and empty-state UX in chart components

Observed practice:
- Dashboard charts include skeleton states and explicit empty-data messaging.

Evidence:
- `frontend/src/components/dashboard/income-outcome-chart.tsx:49` (loading branch)
- `frontend/src/components/dashboard/income-outcome-chart.tsx:75` (empty state)
- `frontend/src/components/dashboard/profit-percent-chart.tsx:50` (loading branch)
- `frontend/src/components/dashboard/profit-percent-chart.tsx:76` (empty state)

Why this matters:
- Prevents abrupt UI shifts and gives users clear feedback during load/edge conditions.

## 7) Containerized local setup with networked dev proxy

Observed practice:
- Frontend and backend run as separate services and frontend proxies `/api` to backend service name.

Evidence:
- `docker-compose.yml:11` (`depends_on` frontend -> backend)
- `docker-compose.yml:19` (backend port `8000`)
- `frontend/vite.config.ts:12` (`/api` proxy)
- `frontend/vite.config.ts:13` (`target: http://backend:8000`)

Why this matters:
- Keeps local integration close to real service boundaries without hard-coding host ports in UI fetch logic.

## 8) Test coverage focuses on behavior, not only happy paths

Observed practice:
- Backend tests validate filters, sorting, contract keys, grouped summaries, category ranking, and alerts.
- Frontend unit tests validate KPI math, cross-year month ordering, and formatting behavior.

Evidence:
- `backend/tests/test_routes.py:12`
- `backend/tests/test_routes.py:19`
- `backend/tests/test_routes.py:81`
- `backend/tests/test_routes.py:144`
- `backend/tests/test_routes.py:157`
- `backend/tests/test_routes.py:173`
- `frontend/src/lib/financial-utils.test.ts:35`
- `frontend/src/lib/financial-utils.test.ts:63`
- `frontend/src/lib/financial-utils.test.ts:106`

Why this matters:
- Indicates intentional validation of domain behavior and edge scenarios.

## Specific gaps worth tracking next (also evidence-based)

1. Current frontend API consumption still uses only `/api/metrics`, while richer backend endpoints are available.
   - Evidence: `frontend/src/App.tsx:16` fetches only `/api/metrics`.
   - Available APIs: `backend/app/routes.py:268`, `backend/app/routes.py:287`, `backend/app/routes.py:305`, `backend/app/routes.py:342`.

2. CORS is fully open in backend (`allow_origins=["*"]`), suitable for local development but broad for production.
   - Evidence: `backend/app/main.py:9`.

3. Business segmentation currently appears both as dedicated paths and as optional query filtering in summary/top/comparison flows; this may duplicate surface area over time.
   - Evidence: `backend/app/routes.py:362`, `backend/app/routes.py:378`, plus `business_type` params in `backend/app/routes.py:275`, `backend/app/routes.py:293`, `backend/app/routes.py:309`, `backend/app/routes.py:348`.