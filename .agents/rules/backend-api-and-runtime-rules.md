# Backend API and Runtime Rules

## R-BE-01: Keep CORS Policy Environment-Scoped

Rule statement:
- Do not use wildcard CORS origins in shared runtime defaults.
- Read allowed origins from environment configuration and set explicit origin lists per environment.
- If local development needs broad CORS, isolate that behavior to local-only config.

Scope:
- Applies to backend bootstrap in [backend/app/main.py](backend/app/main.py) and runtime configuration used by compose/docker.

Rationale (Phase 2 finding addressed):
- Addresses the security-risk finding in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md) for permissive CORS settings.

Validation note:
- Real task tested: review existing CORS setup at [backend/app/main.py](backend/app/main.py#L8) to [backend/app/main.py](backend/app/main.py#L12).
- Result: failed on first draft because it did not define where allowlist values should come from.
- Rewrite made: yes. Added requirement to source allowed origins from environment config.

---

## R-BE-02: Keep Debug Runtime Flags Out Of Shared Default Runtime

Rule statement:
- Do not ship debug server flags (`debugpy`, `--reload`, debug ports) in shared default runtime images.
- Place debug tooling in local-only compose overrides or explicit dev profiles.

Scope:
- Applies to [backend/Dockerfile](backend/Dockerfile), [frontend/Dockerfile](frontend/Dockerfile), and [docker-compose.yml](docker-compose.yml) runtime defaults.

Rationale (Phase 2 finding addressed):
- Addresses deployment-hygiene risk in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md), where debug behavior is currently embedded in default backend runtime.

Validation note:
- Real task tested: compare backend container command/ports in [backend/Dockerfile](backend/Dockerfile#L12) and [docker-compose.yml](docker-compose.yml#L20).
- Result: pass.
- Rewrite made: no.

---

## R-BE-03: Constrain Query Inputs At The Route Boundary

Rule statement:
- Every new numeric query parameter must define bounds (`ge`, `gt`, `le`, or `lt`) in FastAPI `Query(...)`.
- Required date-range endpoints must use explicit required parameters (`Query(...)`) for both start and end bounds.

Scope:
- Applies to all new routes under [backend/app/routes.py](backend/app/routes.py).

Rationale (Phase 2 finding addressed):
- Addresses API correctness and boundary-validation concerns identified in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md).

Validation note:
- Real task tested: inspect existing constraints in [backend/app/routes.py](backend/app/routes.py#L290), [backend/app/routes.py](backend/app/routes.py#L307), [backend/app/routes.py](backend/app/routes.py#L308), and [backend/app/routes.py](backend/app/routes.py#L344).
- Result: failed on first draft because it overreached to all query params, including optional filters.
- Rewrite made: yes. Narrowed requirement to numeric params and required date-range inputs.

---

## R-BE-04: Avoid Global RNG Mutation In Request Paths

Rule statement:
- Do not call `random.seed(...)` inside request-serving paths.
- Use request-scoped random generators or prebuilt deterministic fixtures for test data generation.

Scope:
- Applies to request-bound helper paths in [backend/app/routes.py](backend/app/routes.py) and future data-generation utilities.

Rationale (Phase 2 finding addressed):
- Addresses concurrency and determinism risk identified in [PRACTICES_INVENTORY.md](PRACTICES_INVENTORY.md).

Validation note:
- Real task tested: inspect current generation path in [backend/app/routes.py](backend/app/routes.py#L94), [backend/app/routes.py](backend/app/routes.py#L96), and endpoint usage at [backend/app/routes.py](backend/app/routes.py#L255).
- Result: pass (rule clearly identifies current anti-pattern and preferred replacement pattern).
- Rewrite made: no.
