# Bump Chart Panel — Visual Design Makeover

A summary of the design overhaul applied to `netsage-bumpchart-panel` (Grafana panel
plugin, React + D3 v7 → SVG). The goal: a cleaner, theme-aware, animated bump chart
that encodes both **rank** and **magnitude**, following data-visualization best
practices (validated palette, dual-end labeling, size-for-value, honest color,
guided interaction).

## Files changed

| File | What changed |
|------|--------------|
| `src/components/BumpChart.tsx` | New theme-aware palette; color-by-identity; Grafana Color-field support; `initialPositions` + value-extent in `transformData`; empty-data hardening |
| `src/components/RenderBumpChart.js` | Bulk of the rendering work (see below); dead code removed |
| `src/components/RenderBumpChart.d.ts` | Added the `opts` parameter |
| `src/module.ts` | New `lineWidth` option; re-enabled the standard **Color** field |
| `src/types.ts` | Added `lineWidth: number` |
| `provisioning/dashboards/dashboard.json` | Rebuilt with real bump chart panels + wide-format sample data |
| `provisioning/dashboards/sample-data.json` | Standalone copy of the sample frame for manual paste-in testing |
| `provisioning/datasources/datasources.yml` | Corrected TestData datasource type for Grafana 11+ |
| `provisioning/dashboards/sample-data.csv` | Wide-format CSV to paste into a TestData **CSV Content** panel |
| `.config/docker-compose-base.yaml` | Allow-list this unsigned plugin (was the scaffold id); mount/log under the correct id |
| `tests/panel.spec.ts` | Replaced leftover scaffold tests with tests that match this plugin |

## 1. Color

- **Replaced the cycling 15-color hard-code** with two validated, colorblind-safe
  **8-hue** palettes — one for light, one for dark — selected via `theme.isDark`.
- **Color follows entity identity, assigned by final rank, and is never cycled.**
  Entities beyond the 8 hues fold to a neutral gray so two different series can
  never share a color.
- **Grafana's per-series Color field is now honored** — a `fixed` color override
  wins over the palette slot. Fixed a config contradiction where `Color` was listed
  in both `standardOptions` and `disableStandardOptions`.

## 2. Labels & layout

- **Both ends now labeled.** Added a left axis with each line's *starting* rank
  (mirrors the existing right/final-rank axis) so a line can be traced end to end.
- **Rank numbers** (`#1 … #N`) prefix the right-axis labels, with tabular figures.
- **Bottom time axis is horizontal** with a capped, width-aware tick count
  (replaced the −60° rotation + word-wrapping).
- **Axis ticks respect the dashboard timezone.** Labels are rendered with Grafana's
  `dateTimeFormat` and the panel's `timeZone` prop; previously `d3.timeFormat` was
  used, which always formats in *browser* local time, so a UTC dashboard showed ticks
  hours off the data. Ticks are also placed on the actual data timestamps (thinned to
  fit the width) rather than d3's "nice" times — those are chosen against the
  browser's midnight and drift off the buckets. Each label now sits exactly under its
  column of nodes. The **Date Time Format** option keeps storing d3 strftime patterns
  (saved dashboards are unaffected); they're translated to moment tokens in
  `BumpChart.tsx`.
- **All SVG text inherits Grafana's theme font**; axes and ticks use theme ink
  colors, so the whole chart adapts to light/dark — not just the header.

## 3. Size & motion

- **Uniform, borderless nodes.** Every node is the same size, with no ring —
  radius is `0.75 × lineWidth`, so a node reads as a slight thickening of its own
  line and scales with the **Line Width** option.
- **One opacity (0.65) for lines and nodes**, so crossings stay readable through
  each other. (Nodes previously stacked `fill-opacity` under `opacity`, which
  rendered them at ~0.35 effective — noticeably fainter than the lines.)
- **Entrance animation** revived: lines draw in left-to-right via
  `stroke-dashoffset`; nodes grow from `r=0`. (The old animation path was dead —
  only reachable from a commented-out dropdown, now deleted along with its unused
  variables.)
- New **Line Width** option keeps the thick, woven bump-chart look tunable.

## 4. Interaction

- **Hover crosshair** — a vertical rule that snaps to the nearest timestamp so all
  ranks at one moment read together. The existing hover-to-isolate (dim the other
  series) is preserved and now scoped to this panel's own elements.
- **Richer, two-line tooltip** — rank and entity on the first line, metric value and
  the rank change vs. the previous bucket on the second:

  ```
  #3: seattle-r2
  Traffic: 95.2 Gbps  ▲2
  ```

  The delta is green for a rise, red for a drop, and absent at the first timestamp.
  The renderer hands the panel a structured payload (`TooltipPayload`) rather than a
  pre-formatted string, so the tooltip can be real markup — an embedded `\n` in a
  string collapses to one line inside Grafana's `<Tooltip>`. Hovering a *line*
  (rather than a node) still shows just the entity name.

## New panel options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| Line Width (px) | number | `6` | Thickness of the connecting lines; nodes scale with it |

Existing options (Header Text, Number of Lines, Date Time Format, Tooltip Metric
Label, Label Margin, Text Size) are unchanged.

## Running the dev server (unsigned plugin)

This plugin is unsigned, so Grafana must be told to load it. The dev container
(`.config/docker-compose-base.yaml`) now allow-lists it and mounts it under the
correct id (previously the leftover scaffold id `esnet-newexample-panel`):

```yaml
GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS: netsage-bumpchart-panel
```

```bash
npm run dev           # build + watch the plugin into ./dist
npm run server        # docker-compose → Grafana at http://localhost:3000
```

The provisioned dashboard **Bump Chart — Sample Data** loads automatically with two
panels:

- **Top Talkers — Bump Chart** — 12 simulated routers over 8 three-hour buckets,
  with values that weave so ranks cross (5 different entities hold rank-1 across the
  window). Uses the TestData `raw_frame` scenario with a **wide** frame (one time
  field + one numeric column per entity — the shape the plugin expects).
- **No data** — a `no_data_points` target to exercise the empty state.

Open the dashboard and try: toggle Grafana **light ↔ dark** (everything recolors),
change **Line Width** (nodes scale with it), hover a line/node (isolate + crosshair +
two-line ▲/▼ tooltip), and edit the options.

## Test data — CSV to copy/paste into Grafana

The plugin needs **wide-format** data: a `time` column plus one numeric column per
entity. To try it by hand without the provisioned dashboard:

1. Add a panel → data source **TestData DB** (or any `grafana-testdata-datasource`).
2. Set **Scenario** to **CSV Content**.
3. Paste the CSV below into the CSV Content box.
4. Change the visualization to **Bump Chart Panel**.

```csv
time,chicago-r1,seattle-r2,newyork-r1,denver-r3,atlanta-r2,dallas-r1,boston-r4,miami-r2,phoenix-r1,portland-r3,kansas-r2,boise-r5
2024-01-01T00:00:00Z,40,95.2,79.9,74.3,93.3,60,24.4,59,28.7,28.3,80,79
2024-01-01T03:00:00Z,50.2,107.9,74.5,37.7,78.7,30.7,12.4,68.3,40.2,48.5,113.9,88.6
2024-01-01T06:00:00Z,56.8,99.5,52.2,6.3,63.9,21.3,32.8,94.3,59.1,65,110.7,56.6
2024-01-01T09:00:00Z,57.5,75.9,37.3,29.1,54,38.3,63.2,96.4,78.6,66.5,74,33
2024-01-01T12:00:00Z,52.2,53,46.1,70.5,52.5,70,70.5,71.3,91.9,52,43.8,54.7
2024-01-01T15:00:00Z,42.5,46.4,69,65.9,59.9,94.9,46.6,58.2,94.5,31.5,53.2,87.8
2024-01-01T18:00:00Z,32,60.7,81,22.4,73.6,96.1,17.7,77.6,85.3,18.7,91.8,80.6
2024-01-01T21:00:00Z,24.3,86,68.9,8,88.8,72.8,15.3,99.1,67.7,22.5,117.6,44.4
```

> Set the dashboard time range to include **Jan 1, 2024** (e.g. an absolute range of
> 2023-12-31 22:00 → 2024-01-01 22:00 UTC) so the buckets are in view.

Notes:
- 12 entities, 10 lines shown by default → ranks 11–12 drop in and out of the top
  10, which is the intended bump-chart behavior (the query must return **more**
  groups than lines drawn).
- The same data is on disk as `provisioning/dashboards/sample-data.csv` and, in
  Grafana's `raw_frame` JSON form, `provisioning/dashboards/sample-data.json`.

## Tests

`tests/panel.spec.ts` was leftover `create-plugin` scaffolding (referenced a
`New-Example` viz, `simple-panel-circle`/series-counter test IDs, and a
"Show series counter" option — none of which exist here). It now has two tests that
match this plugin and run against the provisioned dashboard:

1. Panel id 2 (`no_data_points`) shows **"No data"**.
2. Panel id 1 (sample data) renders nodes — asserted via the `data-testid="bumpchart-node"`
   added to each circle.

```bash
npm run e2e           # requires the dev server running
```

## Verification performed

The D3 renderer and the wide-format sample data were exercised end-to-end in jsdom
(outside Grafana): 12 lines / 96 nodes, 8 distinct palette hues with 4 overflow
entities grayed, rank-prefixed labels, clean teardown on re-render, and the
empty-data guard all pass without throwing.

The feedback round above was verified by rendering the whole `BumpChart` panel with
`@testing-library/react` and driving real hover events: uniform node radius (`4.5` at
the default 6px line width) with no `stroke`/`fill-opacity`, lines and nodes both at
`opacity 0.65`, a two-line tooltip (`#3: newyork-r1` / `Traffic: 52.2 ▼1` with the
delta in the theme's error color), no delta at the first timestamp, name-only on line
hover, and isolate-then-restore returning every element to `0.65`. `npm run typecheck`,
`npm run lint`, and `npm run build` pass under Node 22.

Everything above was then confirmed in a **real Grafana 13.1.0** instance (run natively
via Homebrew — Docker was unavailable, so `npm run server` could not be used). In the
browser: 96 nodes all reporting `r=4.5` / `opacity=0.65` with no `stroke` or
`fill-opacity` attribute, lines at `opacity=0.65` / `stroke-width=6`, the two-line
tooltip (`#3: denver-r3` over `Traffic (Gbps): 70.5 Gbps ▲9`, green), hover-isolate and
the crosshair, and both light and dark themes. Axis ticks were checked against
`timezone=utc` (00:00–21:00, matching the data), `browser` (UTC−8), and `Asia/Kolkata`
(+5:30, rolling into 01/02) — and tick centers align to the node columns within 0px.

**Not run:** `npm run e2e`.

## Known trade-offs

- The entrance animation replays on any re-render (resize, time change, option
  edit), since the React effect re-runs. Acceptable for now; a "first render only"
  guard could be added if it feels busy.
- Node radius is applied inside a d3 transition, so a jsdom snapshot taken before the
  700ms animation lands will read a partial radius — wait for the transition when
  asserting on it.
