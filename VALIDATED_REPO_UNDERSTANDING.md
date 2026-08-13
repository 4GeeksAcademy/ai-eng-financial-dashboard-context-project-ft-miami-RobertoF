# Validated Repository Understanding (As-Is)

Date: 2026-08-12

This summary describes the repository as currently implemented and running, using only observed code, config, and runtime behavior.

## 1) What the Application Does (Claim-by-Claim, Traceable)

1. The backend exposes a financial metrics API with health, raw metrics, facets, summaries, category rankings, comparisons, alerts, and B2B/B2C-specific endpoints.
- Code evidence: [backend/app/routes.py](backend/app/routes.py#L243), [backend/app/routes.py](backend/app/routes.py#L248), [backend/app/routes.py](backend/app/routes.py#L262), [backend/app/routes.py](backend/app/routes.py#L268), [backend/app/routes.py](backend/app/routes.py#L287), [backend/app/routes.py](backend/app/routes.py#L305), [backend/app/routes.py](backend/app/routes.py#L342), [backend/app/routes.py](backend/app/routes.py#L362), [backend/app/routes.py](backend/app/routes.py#L378)
- Runtime evidence: `GET http://localhost:8000/openapi.json` reported these paths:
  - `/health`
  - `/api/metrics`
  - `/api/metrics/facets`
  - `/api/metrics/summary`
  - `/api/metrics/categories/top`
  - `/api/metrics/comparison`
  - `/api/metrics/alerts`
  - `/api/metrics/b2b`
  - `/api/metrics/b2c`

2. Backend data is generated in-memory from deterministic mock movements (seeded) rather than loaded from a database.
- Code evidence: [backend/app/routes.py](backend/app/routes.py#L94), [backend/app/routes.py](backend/app/routes.py#L99), [backend/app/routes.py](backend/app/routes.py#L101), repeated endpoint usage of `generate_mock_movements(seed=42)` at [backend/app/routes.py](backend/app/routes.py#L255), [backend/app/routes.py](backend/app/routes.py#L277), [backend/app/routes.py](backend/app/routes.py#L350)
- Supporting evidence for no DB package usage: [backend/requirements.txt](backend/requirements.txt#L1) and repo-wide search did not find `sqlalchemy`, `sqlite`, `postgres`, `mysql`, or `mongodb`.

3. The frontend fetches metrics from `/api/metrics`, computes KPI totals and monthly chart data client-side, and renders a dashboard with KPI cards and two line charts.
- API fetch evidence: [frontend/src/App.tsx](frontend/src/App.tsx#L19)
- KPI/monthly transform calls: [frontend/src/App.tsx](frontend/src/App.tsx#L37), [frontend/src/App.tsx](frontend/src/App.tsx#L38)
- Transform implementations: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L28), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L43)
- Dashboard composition evidence: [frontend/src/App.tsx](frontend/src/App.tsx#L57), [frontend/src/App.tsx](frontend/src/App.tsx#L68), [frontend/src/App.tsx](frontend/src/App.tsx#L75)

4. The frontend derives a displayed period label from movement dates and shows explicit fetch-failure messaging with endpoint context.
- Period derivation: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L76)
- Usage in app state/render: [frontend/src/App.tsx](frontend/src/App.tsx#L29), [frontend/src/App.tsx](frontend/src/App.tsx#L39), [frontend/src/App.tsx](frontend/src/App.tsx#L59)
- Error message behavior: [frontend/src/App.tsx](frontend/src/App.tsx#L47)

5. Live runtime endpoints are currently reachable when containers are up.
- `http://localhost:8000/health` returned `200` with `{"status":"ok"}`.
- `http://localhost:8000/docs` returned `200` with Swagger UI HTML.
- `http://localhost:5173` returned `200` with Vite-served HTML shell loading `/src/main.tsx`.

## 2) High-Level Architecture

1. Frontend framework and tooling.
- React + TypeScript app bootstrapped from [frontend/src/main.tsx](frontend/src/main.tsx#L1).
- Build/dev/test tooling in [frontend/package.json](frontend/package.json#L6) with Vite and Vitest entries at [frontend/package.json](frontend/package.json#L7), [frontend/package.json](frontend/package.json#L11).
- Charting dependency present in [frontend/package.json](frontend/package.json#L21).

2. Backend framework and API bootstrap.
- FastAPI app created in [backend/app/main.py](backend/app/main.py#L6).
- Router mounted in [backend/app/main.py](backend/app/main.py#L14).
- CORS middleware enabled in [backend/app/main.py](backend/app/main.py#L8).

3. Communication pattern.
- Frontend fetches `/api/metrics` from browser context in [frontend/src/App.tsx](frontend/src/App.tsx#L19).
- In local/dev container flow, Vite proxies `/api` to backend service `http://backend:8000` in [frontend/vite.config.ts](frontend/vite.config.ts#L12), [frontend/vite.config.ts](frontend/vite.config.ts#L13).

4. Runtime packaging/orchestration.
- Two services defined in [docker-compose.yml](docker-compose.yml#L1): frontend and backend.
- Port mappings: frontend `5173` and backend `8000` in [docker-compose.yml](docker-compose.yml#L7), [docker-compose.yml](docker-compose.yml#L19).
- Backend debug port `5678` in [docker-compose.yml](docker-compose.yml#L20).

5. Database status.
- No database service is declared in [docker-compose.yml](docker-compose.yml#L1).
- No database dependency is declared in [backend/requirements.txt](backend/requirements.txt#L1).
- No DB integration symbols were found in repository search for common DB keywords.

## 3) README Claims Checked Against Code (Verified vs Not Verified)

1. Claim: React + TypeScript frontend and FastAPI backend.
- Verified by [frontend/package.json](frontend/package.json#L19), [backend/app/main.py](backend/app/main.py#L6), and [backend/requirements.txt](backend/requirements.txt#L1).

2. Claim: local run via `docker compose up --build`.
- Verified by successful container start and reachable endpoints after compose; service definitions in [docker-compose.yml](docker-compose.yml#L1).

3. Claim: frontend uses Vite proxy for `/api`.
- Verified by [frontend/vite.config.ts](frontend/vite.config.ts#L12), [frontend/vite.config.ts](frontend/vite.config.ts#L13).

4. Claim: copy `frontend/.env.example` to set `VITE_API_BASE_URL` if needed.
- Verified that `.env.example` exists in tree at [frontend/.env.example](frontend/.env.example).

## 4) Unverified (Code Suggests, But Does Not Confirm)

1. Real business correctness of generated financial values.
- The code confirms deterministic mock generation, but does not confirm that generated distributions match real-world business data quality targets.

2. Browser-rendered visual behavior quality (beyond HTML shell reachability).
- `http://localhost:5173` is reachable and serves Vite HTML, but this pass did not include manual visual QA of chart rendering or responsive behavior in an interactive browser session.

3. Production deployment/security posture.
- Local/dev behavior is validated; this pass does not confirm production CORS restrictions, auth, rate limiting, or deployment topology.

## 5) Repository Structure Observed

Root-level structure was directly observed on disk, including:
- [backend](backend)
- [frontend](frontend)
- [docker-compose.yml](docker-compose.yml)
- [README.md](README.md)
- [AGENTS.md](AGENTS.md)
- [.agents](.agents)
- [memory-bank](memory-bank)

A tree snapshot command over the repository root reported 13 directories and 34 files (excluding `.git`, `node_modules`, and cache folders).
