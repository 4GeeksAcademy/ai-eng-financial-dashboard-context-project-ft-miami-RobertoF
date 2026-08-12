# Frontend Data Period and Error Rules (Refined v1)

## Rule 1: No Hardcoded Reporting Periods

- Do not hardcode period labels in dashboard views.
- Period labels must always be computed from the fetched dataset date range.
- Explicit fallback labels are allowed only for transient or no-data states (for example: loading, empty payload, or fetch failure).

## Rule 2: Actionable API Error Messages

- User-facing API errors must include the failed endpoint path.
- Include HTTP status code when available from the thrown error context.
- Avoid generic catch blocks that discard the original error context.

## Trial Notes (Applied in This Repo)

- Applied Rule 1 to replace hardcoded period labels with derived labels from movement date range.
- Refined Rule 1 after implementation to explicitly allow fallback labels for loading and failure states.
- Applied Rule 2 to preserve endpoint and original error details in the dashboard error banner.
- Refined Rule 2 because status code is not always available for non-HTTP thrown errors.
