# Engineering Practices Inventory (Evidence-Backed)

Baseline used: [VALIDATED_REPO_UNDERSTANDING.md](VALIDATED_REPO_UNDERSTANDING.md)
Date: 2026-08-12

This inventory is limited to observable repository evidence and runtime checks.

## Good Practices Worth Preserving

| Category | Practice | Evidence | Why it qualifies as good |
|---|---|---|---|
| Architecture | Backend API contracts are explicitly typed with Pydantic models and attached as response models on routes. | [backend/app/routes.py](backend/app/routes.py#L22), [backend/app/routes.py](backend/app/routes.py#L248), [backend/app/routes.py](backend/app/routes.py#L305) | Explicit response models reduce contract drift and make endpoint behavior easier to validate and consume. |
| Architecture | Query constraints are encoded in endpoint signatures (for example limit bounds and required dates). | [backend/app/routes.py](backend/app/routes.py#L290), [backend/app/routes.py](backend/app/routes.py#L307), [backend/app/routes.py](backend/app/routes.py#L344) | Validation at the API boundary prevents invalid input from propagating into business logic. |
| Testing | Backend tests assert behavior across multiple analytics endpoints, not only the health check. | [backend/tests/test_routes.py](backend/tests/test_routes.py#L121), [backend/tests/test_routes.py](backend/tests/test_routes.py#L144), [backend/tests/test_routes.py](backend/tests/test_routes.py#L157), [backend/tests/test_routes.py](backend/tests/test_routes.py#L173) | Multi-endpoint behavioral tests improve confidence in regression detection across the API surface. |
| Testing | Frontend data logic is extracted into pure utility functions and directly unit-tested. | [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L28), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L43), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L36), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L64) | Pure-function tests keep financial calculations deterministic and easier to maintain than testing inside UI components. |
| Developer Experience | Local multi-service development is reproducible via Docker Compose with explicit frontend/backend ports. | [docker-compose.yml](docker-compose.yml#L1), [docker-compose.yml](docker-compose.yml#L7), [docker-compose.yml](docker-compose.yml#L19) | A codified local runtime reduces setup variance and onboarding friction across machines. |
| Developer Experience | Frontend-to-backend integration uses a Vite proxy instead of hardcoding localhost ports in fetch calls. | [frontend/vite.config.ts](frontend/vite.config.ts#L12), [frontend/vite.config.ts](frontend/vite.config.ts#L13), [frontend/src/App.tsx](frontend/src/App.tsx#L20) | Proxy-based routing keeps client code environment-agnostic and simplifies local and containerized workflows. |
| Documentation | README includes runnable local instructions and a docs URL, plus bilingual linkage to the Spanish README. | [README.md](README.md#L10), [README.md](README.md#L39), [README.md](README.md#L42), [README.md](README.md#L50) | Practical startup and documentation pointers reduce ambiguity for first-time contributors. |

## Risky or Non-Standard Practices

| Category | Risky Practice | Evidence | Concrete risk introduced |
|---|---|---|---|
| Security | CORS is fully permissive with wildcard origins, methods, and headers while allowing credentials. | [backend/app/main.py](backend/app/main.py#L9), [backend/app/main.py](backend/app/main.py#L10), [backend/app/main.py](backend/app/main.py#L11), [backend/app/main.py](backend/app/main.py#L12) | This broad cross-origin posture can expose API access to unintended origins and increases attack surface if reused beyond local development. |
| Deployment Hygiene | Backend runtime image starts debugpy, exposes port 5678, and runs uvicorn with --reload. | [backend/Dockerfile](backend/Dockerfile#L10), [backend/Dockerfile](backend/Dockerfile#L12), [docker-compose.yml](docker-compose.yml#L20) | Debug and auto-reload settings in shared container defaults can leak internals and degrade stability/performance outside dev-only contexts. |
| Reproducibility | Python dependencies are unpinned (no exact versions or lock file semantics in requirements). | [backend/requirements.txt](backend/requirements.txt#L1), [backend/requirements.txt](backend/requirements.txt#L2), [backend/requirements.txt](backend/requirements.txt#L3) | Unpinned dependencies can cause non-deterministic builds and environment-specific failures over time. |
| Correctness under Concurrency | The request path reseeds global RNG state before generating response data. | [backend/app/routes.py](backend/app/routes.py#L94), [backend/app/routes.py](backend/app/routes.py#L96), [backend/app/routes.py](backend/app/routes.py#L100) | Global RNG mutation can make behavior fragile under concurrent access and complicates future parallelism assumptions. |
| Architecture | Frontend consumes only /api/metrics and recomputes aggregates client-side even though server-side aggregate endpoints exist. | [frontend/src/App.tsx](frontend/src/App.tsx#L20), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L43), [backend/app/routes.py](backend/app/routes.py#L268), [backend/app/routes.py](backend/app/routes.py#L287), [backend/app/routes.py](backend/app/routes.py#L305) | Duplicating aggregation logic across tiers increases drift risk and can add unnecessary payload/compute costs on the client. |
| Testing | Frontend test scope is concentrated in one utility test file, with no component-level tests in src/components. | [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L1), [frontend/src/App.tsx](frontend/src/App.tsx#L55), [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L49) | UI state behavior (loading, error, empty data rendering) can regress without test signals, increasing release risk. |

## Draft Rule Set (One Rule Per Risk)

1. Security rule: Restrict CORS to an explicit allowlist per environment; never ship wildcard origins with credentials enabled.
2. Deployment rule: Keep debug ports and autoreload flags in dev-only compose or profiles, not in shared default runtime images.
3. Reproducibility rule: Pin backend dependency versions and update them intentionally through reviewed dependency bumps.
4. Concurrency rule: Do not reseed global random state inside request handlers; use request-scoped generators or deterministic fixtures outside runtime paths.
5. Architecture rule: If the backend already exposes a tested aggregate endpoint, prefer consuming that endpoint over re-implementing equivalent aggregation in the UI.
6. Testing rule: Add or update at least one component-level test whenever changing dashboard loading, error, or rendering behavior.

## Git History Pattern Notes

Observed from recent history:
- Commit messages consistently use typed prefixes (for example feat, docs, chore), which helps readability of change intent.
- Evidence: recent commits shown by git log include examples such as feat and docs prefixes (for example 0c07552, 40ae63f, 4e3b024).
