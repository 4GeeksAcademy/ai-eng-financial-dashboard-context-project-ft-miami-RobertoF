# Component Specifications

> Grounded in the real backend API (verified against `/docs` on the running
> server). This document specifies **names, props, layout, and edge-case
> behavior** for every component in the three features. It does **not**
> implement anything.

---

## Shared presentation primitives

These already exist in `src/components/` and are referenced by the new
features. No changes to their contracts are required.

### `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent`
- **Source:** `src/components/ui/card.tsx`
- **Props:** standard `React.ComponentProps<'div'>` — spread-through.
- **Layout:** rounded-xl bordered container, `py-6`; header/title/description
  stack; content padded `px-6`.

### `Skeleton`
- **Source:** `src/components/ui/skeleton.tsx`
- **Props:** standard `React.ComponentProps<'div'>`.
- **Usage:** rendered in place of a component's real content while
  `loading === true`.

---

## Feature 1 — Date range filter

### Component: `DateRangeFilter`

Filter bar rendered at the top of the home dashboard, above the KPI row.

**Props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `startDate` | `string` | yes | Current start value as `YYYY-MM-DD`, or `""` when empty. |
| `endDate` | `string` | yes | Current end value as `YYYY-MM-DD`, or `""` when empty. |
| `onStartDateChange` | `(value: string) => void` | yes | Fired with the raw `YYYY-MM-DD` string (or `""`) on every start-input change. |
| `onEndDateChange` | `(value: string) => void` | yes | Fired with the raw `YYYY-MM-DD` string (or `""`) on every end-input change. |
| `minDate` | `string` | yes | Earliest available date from `FacetsResponse.min_date`. |
| `maxDate` | `string` | yes | Latest available date from `FacetsResponse.max_date`. |
| `loading` | `boolean` | no (default `false`) | When `true`, render skeletons instead of the inputs. |

**Layout**
- A single row: two `<input type="date">` controls with a label each
  ("Start date", "End date") and a small hint text showing the valid range.
- The range hint reads: `Available range: {minDate} — {maxDate}`, rendered
  as muted helper text beside the inputs.

**Behavior**
- **Both empty:** all data is shown (no `start_date`/`end_date` query
  params are sent).
- **Start set, end empty:** sends only `start_date`. The dashboard shows
  every movement on or after `startDate`. This is a valid, supported
  request — the backend treats the missing end bound as unbounded.
- **End set, start empty:** sends only `end_date`. The dashboard shows
  every movement on or before `endDate`.
- **Both set:** sends both params; the API applies them as an inclusive
  range.
- **No automatic cross-validation** between the two inputs: if `startDate`
  is later than `endDate`, the request is still sent and the backend simply
  returns an empty result set (see empty-state rules on every consuming
  component).
- **Inputs never block typing.** The component is uncontrolled from the
  user's perspective: it never rejects or clears a value the user typed. It
  only reports the raw value via the change callbacks.

---

## Feature 2 — Anomaly alerts table

### Component: `AlertsPanel`

Card that owns the threshold input and renders the alerts table or the
empty state.

**Props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `alerts` | `AlertsResponse` | yes | Array of `AlertEntry` returned by `GET /api/metrics/alerts`. |
| `threshold` | `number` | yes | The currently applied threshold ratio (0.01–1.0). |
| `onThresholdChange` | `(value: number) => void` | yes | Fired whenever the applied threshold changes. |
| `startDate` | `string` | no (default `""`) | Active `YYYY-MM-DD` start filter, `""` when empty. |
| `endDate` | `string` | no (default `""`) | Active `YYYY-MM-DD` end filter, `""` when empty. |
| `minDate` | `string` | yes | Lower bound for the threshold input's date context (used for the reference hint only, not validation). |
| `maxDate` | `string` | yes | Upper bound for the threshold input's date context. |
| `loading` | `boolean` | no (default `false`) | When `true`, render a skeleton card. |
| `error` | `string \| null` | no (default `null`) | Non-null renders an error banner instead of the table. |

**Layout**
- Card header: title "Spending Alerts", description, and a numeric
  threshold input on the right (`CardAction` slot).
- Threshold input: `type="number"`, `min=0.01`, `max=1.0`, `step=0.01`,
  default value `0.3`, labeled "Spike threshold".
- Body: a four-column table, or the empty state, or an error banner.

**Table columns**

| Column | Data type | Source field | Formatting |
|--------|-----------|--------------|------------|
| Period | `string` | `AlertEntry.period` | As returned (e.g. `"2025-12"`). |
| Recorded outcome | `number` | `AlertEntry.outcome_total` | `formatCurrency` (USD, 0 decimals). |
| Rolling avg (prev. 3) | `number` | `AlertEntry.baseline_average` | `formatCurrency` (USD, 0 decimals). |
| % increase | `number` | `AlertEntry.increase_ratio` | `(ratio * 100).toFixed(1) + "%"`. |

**Edge cases**

- **Empty alerts array (`alerts.length === 0`):** the table is **not**
  rendered. In its place, a centered empty-state block is rendered with the
  explicit message **"No anomalies detected for the current threshold."**
  A `data-slot="alerts-empty"` marker makes it testable. The empty state
  must render even if the table previously had rows — switching the
  threshold can make rows appear/disappear.
- **Invalid threshold input:**
  - **Out of range (below 0.01 or above 1.0):** the applied threshold is
    clamped to the nearest valid bound for the request, and the field is
    marked with an inline error message:
    `"Threshold must be between 0.01 and 1.0."` The table keeps showing
    data from the last **valid** applied threshold until a valid value is
    committed — it must not flash an empty state or crash.
  - **Non-numeric / empty input:** treated as "not a number". No request is
    fired; the table keeps the last valid results. The field shows a hint
    that a number between `0.01` and `1.0` is expected.
- **Date range active (from Feature 1):** the alerts request includes
  `start_date`/`end_date`. If that range yields no alerts, the same empty
  state as above is shown.
- **Fetch error:** if `error` is non-null, render a destructive banner with
  the message and **do not** render the table.

---

## Feature 3 — B2B vs B2C comparison view

### Component: `ComparisonPage`

Page-level container for the whole comparison view. Owns the shared date
range state and orchestrates the two fetches.

**Props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `startDate` | `string` | no (default `""`) | Shared `YYYY-MM-DD` start filter. |
| `endDate` | `string` | no (default `""`) | Shared `YYYY-MM-DD` end filter. |
| `onStartDateChange` | `(value: string) => void` | yes | Forwards changes to the page's shared filter. |
| `onEndDateChange` | `(value: string) => void` | yes | Forwards changes to the page's shared filter. |
| `minDate` | `string` | yes | From `FacetsResponse.min_date`. |
| `maxDate` | `string` | yes | From `FacetsResponse.max_date`. |
| `b2bTopCategories` | `TopCategoriesResponse` | yes | Top income categories for B2B. |
| `b2cTopCategories` | `TopCategoriesResponse` | yes | Top income categories for B2C. |
| `comparison` | `MetricsComparison` | no (default `null`) | Net comparison for the comparison chart, or `null` when unavailable. |
| `loading` | `boolean` | no (default `false`) | When `true`, render skeleton panels. |
| `error` | `string \| null` | no (default `null`) | Non-null renders a page-level error banner. |

**Layout**
- Page header: title "B2B vs B2C" + subtitle.
- A `DateRangeFilter` instance at the top (same contract as Feature 1).
- A `grid grid-cols-1 lg:grid-cols-2 gap-4` row containing two `B2B2CPanel`
  instances — left labelled "B2B", right labelled "B2C".
- Below the panels, a full-width `IncomeComparisonChart`.

**Edge cases**

- **Date range with only one bound filled:** forwarded to the two
  `/categories/top` requests and the comparison request exactly as in
  Feature 1 (unbounded on the missing side).
- **Both panels empty / error:** if `error` is set, a page-level
  destructive banner replaces both panels and the chart.

### Component: `B2B2CPanel`

Single business-line panel (one instance per business type).

**Props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | yes | `"B2B"` or `"B2C"`. |
| `items` | `TopCategoriesResponse` | yes | Top income categories for this business type. |
| `totalAmount` | `number` | yes | Sum of income for this business type (group total), used as the denominator for percentages. |
| `loading` | `boolean` | no (default `false`) | When `true`, render a skeleton panel. |

**Layout**
- Card with `CardTitle` = title, `CardDescription` = "Top 5 income
  categories".
- Body: a table with three columns: **Category**, **Total income**,
  **% of group total**.
- **% of group total** = `total_amount / totalAmount * 100`, rendered with
  `toFixed(1) + "%"`. When `totalAmount === 0`, every percentage renders as
  `"—"`.

**Edge cases**

- **Empty top-5 list (`items.length === 0`):** the table is **not**
  rendered. A centered empty-state block reads
  **"No income categories available for {title}."**
  (`data-slot="panel-empty"`). This happens when the date range excludes all
  income movements for that business type, or when there is genuinely no
  data.
- **`totalAmount === 0` with a non-empty list:** rows render with `"—"` in
  the percentage column (avoids division by zero and a misleading `0.0%`).
- **Only one bound of the date range set:** the panel simply renders
  whatever the API returned for the applied filter; no local validation.

### Component: `IncomeComparisonChart`

Comparison chart below the two panels.

**Props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `b2bTotal` | `number` | yes | Total income for B2B (USD) over the active range. |
| `b2cTotal` | `number` | yes | Total income for B2C (USD) over the active range. |
| `loading` | `boolean` | no (default `false`) | When `true`, render a skeleton chart. |

**Layout**
- Card title "Income: B2B vs B2C".
- A bar chart (`recharts` `BarChart`) with **exactly two** bars, one per
  business type:
  - **B2B bar** — value `b2bTotal`, fill `var(--chart-income)`.
  - **B2C bar** — value `b2cTotal`, fill `var(--chart-outcome)`.
- Y axis formatted as `$Xk` (thousands). Tooltip shows `formatCurrency`.

**Edge cases**

- **Both totals are 0:** render the same centered empty state message
  **"No income data available for the selected range."** — do not draw an
  empty chart.
- **One total is 0:** still render both bars (the zero bar just has no
  height); the tooltip still shows `$0`. No empty state in this case.

---

## Shared consumer behavior (empty data)

The following rule applies to **every** component that consumes
`/api/metrics` data affected by the date range:

- When the applied date range returns an empty dataset, the component shows
  its **explicit empty state** (defined above per component) — never a
  blank area, never a crash, never a misleading `$0` chart.

---

## File mapping

| Feature | Component | Suggested file |
|---------|-----------|----------------|
| 1 | `DateRangeFilter` | `src/components/dashboard/date-range-filter.tsx` |
| 2 | `AlertsPanel` | `src/components/dashboard/alerts-panel.tsx` |
| 3 | `ComparisonPage` | `src/components/comparison/comparison-page.tsx` |
| 3 | `B2B2CPanel` | `src/components/comparison/b2b2c-panel.tsx` |
| 3 | `IncomeComparisonChart` | `src/components/comparison/income-comparison-chart.tsx` |
