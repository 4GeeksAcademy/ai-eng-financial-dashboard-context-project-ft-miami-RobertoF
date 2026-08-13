# Product Overview

## What This Project Is

This repository contains a financial metrics dashboard with:
1. A React + TypeScript frontend that renders KPI and chart views.
2. A FastAPI backend that serves financial metrics and analytics endpoints.

Evidence:
- Frontend entrypoint: [frontend/src/main.tsx](../frontend/src/main.tsx)
- Frontend app composition: [frontend/src/App.tsx](../frontend/src/App.tsx)
- Backend bootstrap: [backend/app/main.py](../backend/app/main.py)
- Backend routes: [backend/app/routes.py](../backend/app/routes.py)

## What It Does Today

1. Shows an executive dashboard with header, KPI row, and two financial charts.
- Evidence: [frontend/src/App.tsx](../frontend/src/App.tsx#L57), [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)

2. Fetches financial movements from the backend and derives KPI totals, monthly trend points, and a period label.
- Evidence: [frontend/src/App.tsx](../frontend/src/App.tsx#L20), [frontend/src/App.tsx](../frontend/src/App.tsx#L37), [frontend/src/App.tsx](../frontend/src/App.tsx#L39), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts#L28), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts#L43), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts#L76)

3. Exposes backend analytics endpoints for raw metrics, facets, summaries, top categories, comparisons, alerts, and business-type slices.
- Evidence: [backend/app/routes.py](../backend/app/routes.py#L248), [backend/app/routes.py](../backend/app/routes.py#L262), [backend/app/routes.py](../backend/app/routes.py#L268), [backend/app/routes.py](../backend/app/routes.py#L287), [backend/app/routes.py](../backend/app/routes.py#L305), [backend/app/routes.py](../backend/app/routes.py#L342), [backend/app/routes.py](../backend/app/routes.py#L362), [backend/app/routes.py](../backend/app/routes.py#L378)

4. Runs locally as two services and exposes API docs.
- Evidence: [docker-compose.yml](../docker-compose.yml#L1), [docker-compose.yml](../docker-compose.yml#L7), [docker-compose.yml](../docker-compose.yml#L19), [README.md](../README.md#L50)
- Runtime validation reference: [VALIDATED_REPO_UNDERSTANDING.md](../VALIDATED_REPO_UNDERSTANDING.md)

## Data Model Reality (Important)

The backend currently uses deterministic mock data generation, not a persistent database.
- Evidence: [backend/app/routes.py](../backend/app/routes.py#L94), [backend/app/routes.py](../backend/app/routes.py#L255), [backend/app/routes.py](../backend/app/routes.py#L350)
- Supporting evidence: no database service in [docker-compose.yml](../docker-compose.yml), no DB dependency in [backend/requirements.txt](../backend/requirements.txt)

## Primary User Value Right Now

A user can inspect income/outcome totals and trends over time from a single dashboard view, with backend endpoints already present for deeper analytical slices.
- Frontend current fetch path: [frontend/src/App.tsx](../frontend/src/App.tsx#L20)
- Additional backend analytical surface: [backend/app/routes.py](../backend/app/routes.py#L268), [backend/app/routes.py](../backend/app/routes.py#L287), [backend/app/routes.py](../backend/app/routes.py#L305), [backend/app/routes.py](../backend/app/routes.py#L342)
