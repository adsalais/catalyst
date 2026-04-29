# Catalyst

A FastAPI server powering a showcase for **`virtual-scroll-grid`** — a high-performance, virtual-scrolling data grid implemented as a standalone Web Component.

## Main Feature: `virtual-scroll-grid`

`static/js/virtual-scroll-grid.js` is a zero-dependency custom element (`<virtual-scroll-grid>`) that renders massive datasets efficiently by only creating DOM nodes for the visible rows. It pages data on demand from any paginated API endpoint and never requires the server to supply a total row count — the end of the dataset is discovered organically when the server returns a page shorter than `page-size`, or an empty page.

### Quick Start

Drop the script on your page and declare the element with a `url` pointing to a paginated API:

```html
<script type="module" src="/static/js/virtual-scroll-grid.js"></script>

<virtual-scroll-grid
  url="/api/data"
  style="height:600px"
></virtual-scroll-grid>
```

That's it — columns are auto-detected from the first API response and the grid begins fetching and rendering immediately.

### Element Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `url` | string | *(required)* | Paginated API endpoint. The grid appends `?offset=N&limit=P` automatically. Changing this attribute triggers a full reload. |
| `page-size` | number | `100` | Rows requested per fetch. Changing this clears the cache and restarts from page 0. Keep it at or above twice the number of visible rows for smooth scrolling. |
| `cache-size` | number | `200` | Maximum pages held in the LRU cache. Evicted pages are re-fetched when scrolled back into view. Increase for heavy back-and-forth navigation. |
| `show-headers` | boolean | `true` | Set to `"false"` to hide the column header row. |
| `multi-select` | boolean | `true` | Set to `"false"` to restrict selection to a single row. Switching from multi to single while rows are selected retains only the most recently interacted row. |

### Methods

- **`reload()`** — Clears the page cache, resets selection and scroll position, then re-fetches from page 0.
- **`clearSelection()`** — Deselects all rows without affecting scroll position or focus.
- **`registerCellRenderer(datatype, fn)`** — Register (or replace) a renderer for the given datatype string. `fn` signature: `(value, col) => string | Node`. Returning a DOM Node allows rich content (badges, progress bars, icons). Scoped to this element instance only.
- **`setColumnHidden(key, hidden)`** — Hide or unhide a column by its key.
- **`getColumnVisibility()`** — Returns a `Map<key, boolean>` where `true` means the column is hidden.

### Expandable Cells

When a column header carries `"expand": true`, the cell value is **not** rendered in-line. Instead the grid places an "Expand" toggle button in the cell. Clicking it opens an inline expansion panel below the row — one dedicated panel per expanded column (two expanded columns on the same row produce two stacked panels). The panel renders the underlying value through the same `CellRendererRegistry`, so a `datatype: "json"` renderer can produce a rich, nested DOM tree for a complex JSON blob.

Expansion state is stored alongside the page in the LRU cache: it survives scrolling the row out of the viewport, but is dropped when the page is evicted or the grid is reloaded.

### Events

| Event | Detail | Description |
|---|---|---|
| `loading` | `{ loading: boolean }` | Fired when fetches start/stop. `loading` is `true` when at least one page fetch is in flight. |
| `selectionchange` | `{ selection: Array, indices: number[] }` | Fired when the selected set changes. `selection` contains the actual row objects; `indices` the 0-based row indices. |
| `columnresize` | `{ columnIndex, key, width, widths }` | Fired once when the user releases a column resize handle. `widths` is the pixel widths of all visible columns after the resize. |
| `error` | `{ pageIndex, error }` | Fired when a page fetch fails. |

### Keyboard Navigation

When the grid scroll area is focused:

| Key | Action |
|---|---|
| ↑ / ↓ | Move focused row |
| ← / → | Move focused column |
| PageUp / PageDown | Jump a viewport-height at a time |
| Home / End | Move to first/last column in current row |
| Ctrl+Home / Ctrl+End | Jump to very first / very last loaded row |
| Enter / Space | Toggle selection on focused row (respects Ctrl/Shift for multi-select) |
| Escape | Clear entire selection |

### Styling

#### CSS Custom Properties

Set these on the element or any ancestor:

| Property | Description |
|---|---|
| `--vsg-font` | Font-family for the grid |
| `--vsg-font-size` | Font-size |
| `--vsg-color` | Text color |
| `--vsg-border` | Outer border of the host element |
| `--vsg-cell-padding` | Padding inside every cell |
| `--vsg-row-height` | Fixed row height (informational; actual height is measured from a probe row) |
| `--vsg-row-bg` | Default row background |
| `--vsg-row-bg-alt` | Alternate (even) row background |
| `--vsg-row-bg-hover` | Row hover background |
| `--vsg-row-bg-selected` | Selected row background |
| `--vsg-row-border` | Row bottom border |
| `--vsg-header-bg` | Header row background |
| `--vsg-header-color` | Header text color |
| `--vsg-header-border` | Header bottom border |
| `--vsg-resize-handle-color` | Drag handle bar color |

#### CSS Parts

Pierce the shadow boundary from the light DOM:

```css
virtual-scroll-grid::part(header)            { background: #1a1a1a; color: #fff; }
virtual-scroll-grid::part(header-cell)       { /* individual header cell */ }
virtual-scroll-grid::part(row)               { /* data row */ }
virtual-scroll-grid::part(cell)              { padding: 8px 12px; }
virtual-scroll-grid::part(expand-btn)        { /* "Expand / Collapse" toggle */ }
virtual-scroll-grid::part(expansions)        { /* expansion container (per row) */ }
virtual-scroll-grid::part(expansion)         { /* a single expansion panel */ }
virtual-scroll-grid::part(expansion-label)   { /* small header label of a panel */ }
virtual-scroll-grid::part(expansion-close)   { /* "Collapse ✕" button inside panel */ }
virtual-scroll-grid::part(expansion-content) { /* content wrapper (rendered value) */ }
```

### Expected API Response Format

```
GET /api/data?offset=200&limit=100
```

```json
{
  "rows": [ "...up to 100 row objects or arrays..." ],
  "headers": [
    { "key": "id",   "label": "ID",   "width": 4,  "hidden": false },
    { "key": "name", "label": "Name", "width": 20, "growth": 1 },
    { "key": "data", "label": "Data", "width": 10, "datatype": "json", "expand": true }
  ]
}
```

**Pagination signals:**

- `rows.length === limit` → more pages likely exist; grid keeps fetching.
- `rows.length < limit` → this is the final page; grid stops fetching forward.
- `rows.length === 0` → offset is past the end; scroll snaps back to the last real row.

**Column auto-detection order** (when columns are not set programmatically):

1. `headers` array from the first API response.
2. Keys of the first row object, if no `headers` field is present.

### Custom Cell Renderers

Built-in defaults handle: `boolean`, `number`, `text`, `email`, `phone`, `status`, `percent`, `currency`, `date`.

You can override any of these or add new ones per element instance:

```js
const grid = document.querySelector('virtual-scroll-grid');

// Status → coloured pill badge
grid.registerCellRenderer('status', (val) => {
  const span = document.createElement('span');
  span.style.cssText = 'padding:2px 8px; border-radius:9999px; background:#fee2e2; color:#991b1b;';
  span.textContent = val;
  return span;
});

// Percent → mini progress bar
grid.registerCellRenderer('percent', (val) => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex; align-items:center; gap:6px;';
  const bar = document.createElement('div');
  bar.style.cssText = `width:${Math.round(val*100)}%; height:6px; background:steelblue;`;
  wrap.appendChild(bar);
  return wrap;
});
```

---

## The Showcase

The `index.html` served at the root is a fully interactive demo that exercises every feature of `virtual-scroll-grid`. It connects to a mock contact API (`/api/contact`) that generates 5 000 rows of richly varied data — names, emails, phone numbers, companies, tags, VIP flags, satisfaction scores, currency values, dates, and two deeply nested JSON blobs (`profile` and `metrics`) that demonstrate the expandable-cell feature.

### What the showcase demonstrates

| Feature | How it's shown |
|---|---|
| **Virtual scrolling** | 5 000 rows scroll smoothly; only the visible rows exist in the DOM. |
| **Paginated fetching** | Data is loaded on demand in pages of 50 rows from `/api/contact`. |
| **Column auto-detection** | Columns are defined by the `headers` array in the API response — no client-side config needed. |
| **Column resizing** | Drag any column header border to resize; a `columnresize` event is logged in the status bar. |
| **Row selection** | Click a row to select it; Ctrl+click for multi-select; Shift+click for range select. |
| **Keyboard navigation** | Arrow keys, PageUp/Down, Home/End, Ctrl+Home/End, Enter/Space, Escape all work. |
| **Expandable cells** | The "Profile" and "Metrics" columns have `expand: true`. Click the expand button to reveal a collapsible JSON tree below the row. |
| **Custom cell renderers** | Status tags render as coloured pill badges, booleans as ✓/✗, percentages as mini progress bars, currency as right-aligned formatted amounts, dates in a friendly format, and JSON as a fully interactive collapsible tree with a copy button. |
| **Column visibility toggle** | The "Headers" checkbox shows/hides the header row; hidden columns (like "Email") can be toggled. |
| **Multi-select toggle** | The "Multi" checkbox switches between single- and multi-select mode. |
| **Configurable paging** | Inputs let you change page size (10–500) and cache size on the fly. |
| **Selection inspector** | The "Inspect Selected" button opens a modal showing selected rows in a table plus raw JSON, with a copy-to-clipboard button. |
| **Event feedback** | A badge in the toolbar flashes on every `selectionchange`, `loading`, `columnresize`, or `error` event. Toast notifications appear for key actions. |
| **Status bar** | The footer shows the current focused cell, selection count, and last resize info, plus keyboard shortcut hints. |

---

## Prerequisites

- Python >= 3.12
- [uv](https://github.com/astral-sh/uv) (recommended) or pip

## Installation

### Using uv (recommended)

```bash
uv sync
```

### Using pip

```bash
pip install fastapi uvicorn
```

## Running the Server

### Option 1: Using the project script

```bash
uv run catalyst
```

Or with pip:

```bash
python -m catalyst
```

### Option 2: Using uvicorn directly

```bash
uv run uvicorn catalyst.server:app --reload --host 127.0.0.1 --port 8000
```

## Usage

Once the server is running, open your browser and navigate to:

- **Showcase**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Static assets**: [http://127.0.0.1:8000/static/](http://127.0.0.1:8000/static/)

## Project Structure

```
catalyst/
├── pyproject.toml
├── README.md
├── static/
│   ├── index.html                    # Interactive showcase / demo page
│   └── js/
│       └── virtual-scroll-grid.js    # The Web Component (main feature)
└── src/
    └── catalyst/
        ├── __init__.py               # Entry point (main)
        └── server.py                 # FastAPI app + /api/contact mock endpoint
```

## Adding More Static Files

Place any HTML, CSS, JS, or image files in the `static/` directory. They will be accessible under the `/static/` route. For example, `static/js/app.js` is available at `http://127.0.0.1:8000/static/js/app.js`.