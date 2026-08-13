# Testing and Delivery Rules

## R-QA-01: Pair Data-Logic Changes With Unit Tests In The Same Change Set

Rule statement:
- Any change to financial calculations or transformation helpers must include or update unit tests in the same change set.

Scope:
- Applies to [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [backend/app/routes.py](backend/app/routes.py), and their corresponding test files.

Rationale (Phase 2 finding addressed):
- Preserves the proven testing strength documented in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md) and prevents silent math/aggregation regressions.

Validation note:
- Real task tested: verify current pairing pattern between [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L28) and [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L36), plus backend route tests in [backend/tests/test_routes.py](backend/tests/test_routes.py#L121).
- Result: pass.
- Rewrite made: no.

---

## R-QA-02: Require UI-State Tests For Dashboard Loading/Error/Empty Behavior Changes

Rule statement:
- If a change modifies dashboard loading, error, or empty-state behavior, add at least one component or render test that asserts that state path.
- Accepted locations: tests near [frontend/src/App.tsx](frontend/src/App.tsx) or under [frontend/src/components/dashboard](frontend/src/components/dashboard).

Scope:
- Applies to UI-state logic changes in [frontend/src/App.tsx](frontend/src/App.tsx) and dashboard components under [frontend/src/components/dashboard](frontend/src/components/dashboard).

Rationale (Phase 2 finding addressed):
- Addresses frontend testing-coverage gaps identified in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md).

Validation note:
- Real task tested: evaluate current state-handling lines in [frontend/src/App.tsx](frontend/src/App.tsx#L41) and [frontend/src/App.tsx](frontend/src/App.tsx#L61) against available frontend tests at [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L1).
- Result: failed on first draft because it did not define what test locations/counts were acceptable.
- Rewrite made: yes. Added explicit accepted locations and minimum expectation (at least one test).

---

## R-DX-01: Pin Backend Runtime Dependencies

Rule statement:
- Backend dependency additions or updates must pin package versions in [backend/requirements.txt](backend/requirements.txt).
- Unpinned additions are not accepted unless accompanied by a documented exception reason.

Scope:
- Applies to backend dependency changes in [backend/requirements.txt](backend/requirements.txt).

Rationale (Phase 2 finding addressed):
- Addresses reproducibility and build-drift risk identified in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md).

Validation note:
- Real task tested: inspect current unpinned dependency list at [backend/requirements.txt](backend/requirements.txt#L1) to [backend/requirements.txt](backend/requirements.txt#L6).
- Result: pass.
- Rewrite made: no.
