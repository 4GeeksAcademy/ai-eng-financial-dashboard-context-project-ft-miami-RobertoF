# Current Status

## Snapshot

As of this phase, the repository has:
1. A functioning two-service local stack (frontend + backend).
2. Verified API route surface and docs endpoint.
3. Finalized Phase 3 rule files under [.agents/rules](../.agents/rules).

Evidence:
- Runtime and endpoint validation summary: [VALIDATED_REPO_UNDERSTANDING.md](../VALIDATED_REPO_UNDERSTANDING.md)
- Rule set index: [.agents/rules/README.md](../.agents/rules/README.md)

## Implemented Features (Confirmed)

1. Backend financial metrics API with health, facets, summaries, top categories, comparisons, alerts, and B2B/B2C views.
- Evidence: [backend/app/routes.py](../backend/app/routes.py#L243), [backend/app/routes.py](../backend/app/routes.py#L248), [backend/app/routes.py](../backend/app/routes.py#L262), [backend/app/routes.py](../backend/app/routes.py#L268), [backend/app/routes.py](../backend/app/routes.py#L287), [backend/app/routes.py](../backend/app/routes.py#L305), [backend/app/routes.py](../backend/app/routes.py#L342), [backend/app/routes.py](../backend/app/routes.py#L362), [backend/app/routes.py](../backend/app/routes.py#L378)

2. Frontend dashboard rendering KPI cards and two charts from API data.
- Evidence: [frontend/src/App.tsx](../frontend/src/App.tsx#L57), [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)

3. Frontend period label derivation and actionable error messaging in fetch path.
- Evidence: [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts#L76), [frontend/src/App.tsx](../frontend/src/App.tsx#L39), [frontend/src/App.tsx](../frontend/src/App.tsx#L47)

4. Unit test coverage for backend routes and frontend financial utility logic.
- Evidence: [backend/tests/test_routes.py](../backend/tests/test_routes.py), [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)

## Known Gaps and Risks (From Phase 2 Findings + Current Rules)

1. Security posture risk: backend CORS is currently permissive in bootstrap defaults.
- Evidence: [backend/app/main.py](../backend/app/main.py#L9), [backend/app/main.py](../backend/app/main.py#L10), [backend/app/main.py](../backend/app/main.py#L11), [backend/app/main.py](../backend/app/main.py#L12)
- Rule linkage: [R-BE-01](../.agents/rules/backend-api-and-runtime-rules.md)

2. Deployment hygiene risk: backend default runtime includes debugpy and reload flags.
- Evidence: [backend/Dockerfile](../backend/Dockerfile#L12), [docker-compose.yml](../docker-compose.yml#L20)
- Rule linkage: [R-BE-02](../.agents/rules/backend-api-and-runtime-rules.md)

3. Reproducibility risk: backend dependencies remain unpinned.
- Evidence: [backend/requirements.txt](../backend/requirements.txt)
- Rule linkage: [R-DX-01](../.agents/rules/testing-and-delivery-rules.md)

4. Architecture drift risk: frontend currently computes aggregates from /api/metrics while backend already offers aggregate endpoints.
- Evidence: [frontend/src/App.tsx](../frontend/src/App.tsx#L20), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts#L43), [backend/app/routes.py](../backend/app/routes.py#L268), [backend/app/routes.py](../backend/app/routes.py#L287), [backend/app/routes.py](../backend/app/routes.py#L305)
- Rule linkage: [R-FE-03](../.agents/rules/frontend-data-and-ux-rules.md)

5. Testing gap risk: no component-level tests currently verify dashboard loading/error/empty rendering behavior.
- Evidence: frontend tests are concentrated in [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), while UI-state logic lives in [frontend/src/App.tsx](../frontend/src/App.tsx#L41) and chart components.
- Rule linkage: [R-QA-02](../.agents/rules/testing-and-delivery-rules.md)

## Suggested Next Priorities

1. Implement environment-scoped CORS configuration and separate local-only permissive behavior.
- Why now: directly reduces exposed API risk in default runtime.
- Guided by: [R-BE-01](../.agents/rules/backend-api-and-runtime-rules.md)

2. Split debug runtime behavior from shared default container command.
- Why now: improves deployment hygiene and reduces accidental debug exposure.
- Guided by: [R-BE-02](../.agents/rules/backend-api-and-runtime-rules.md)

3. Start consuming backend aggregate endpoints for at least one dashboard view.
- Why now: reduces cross-tier aggregation duplication and drift.
- Guided by: [R-FE-03](../.agents/rules/frontend-data-and-ux-rules.md)

4. Add first component-level test for dashboard error or loading state.
- Why now: closes currently untested UI behavior path.
- Guided by: [R-QA-02](../.agents/rules/testing-and-delivery-rules.md)

5. Pin backend dependencies with intentional version selection.
- Why now: stabilizes builds and reduces dependency drift.
- Guided by: [R-DX-01](../.agents/rules/testing-and-delivery-rules.md)

## Not Yet Confirmed (Explicit)

1. Real business validity of mock metric distributions.
- Evidence basis: data generation is deterministic mock logic in [backend/app/routes.py](../backend/app/routes.py#L94), not tied to production data sources.

2. Full visual QA across browsers/devices.
- Evidence basis: runtime reachability is validated, but no comprehensive UI test matrix is currently present in repository tests.
