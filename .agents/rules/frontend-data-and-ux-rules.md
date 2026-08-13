# Frontend Data and UX Rules

## R-FE-01: Derive Dashboard Period Labels From Data

Rule statement:
- Do not hardcode reporting period labels in dashboard views.
- Build the displayed period from the fetched movement date range.
- Use explicit fallback labels only for loading, empty, or fetch-failure states.

Scope:
- Applies to [frontend/src/App.tsx](frontend/src/App.tsx) and dashboard header/summary views under [frontend/src/components/dashboard](frontend/src/components/dashboard).

Rationale (Phase 2 finding addressed):
- Addresses the hardcoded period-label risk identified in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md) by keeping UI period context synchronized with actual payload dates.

Validation note:
- Real task tested: verify period rendering path in [frontend/src/App.tsx](frontend/src/App.tsx#L29), [frontend/src/App.tsx](frontend/src/App.tsx#L39), and [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L76).
- Result: pass.
- Rewrite made: yes. Initial draft required derived labels in all states; rewritten to allow fallback labels during loading/failure.

---

## R-FE-02: Include Endpoint Context In User-Facing API Errors

Rule statement:
- Any user-visible API error message must include the failing endpoint path.
- Include HTTP status when available from the thrown error context.
- Do not swallow error detail into generic text-only failures.

Scope:
- Applies to frontend data fetch paths in [frontend/src/App.tsx](frontend/src/App.tsx) and future API clients under [frontend/src/lib](frontend/src/lib).

Rationale (Phase 2 finding addressed):
- Addresses the observability and triage gap identified in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md) by making failures actionable for debugging.

Validation note:
- Real task tested: verify catch-path behavior in [frontend/src/App.tsx](frontend/src/App.tsx#L41) to [frontend/src/App.tsx](frontend/src/App.tsx#L47).
- Result: pass.
- Rewrite made: yes. Initial draft required status code always; rewritten to require status only when available.

---

## R-FE-03: Prefer Existing Backend Aggregate Endpoints For New Dashboard Metrics

Rule statement:
- When adding a new chart or KPI that maps to an existing backend aggregate endpoint, consume the backend aggregate endpoint first.
- Client-side re-aggregation is allowed only when the backend has no equivalent endpoint; document the reason in the PR/commit note.

Scope:
- Applies to new metric features in [frontend/src/App.tsx](frontend/src/App.tsx) and utilities in [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).

Rationale (Phase 2 finding addressed):
- Addresses architecture drift risk noted in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md), where frontend may duplicate server aggregation logic.

Validation note:
- Real task tested: map current data flow in [frontend/src/App.tsx](frontend/src/App.tsx#L20) against existing aggregate endpoints in [backend/app/routes.py](backend/app/routes.py#L268), [backend/app/routes.py](backend/app/routes.py#L287), and [backend/app/routes.py](backend/app/routes.py#L305).
- Result: failed on first draft due ambiguity about exceptions.
- Rewrite made: yes. Added explicit exception path for "no equivalent backend endpoint" plus documentation requirement.
