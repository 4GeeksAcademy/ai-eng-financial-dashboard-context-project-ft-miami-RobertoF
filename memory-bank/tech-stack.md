# Tech Stack

## Frontend

Framework and runtime:
1. React 19.2.4
2. React DOM 19.2.4
3. TypeScript (configured via tsconfig files)
4. Vite 8.0.4

Evidence:
- Dependencies and scripts: [frontend/package.json](../frontend/package.json#L19), [frontend/package.json](../frontend/package.json#L20), [frontend/package.json](../frontend/package.json#L7), [frontend/package.json](../frontend/package.json#L8)
- Entrypoint: [frontend/src/main.tsx](../frontend/src/main.tsx)

UI and charting libraries:
1. Recharts 3.8.1
2. Lucide React 1.8.0
3. Tailwind CSS tooling via Vite plugin

Evidence:
- [frontend/package.json](../frontend/package.json#L21), [frontend/package.json](../frontend/package.json#L18), [frontend/package.json](../frontend/package.json#L26)
- Vite plugins: [frontend/vite.config.ts](../frontend/vite.config.ts#L1)

Testing and linting:
1. Vitest 4.1.4
2. ESLint 9.39.4

Evidence:
- [frontend/package.json](../frontend/package.json#L11), [frontend/package.json](../frontend/package.json#L9), [frontend/package.json](../frontend/package.json#L42), [frontend/package.json](../frontend/package.json#L33)

## Backend

Framework and runtime:
1. FastAPI (version not pinned in requirements file)
2. Uvicorn standard extras (version not pinned)
3. Python 3.13 base image in Dockerfile

Evidence:
- [backend/requirements.txt](../backend/requirements.txt#L1), [backend/requirements.txt](../backend/requirements.txt#L2)
- [backend/Dockerfile](../backend/Dockerfile#L1)
- App bootstrap: [backend/app/main.py](../backend/app/main.py)

API contract and validation:
1. Pydantic models define response payload structures.
2. Route decorators declare response_model contracts.

Evidence:
- [backend/app/routes.py](../backend/app/routes.py#L22), [backend/app/routes.py](../backend/app/routes.py#L30), [backend/app/routes.py](../backend/app/routes.py#L248), [backend/app/routes.py](../backend/app/routes.py#L305)

Testing tools:
1. pytest
2. pytest-cov
3. httpx

Evidence:
- [backend/requirements.txt](../backend/requirements.txt#L4), [backend/requirements.txt](../backend/requirements.txt#L5), [backend/requirements.txt](../backend/requirements.txt#L6)

## Infrastructure and Tooling

Local orchestration:
1. Docker Compose orchestrates frontend and backend services.
2. Frontend published on port 5173; backend on 8000; backend debug port 5678.

Evidence:
- [docker-compose.yml](../docker-compose.yml#L1), [docker-compose.yml](../docker-compose.yml#L7), [docker-compose.yml](../docker-compose.yml#L19), [docker-compose.yml](../docker-compose.yml#L20)

Container images:
1. Frontend image: node:24-alpine
2. Backend image: python:3.13-slim

Evidence:
- [frontend/Dockerfile](../frontend/Dockerfile#L1)
- [backend/Dockerfile](../backend/Dockerfile#L1)

Frontend-backend communication:
1. Frontend fetches /api/metrics.
2. Vite dev server proxies /api to backend service name backend:8000.

Evidence:
- [frontend/src/App.tsx](../frontend/src/App.tsx#L20)
- [frontend/vite.config.ts](../frontend/vite.config.ts#L12), [frontend/vite.config.ts](../frontend/vite.config.ts#L13)

## Current Stack Caveats (Observed)

1. Backend requirements are currently unpinned.
- Evidence: [backend/requirements.txt](../backend/requirements.txt)

2. Backend default runtime command includes debug tooling and reload.
- Evidence: [backend/Dockerfile](../backend/Dockerfile#L12)

3. No database service is configured in compose.
- Evidence: [docker-compose.yml](../docker-compose.yml)
