/**
 * @element virtual-scroll-grid
 *
 * A high-performance virtual-scrolling data grid web component. It pages
 * data on demand and never requires the server to supply a total row count —
 * the end of the dataset is discovered organically when the server returns a
 * page shorter than `page-size`, or an empty page.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * QUICK START
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   <!-- Columns are always auto-detected from the first response -->
 *   <virtual-scroll-grid url="/api/data" style="height:600px"></virtual-scroll-grid>
 *
 *   <!-- Single-select, smaller pages -->
 *   <virtual-scroll-grid
 *     url="/api/users"
 *     page-size="50"
 *     multi-select="false"
 *     style="height:400px">
 *   </virtual-scroll-grid>
 *
 *   <script>
 *     const grid = document.querySelector('virtual-scroll-grid');
 *     grid.addEventListener('selectionchange', e => console.log(e.detail));
 *   </script>
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ELEMENT ATTRIBUTES
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   url           {string}  [required]
 *     Paginated API endpoint. The grid appends ?offset=N&limit=P automatically.
 *     Changing this attribute triggers a full reload.
 *
 *   page-size     {number}  [default: 100]
 *     Number of rows requested per fetch. Changing this clears the cache and
 *     restarts from page 0. Keep it at or above twice the number of visible
 *     rows for smooth scrolling.
 *
 *   cache-size    {number}  [default: 200]
 *     Maximum number of pages held in the LRU cache. Each evicted page must
 *     be re-fetched when scrolled back into view. Increase this for datasets
 *     with heavy back-and-forth navigation.
 *
 *   show-headers  {boolean} [default: true]
 *     Set to "false" to hide the column header row entirely.
 *
 *   multi-select  {boolean} [default: true]
 *     Set to "false" to restrict selection to a single row at a time.
 *     Switching from multi to single while rows are selected retains only
 *     the most recently interacted row.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * METHODS
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   reload()
 *     Clears the page cache, resets selection and scroll position, then
 *     re-fetches from page 0. Use after server-side data mutations.
 *
 *   clearSelection()
 *     Deselects all rows without affecting scroll position or focus.
 *
 *   registerCellRenderer(datatype, fn)
 *     Register (or replace) a renderer for the given datatype string.
 *     fn signature: (value: any, col: ColumnDef) => string | Node
 *     Returning a DOM Node allows rich content (badges, bars, icons).
 *     The renderer is scoped to this element instance only.
 *     Built-in defaults: boolean, number, text, email, phone, status,
 *     percent, currency, date.
 *
 *   EXPANDABLE CELLS (expand:true on a column)
 *     When a column header carries `"expand": true`, the cell value is NOT
 *     rendered in-line. Instead the grid places an "Expand" toggle button
 *     in the cell. Clicking the button opens an inline expansion panel
 *     below the row (one dedicated panel per expanded column; two expanded
 *     columns on the same row produce two stacked panels). The panel
 *     renders the underlying value through the same CellRendererRegistry —
 *     so a `datatype: "json"` renderer can produce a rich, nested DOM
 *     tree for a complex JSON blob.
 *
 *     Expansion state is stored alongside the page in the LRU cache: it
 *     survives scrolling the row out of the viewport, but is dropped when
 *     the page itself is evicted from the cache (or the page is replaced
 *     by a reload). The toggle button is exposed as `::part(expand-btn)`
 *     and can be styled freely from the light DOM.
 *
 *   setColumnHidden(key, hidden)
 *     Hide or unhide a column by its key. Hidden columns are removed from
 *     the header and data rows but remain present in selection data.
 *
 *   getColumnVisibility()
 *     Returns a Map<key, boolean> where true means the column is hidden.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EVENTS
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   loading
 *     Fired whenever the grid starts or stops fetching data.
 *     detail: { loading: boolean }
 *       loading — true when at least one page fetch is in flight, false when
 *                 all pending fetches have completed.
 *
 *   selectionchange
 *     Fired whenever the selected set changes (click, keyboard, or programmatic).
 *     detail: { selection: Array<rowData>, indices: number[] }
 *       selection — the actual row objects/arrays in selection order.
 *       indices   — the corresponding absolute row indices (0-based).
 *
 *   columnresize
 *     Fired once when the user releases a column resize handle.
 *     detail: { columnIndex: number, key: string, width: number, widths: number[] }
 *       columnIndex — 0-based index of the resized column among VISIBLE columns.
 *       key         — column key string.
 *       width       — final pixel width of the resized column.
 *       widths      — pixel widths of ALL VISIBLE columns after the resize.
 *
 *   error
 *     Fired when a page fetch fails (network error or non-2xx status).
 *     detail: { pageIndex: number, error: string }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * KEYBOARD NAVIGATION (when the grid scroll area is focused)
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   ArrowUp / ArrowDown   — move focused row
 *   ArrowLeft / ArrowRight — move focused column
 *   PageUp / PageDown     — jump a viewport-height at a time
 *   Home / End            — move to first/last column in current row
 *   Ctrl+Home / Ctrl+End  — jump to very first / very last loaded row
 *   Enter / Space         — toggle selection on focused row (respects
 *                           Ctrl/Shift modifiers for multi-select)
 *   Escape                — clear entire selection
 *
 * ─────────────────────────────────────────────────────────────────────────
 * STYLING — CSS CUSTOM PROPERTIES
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   Set these on the element or any ancestor:
 *
 *   --vsg-font                 font-family for the grid (default: inherit)
 *   --vsg-font-size            font-size (default: inherit)
 *   --vsg-color                text color (default: inherit)
 *   --vsg-border               outer border of the host element (default: none)
 *   --vsg-cell-padding         padding inside every cell (default: 0)
 *
 *   --vsg-row-height           fixed row height (informational; actual height
 *                               is measured from a probe row)
 *   --vsg-row-bg               default row background
 *   --vsg-row-bg-alt           alternate (even) row background
 *   --vsg-row-bg-hover         row hover background
 *   --vsg-row-bg-selected      selected row background
 *   --vsg-row-border           row bottom border
 *
 *   --vsg-header-bg            header row background
 *   --vsg-header-color         header text color
 *   --vsg-header-border        header bottom border
 *   --vsg-resize-handle-color  drag handle bar color (default: rgba(255,255,255,0.3))
 *
 * ─────────────────────────────────────────────────────────────────────────
 * STYLING — CSS PARTS  (pierce the shadow boundary from the light DOM)
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   virtual-scroll-grid::part(header)           — header row container
 *   virtual-scroll-grid::part(header-cell)      — individual header cell
 *   virtual-scroll-grid::part(row)              — data row
 *   virtual-scroll-grid::part(cell)             — data cell
 *   virtual-scroll-grid::part(expand-btn)       — "Expand / Collapse" toggle
 *   virtual-scroll-grid::part(expansions)       — expansion container (per row)
 *   virtual-scroll-grid::part(expansion)        — a single expansion panel
 *   virtual-scroll-grid::part(expansion-label)  — small header label of a panel
 *   virtual-scroll-grid::part(expansion-close)  — "Collapse ✕" button inside panel
 *   virtual-scroll-grid::part(expansion-content)— content wrapper (rendered value)
 *
 *   Example:
 *     virtual-scroll-grid::part(header) { background: #1a1a1a; color: #fff; }
 *     virtual-scroll-grid::part(cell)   { padding: 8px 12px; }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EXPECTED API RESPONSE FORMAT
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   GET /api/data?offset=200&limit=100
 *
 *   {
 *     "rows": [ ...up to 100 row objects or arrays... ],
 *     "headers": [                   // optional; used for auto-column-detection
 *       { "key": "id",   "label": "ID",    "width": 4,  "hidden": false },
 *       { "key": "name", "label": "Name",  "width": 20, "growth": 1 }
 *     ]
 *   }
 *
 *   Pagination signals:
 *     rows.length === limit  → more pages likely exist; grid will keep fetching.
 *     rows.length <  limit   → this is the final page; grid stops fetching forward.
 *     rows.length === 0      → offset is past the end; scroll is snapped back to
 *                              the last real row.
 *
 *   Row format — either an object (keyed by column `key`) or a plain array
 *   (values addressed positionally by column order).
 *
 *   Column auto-detection order (when `columns` property is not set):
 *     1. `headers` array from the first API response.
 *     2. Keys of the first row object, if no `headers` field is present.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * INTERNAL ARCHITECTURE  (for contributors)
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   PageLRUCache      — insertion-ordered Map with O(1) LRU eviction.
 *   RangeSelection    — sorted array of non-overlapping [start,end] intervals
 *                       supporting O(log n) membership tests.
 *   SelectionModel    — wraps RangeSelection; owns the row-data snapshot store
 *                       and anchor/shift-select logic.
 *   DataSource        — fetch lifecycle, abort-generation guard, column
 *                       auto-detection, and the LRU page cache.
 *   Viewport          — thin wrapper over the scroll element; owns the
 *                       ResizeObserver and the row-height probe.
 *   Renderer          — DOM pool, column flex layout, drag-resize, and the
 *                       per-frame diff/patch loop.
 *   VirtualScrollCore — coordinator: wires all subsystems together and owns
 *                       the rAF update loop.
 *   VirtualScrollGrid — HTMLElement wrapper; handles attribute reflection and
 *                       connect/disconnect lifecycle.
 */

const MINIMAL_CSS = `
  :host {
    display: block;
    height: 100%;
    box-sizing: border-box;
    border: var(--vsg-border, none);
    font-family: var(--vsg-font, inherit);
    font-size: var(--vsg-font-size, inherit);
    color: var(--vsg-color, inherit);
    position: relative;
  }

  .vsg-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .vsg-header-row {
    display: flex;
    flex-shrink: 0;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    background: var(--vsg-header-bg, transparent);
    color: var(--vsg-header-color, inherit);
    border-bottom: var(--vsg-header-border, none);
    overflow-x: auto;
    overflow-y: hidden;

    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .vsg-header-row::-webkit-scrollbar {
    display: none;
  }

  .vsg-header-cell {
    flex-shrink: 0;
    overflow: visible;
    padding: var(--vsg-cell-padding, 0);
    box-sizing: border-box;
    border-right: 1px solid var(--vsg-header-border-color, rgba(255,255,255,0.15));
    position: relative;
  }

  .vsg-resize-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 7px;
    height: 100%;
    cursor: col-resize;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vsg-resize-handle::after {
    content: '';
    display: block;
    width: 2px;
    height: 60%;
    background: var(--vsg-resize-handle-color, rgba(255,255,255,0.3));
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .vsg-header-cell:hover .vsg-resize-handle::after,
  .vsg-resize-handle:hover::after,
  .vsg-resize-handle.active::after {
    opacity: 1;
  }

  :host(.col-resizing) {
    cursor: col-resize;
    user-select: none;
  }

  .vsg-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    position: relative;
    outline: none;
    contain: layout style;
  }

  .vsg-spacer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-width: min-content;
    pointer-events: none;
  }

  .vsg-content {
    position: absolute;
    top: 0;
    left: 0;
    width: min-content;
    min-width: 100%;
    will-change: transform;
  }

  .vsg-content.selectable .vsg-row {
    cursor: pointer;
  }

  .vsg-row {
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    width: 100%;
    background: var(--vsg-row-bg, transparent);
    border-bottom: var(--vsg-row-border, none);
    contain: layout paint;
  }

  .vsg-row:nth-child(even) {
    background: var(--vsg-row-bg-alt, var(--vsg-row-bg, transparent));
  }

  .vsg-row:hover {
    background: var(--vsg-row-bg-hover, var(--vsg-row-bg, transparent));
  }

  .vsg-row.selected,
  .vsg-row.selected:hover,
  .vsg-row.selected:focus {
    background: var(--vsg-row-bg-selected, var(--vsg-row-bg-hover, var(--vsg-row-bg, transparent)));
  }

  .vsg-row:focus {
    outline: none;
  }

  .vsg-cell {
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: var(--vsg-cell-padding, 0);
    box-sizing: border-box;
    border-right: 1px solid var(--vsg-row-border-color, rgba(0,0,0,0.06));
    position: relative;
    user-select: text;
  }

  .vsg-cell.focused-cell {
    outline: none;
  }

  .vsg-cell-content {
    min-height: 1px;
  }

  .vsg-copy-btn {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    padding: 0;
    margin: 0;
    border: 1px solid rgba(0,0,0,0.15);
    background: rgba(255,255,255,0.95);
    color: #555;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.12s ease, background 0.12s ease;
    z-index: 2;
    font-size: 11px;
    line-height: 1;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }

  .vsg-cell:hover .vsg-copy-btn {
    opacity: 1;
  }

  .vsg-copy-btn:hover {
    background: #f0f0f0;
    color: #000;
    border-color: rgba(0,0,0,0.25);
  }

  .vsg-copy-btn:active {
    background: #e0e0e0;
  }

  .vsg-header-cell-label {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .vsg-col-toggle-btn {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    padding: 0;
    margin: 0;
    border: 1px solid rgba(0,0,0,0.15);
    background: rgba(255,255,255,0.95);
    color: #555;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s ease, background 0.12s ease;
    z-index: 4;
    line-height: 1;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }

  .vsg-root:has(.vsg-header-cell:first-child:hover) .vsg-col-toggle-btn,
  .vsg-col-toggle-btn:hover,
  .vsg-col-toggle-btn.open {
    opacity: 1;
    pointer-events: auto;
  }

  .vsg-col-toggle-btn:hover {
    background: #f0f0f0;
    color: #000;
    border-color: rgba(0,0,0,0.25);
  }

  .vsg-col-toggle-menu {
    position: absolute;
    top: 28px;
    left: 3px;
    z-index: 10;
    background: #fff;
    color: #000;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 4px 0;
    min-width: 160px;
    max-height: 300px;
    overflow-y: auto;
    display: none;
    font-size: 13px;
  }

  .vsg-col-toggle-menu.open {
    display: block;
  }

  .vsg-col-toggle-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  .vsg-col-toggle-item:hover {
    background: rgba(0,0,0,0.06);
  }

  .vsg-col-toggle-item input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
  }

  /* ── Expandable cells (datatype:json with expand:true) ─────────── */

  .vsg-expand-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-family: inherit;
    font-size: var(--vsg-expand-btn-font-size, 11px);
    font-weight: 500;
    line-height: 1.2;
    color: var(--vsg-expand-btn-color, #374151);
    background: var(--vsg-expand-btn-bg, rgba(255,255,255,0.9));
    border: 1px solid var(--vsg-expand-btn-border, rgba(0,0,0,0.2));
    border-radius: var(--vsg-expand-btn-radius, 4px);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  .vsg-expand-btn:hover {
    background: var(--vsg-expand-btn-bg-hover, #f3f4f6);
    color: var(--vsg-expand-btn-color-hover, #111827);
  }

  .vsg-expand-btn.open {
    background: var(--vsg-expand-btn-bg-open, #dbeafe);
    color: var(--vsg-expand-btn-color-open, #1e40af);
    border-color: var(--vsg-expand-btn-border-open, #93c5fd);
  }

  .vsg-expand-btn-chevron {
    display: inline-block;
    transition: transform 0.15s ease;
    font-size: 0.9em;
    line-height: 1;
  }

  .vsg-expand-btn.open .vsg-expand-btn-chevron {
    transform: rotate(90deg);
  }

  .vsg-row-expansions {
    /* Flex item inside .vsg-row (flex-wrap: wrap) that takes a full line
       of its own — cells with min-width: basis prevent them from wrapping
       with this item, so this reliably lands under all the cells. */
    flex: 1 0 100%;
    order: 999;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    background: var(--vsg-expansion-bg, rgba(0,0,0,0.03));
    border-top: 1px solid var(--vsg-row-border-color, rgba(0,0,0,0.06));
  }

  .vsg-row-expansions:empty {
    display: none;
  }

  .vsg-row-expansion {
    padding: var(--vsg-expansion-padding, 10px 14px);
    border-bottom: 1px dashed var(--vsg-row-border-color, rgba(0,0,0,0.06));
    box-sizing: border-box;
    min-width: 0;
    /* Sticky-fit to the viewport so the panel stays visible while the
       user scrolls horizontally through wide rows. --vsg-viewport-width
       is updated in JS by #syncScrollbarGutter whenever the scroll
       container is resized. */
    position: sticky;
    left: 0;
    width: var(--vsg-viewport-width, 100%);
    max-width: 100%;
  }

  .vsg-row-expansion:last-child {
    border-bottom: none;
  }

  .vsg-row-expansion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .vsg-row-expansion-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--vsg-expansion-label-color, #6b7280);
  }

  .vsg-row-expansion-close {
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    color: var(--vsg-expansion-close-color, #6b7280);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 3px;
    padding: 1px 6px;
    cursor: pointer;
  }

  .vsg-row-expansion-close:hover {
    background: rgba(0,0,0,0.05);
    color: var(--vsg-expansion-close-color-hover, #111827);
  }

  .vsg-row-expansion-content {
    font-size: inherit;
    color: inherit;
  }
`;

/* ------------------------------------------------------------------ */
/* 0. Shared Constructable Stylesheet (parsed once, adopted by all)   */
/* ------------------------------------------------------------------ */

const VSG_STYLESHEET = new CSSStyleSheet();
VSG_STYLESHEET.replaceSync(MINIMAL_CSS);

const BUFFER_ROWS = 10;
const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_CACHE_SIZE = 200;

/* ------------------------------------------------------------------ */
/* Module helpers                                                     */
/* ------------------------------------------------------------------ */

function createEl(tag, cls, parent, attrs = {}) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  parent?.appendChild(el);
  return el;
}

function getVal(row, col, colIndex) {
  if (Array.isArray(row)) return row[colIndex];
  return row[col.key];
}

async function copyToClipboard(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText =
      "position:fixed;inset-block-start:-9999px;opacity:0;pointer-events:none;";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {}
    ta.remove();
  }
}

/* ------------------------------------------------------------------ */
/* CellRendererRegistry                                               */
/* ------------------------------------------------------------------ */

/**
 * Registry that maps a datatype string to a renderer function.
 *
 * Renderer signature:
 *   (value: any, col: ColumnDef) => string | Node
 *
 * Built-in datatypes: boolean, number, text, email, phone, status,
 *   percent, currency, date.
 *
 * Custom renderers registered here take precedence over the legacy
 * `col.type` field.  When no datatype renderer is found the classic
 * formatCell() logic is used as a fallback.
 */
class CellRendererRegistry {
  #renderers = new Map();

  constructor() {}

  /**
   * Register (or replace) a renderer for a given datatype.
   * @param {string}   datatype  — matches the `datatype` field from the server header.
   * @param {Function} fn        — (value, col) => string | Node
   */
  register(datatype, fn) {
    if (typeof fn !== "function")
      throw new TypeError("renderer must be a function");
    this.#renderers.set(String(datatype), fn);
  }

  /** @returns {Function|undefined} */
  get(datatype) {
    return datatype != null ? this.#renderers.get(String(datatype)) : undefined;
  }
}

// Module-level shared registry instance.
// Users can also call grid.registerCellRenderer() per-element.
const DEFAULT_CELL_RENDERER_REGISTRY = new CellRendererRegistry();

/**
 * Resolve a cell value to a string or Node.
 *
 * Resolution order:
 *   1. Element-local registry (datatype)
 *   2. Element-local registry (legacy col.type)
 *   3. Module-level default registry (datatype)
 *   4. Module-level default registry (legacy col.type)
 *   5. Classic inline logic
 *
 * @param {*}                  val
 * @param {ColumnDef}          col
 * @param {CellRendererRegistry|null} localRegistry
 * @returns {string|Node}
 */
function formatCell(val, col, localRegistry = null) {
  if (val == null) return "";

  const datatype = col?.datatype;
  const legacyType = col?.type;

  // Check local registry first, then module default
  for (const registry of [localRegistry, DEFAULT_CELL_RENDERER_REGISTRY]) {
    if (!registry) continue;
    const fn = registry.get(datatype) ?? registry.get(legacyType);
    if (fn) return fn(val, col);
  }

  // Classic fallback (preserves behaviour for callers that never set a type)
  if (legacyType === "boolean") return val ? "✓" : "✗";
  if (legacyType === "number")
    return typeof val === "number" ? val.toLocaleString() : val;
  return String(val);
}

/* ------------------------------------------------------------------ */
/* 1. EventEmitter base                                               */
/* ------------------------------------------------------------------ */

class EventEmitter {
  #listeners = {};

  on(evt, cb) {
    (this.#listeners[evt] ??= []).push(cb);
    return this;
  }

  off(evt, cb) {
    this.#listeners[evt]?.splice(this.#listeners[evt].indexOf(cb) >>> 0, 1);
  }

  emit(evt, data) {
    this.#listeners[evt]?.forEach((cb) => cb(data));
  }
}

/* ------------------------------------------------------------------ */
/* 2. PageLRUCache                                                    */
/* ------------------------------------------------------------------ */

class PageLRUCache {
  #maxPages;
  #pages = new Map();
  // Per-page expansion state: Map<pageIndex, Map<rowIndex, Set<colKey>>>.
  // Stored alongside the page so eviction drops the expansions with it —
  // giving the documented "survives scroll, dies with cache eviction" behaviour.
  #expansions = new Map();

  constructor(maxPages = DEFAULT_CACHE_SIZE) {
    this.#maxPages = maxPages;
  }

  setMaxPages(maxPages) {
    this.#maxPages = maxPages;
    while (this.#pages.size > this.#maxPages) {
      const key = this.#pages.keys().next().value;
      this.#pages.delete(key);
      this.#expansions.delete(key);
    }
  }

  setPage(pageIndex, rows) {
    if (this.#pages.has(pageIndex)) {
      // Replacing an existing page resets its expansion state.
      this.#expansions.delete(pageIndex);
    }
    this.#pages.delete(pageIndex);
    this.#pages.set(pageIndex, rows);
    if (this.#pages.size > this.#maxPages) {
      const evict = this.#pages.keys().next().value;
      this.#pages.delete(evict);
      this.#expansions.delete(evict);
    }
  }

  getRow(rowIndex, pageSize) {
    const pageIndex = Math.floor(rowIndex / pageSize);
    const page = this.#pages.get(pageIndex);
    if (!page) return undefined;
    return page[rowIndex % pageSize];
  }

  touchPage(pageIndex) {
    const page = this.#pages.get(pageIndex);
    if (!page) return;
    this.#pages.delete(pageIndex);
    this.#pages.set(pageIndex, page);
  }

  batchTouchPages(pageIndexSet) {
    for (const pageIndex of pageIndexSet) this.touchPage(pageIndex);
  }

  hasPage(pageIndex) {
    return this.#pages.has(pageIndex);
  }

  clear() {
    this.#pages.clear();
    this.#expansions.clear();
  }

  /* ── Expansion state API ─────────────────────────────────────────── */

  isCellExpanded(rowIndex, pageSize, colKey) {
    const pageIndex = Math.floor(rowIndex / pageSize);
    if (!this.#pages.has(pageIndex)) return false;
    const pageExp = this.#expansions.get(pageIndex);
    if (!pageExp) return false;
    const rowExp = pageExp.get(rowIndex);
    return rowExp ? rowExp.has(colKey) : false;
  }

  setCellExpanded(rowIndex, pageSize, colKey, expanded) {
    const pageIndex = Math.floor(rowIndex / pageSize);
    // Only track expansions for pages currently in cache.
    if (!this.#pages.has(pageIndex)) return false;

    if (expanded) {
      let pageExp = this.#expansions.get(pageIndex);
      if (!pageExp) {
        pageExp = new Map();
        this.#expansions.set(pageIndex, pageExp);
      }
      let rowExp = pageExp.get(rowIndex);
      if (!rowExp) {
        rowExp = new Set();
        pageExp.set(rowIndex, rowExp);
      }
      if (rowExp.has(colKey)) return false;
      rowExp.add(colKey);
      return true;
    }

    const pageExp = this.#expansions.get(pageIndex);
    if (!pageExp) return false;
    const rowExp = pageExp.get(rowIndex);
    if (!rowExp || !rowExp.has(colKey)) return false;
    rowExp.delete(colKey);
    if (rowExp.size === 0) pageExp.delete(rowIndex);
    if (pageExp.size === 0) this.#expansions.delete(pageIndex);
    return true;
  }

  getExpandedColKeys(rowIndex, pageSize) {
    const pageIndex = Math.floor(rowIndex / pageSize);
    if (!this.#pages.has(pageIndex)) return null;
    const pageExp = this.#expansions.get(pageIndex);
    if (!pageExp) return null;
    const rowExp = pageExp.get(rowIndex);
    return rowExp && rowExp.size > 0 ? rowExp : null;
  }
}

/* ------------------------------------------------------------------ */
/* 3. RangeSelection (interval tree)                                  */
/* ------------------------------------------------------------------ */

class RangeSelection {
  #ranges = [];

  add(start, end) {
    if (start > end) [start, end] = [end, start];
    const merged = [];
    let i = 0,
      ns = start,
      ne = end;
    while (i < this.#ranges.length && this.#ranges[i].end < start - 1)
      merged.push(this.#ranges[i++]);
    while (i < this.#ranges.length && this.#ranges[i].start <= end + 1) {
      ns = Math.min(ns, this.#ranges[i].start);
      ne = Math.max(ne, this.#ranges[i].end);
      i++;
    }
    merged.push({ start: ns, end: ne });
    while (i < this.#ranges.length) merged.push(this.#ranges[i++]);
    this.#ranges = merged;
  }

  delete(start, end) {
    if (start > end) [start, end] = [end, start];
    const merged = [];
    for (const r of this.#ranges) {
      if (r.end < start || r.start > end) merged.push(r);
      else {
        if (r.start < start) merged.push({ start: r.start, end: start - 1 });
        if (r.end > end) merged.push({ start: end + 1, end: r.end });
      }
    }
    this.#ranges = merged;
  }

  clear() {
    this.#ranges = [];
  }

  has(index) {
    let lo = 0,
      hi = this.#ranges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1,
        r = this.#ranges[mid];
      if (index < r.start) hi = mid - 1;
      else if (index > r.end) lo = mid + 1;
      else return true;
    }
    return false;
  }

  hasAnyInRange(start, end) {
    let lo = 0,
      hi = this.#ranges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1,
        r = this.#ranges[mid];
      if (r.end < start) lo = mid + 1;
      else if (r.start > end) hi = mid - 1;
      else return true;
    }
    return false;
  }

  get count() {
    return this.#ranges.reduce((sum, r) => sum + (r.end - r.start + 1), 0);
  }

  *[Symbol.iterator]() {
    for (const r of this.#ranges)
      for (let i = r.start; i <= r.end; i++) yield i;
  }

  toArray() {
    const arr = [];
    for (const idx of this) arr.push(idx);
    return arr;
  }
}

/* ------------------------------------------------------------------ */
/* 4. SelectionModel                                                  */
/* ------------------------------------------------------------------ */

class SelectionModel extends EventEmitter {
  #multiSelect;
  #selection = new RangeSelection();
  #rowStore = new Map();
  #anchorIndex = null;
  #lastInteractionIndex = null;

  constructor({ multiSelect }) {
    super();
    this.#multiSelect = multiSelect;
  }

  setMultiSelect(val) {
    this.#multiSelect = !!val;
    if (!this.#multiSelect && this.#selection.count > 1) {
      const last =
        this.#lastInteractionIndex ?? this.#selection.toArray().pop();
      const lastRow = last !== undefined ? this.#rowStore.get(last) : undefined;
      this.#selection.clear();
      this.#rowStore.clear();
      if (last !== undefined) {
        this.#selection.add(last, last);
        if (lastRow) this.#rowStore.set(last, lastRow);
      }
      this.#anchorIndex = last ?? null;
      this.emit("change");
    }
  }

  #deleteRange(start, end) {
    for (let i = start; i <= end; i++) this.#rowStore.delete(i);
    this.#selection.delete(start, end);
  }

  toggleRowSelection(rowIndex, { ctrlKey, metaKey, shiftKey }, getRowData) {
    const hasCtrl = ctrlKey || metaKey;
    const hasShift = shiftKey;

    if (!this.#multiSelect) {
      this.#selection.clear();
      this.#rowStore.clear();
      this.#selection.add(rowIndex, rowIndex);
      const row = getRowData?.(rowIndex);
      if (row) this.#rowStore.set(rowIndex, row);
      this.#anchorIndex = rowIndex;
    } else if (hasShift && this.#anchorIndex !== null) {
      const start = Math.min(this.#anchorIndex, rowIndex);
      const end = Math.max(this.#anchorIndex, rowIndex);
      if (!hasCtrl) {
        this.#selection.clear();
        this.#rowStore.clear();
      }
      this.#selection.add(start, end);
      if (getRowData) {
        for (let i = start; i <= end; i++) {
          const row = getRowData(i);
          if (row) this.#rowStore.set(i, row);
        }
      }
    } else if (hasCtrl) {
      if (this.#selection.has(rowIndex)) this.#deleteRange(rowIndex, rowIndex);
      else {
        this.#selection.add(rowIndex, rowIndex);
        const row = getRowData?.(rowIndex);
        if (row) this.#rowStore.set(rowIndex, row);
      }
      this.#anchorIndex = rowIndex;
    } else {
      this.#selection.clear();
      this.#rowStore.clear();
      this.#selection.add(rowIndex, rowIndex);
      const row = getRowData?.(rowIndex);
      if (row) this.#rowStore.set(rowIndex, row);
      this.#anchorIndex = rowIndex;
    }

    this.#lastInteractionIndex = rowIndex;
    this.emit("change");
  }

  clear() {
    if (this.#selection.count === 0) return;
    this.#selection.clear();
    this.#rowStore.clear();
    this.#anchorIndex = null;
    this.#lastInteractionIndex = null;
    this.emit("change");
  }

  isSelected(index) {
    return this.#selection.has(index);
  }

  hasAnyInRange(start, end) {
    return this.#selection.hasAnyInRange(start, end);
  }

  getSelectionData(dataSource) {
    const indices = this.#selection.toArray();
    const selection = [];
    for (const idx of indices) {
      let row = this.#rowStore.get(idx);
      if (!row && dataSource) {
        row = dataSource.getRow(idx);
        if (row) this.#rowStore.set(idx, row);
      }
      if (row) selection.push(row);
    }
    return { selection, indices };
  }

  get anchorIndex() {
    return this.#anchorIndex;
  }
  get lastInteractionIndex() {
    return this.#lastInteractionIndex;
  }
  get count() {
    return this.#selection.count;
  }
}

/* ------------------------------------------------------------------ */
/* 5. DataSource                                                      */
/* ------------------------------------------------------------------ */

class DataSource extends EventEmitter {
  #url;
  #pageSize;
  #columns;
  #cache;
  #inFlight = new Map();
  #maxLoadedIndex = -1;
  #endReached = false;
  #headersAutoDetected = false;
  #fetchGeneration = 0;
  #abortController = new AbortController();
  #inflightCount = 0;
  #destroyed = false;

  constructor({ url, pageSize, cacheSize }) {
    super();
    this.#url = url;
    this.#pageSize = pageSize;
    this.#columns = null;
    this.#cache = new PageLRUCache(cacheSize || DEFAULT_CACHE_SIZE);
  }

  get columns() {
    return this.#columns;
  }
  get pageSize() {
    return this.#pageSize;
  }
  get maxLoadedIndex() {
    return this.#maxLoadedIndex;
  }
  get isEndReached() {
    return this.#endReached;
  }

  getRow(index) {
    return this.#cache.getRow(index, this.#pageSize);
  }

  /* ── Expansion state passthrough ─────────────────────────────────── */

  isCellExpanded(rowIndex, colKey) {
    return this.#cache.isCellExpanded(rowIndex, this.#pageSize, colKey);
  }

  setCellExpanded(rowIndex, colKey, expanded) {
    const changed = this.#cache.setCellExpanded(
      rowIndex,
      this.#pageSize,
      colKey,
      !!expanded,
    );
    if (changed)
      this.emit("expansionChange", { rowIndex, colKey, expanded: !!expanded });
    return changed;
  }

  toggleCellExpanded(rowIndex, colKey) {
    const cur = this.#cache.isCellExpanded(rowIndex, this.#pageSize, colKey);
    return this.setCellExpanded(rowIndex, colKey, !cur);
  }

  getExpandedColKeys(rowIndex) {
    return this.#cache.getExpandedColKeys(rowIndex, this.#pageSize);
  }

  hasPage(pageIndex) {
    return this.#cache.hasPage(pageIndex);
  }

  isFetching(pageIndex) {
    return this.#inFlight.has(pageIndex);
  }

  touchPages(pageIndexSet) {
    this.#cache.batchTouchPages(pageIndexSet);
  }

  async fetchPage(pageIndex) {
    if (pageIndex < 0) return;
    if (this.#destroyed || this.#cache.hasPage(pageIndex)) return;
    if (this.#inFlight.has(pageIndex)) return this.#inFlight.get(pageIndex);
    if (
      this.#endReached &&
      pageIndex > Math.floor(this.#maxLoadedIndex / this.#pageSize)
    )
      return;

    const generation = this.#fetchGeneration;
    const promise = this.#doFetch(pageIndex, generation).finally(() => {
      if (!this.#destroyed && this.#fetchGeneration === generation) {
        this.#inFlight.delete(pageIndex);
        this.#inflightCount = Math.max(0, this.#inflightCount - 1);
        this.emit("loadingChange", this.#inflightCount > 0);
      }
    });

    this.#inFlight.set(pageIndex, promise);
    this.#inflightCount++;
    if (this.#inflightCount === 1) this.emit("loadingChange", true);
    return promise;
  }

  async #doFetch(pageIndex, generation) {
    try {
      const res = await this.#fetchHttp(pageIndex);
      if (this.#destroyed || this.#fetchGeneration !== generation) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (this.#destroyed || this.#fetchGeneration !== generation) return;

      this.#detectColumns(data);
      this.#processPageData(pageIndex, data);
    } catch (err) {
      if (this.#destroyed || this.#fetchGeneration !== generation) return;
      if (err.name === "AbortError") return;
      this.emit("error", { pageIndex, error: err.message || String(err) });
      throw err;
    }
  }

  async #fetchHttp(pageIndex) {
    const offset = pageIndex * this.#pageSize;
    const url = new URL(
      this.#url,
      (typeof document !== "undefined" && document.baseURI) ||
        "http://localhost",
    );
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("limit", String(this.#pageSize));

    const ctrl = new AbortController();
    const onAbort = () => ctrl.abort();
    this.#abortController.signal.addEventListener("abort", onAbort, {
      once: true,
    });
    try {
      return await fetch(url, { signal: ctrl.signal });
    } finally {
      this.#abortController.signal.removeEventListener("abort", onAbort);
    }
  }

  #detectColumns(data) {
    if (this.#columns || this.#headersAutoDetected) return;

    if (Array.isArray(data.headers) && data.headers.length > 0) {
      this.#columns = data.headers.map((h) =>
        typeof h === "string"
          ? { key: h, label: h }
          : { ...h, label: h.label || h.key },
      );
    } else if (data.rows?.length > 0) {
      const first = data.rows[0];
      if (first && typeof first === "object" && !Array.isArray(first)) {
        this.#columns = Object.keys(first).map((k) => ({ key: k, label: k }));
      }
    }

    if (this.#columns) {
      this.#headersAutoDetected = true;
      this.emit("columnsDetected", this.#columns);
    }
  }

  #processPageData(pageIndex, data) {
    const rows = data.rows || [];
    const offset = pageIndex * this.#pageSize;

    if (rows.length > 0) {
      this.#cache.setPage(pageIndex, rows);
      const last = offset + rows.length - 1;
      if (last > this.#maxLoadedIndex) this.#maxLoadedIndex = last;
      if (rows.length < this.#pageSize) {
        this.#endReached = true;
        this.emit("endReached");
      }
      this.emit("data", { pageIndex, rows, offset });
    } else {
      this.#cache.setPage(pageIndex, []);
      this.#endReached = true;
      this.emit("endReached");
      if (this.#maxLoadedIndex < 0) this.#maxLoadedIndex = -1;
    }
  }

  suspend() {
    if (this.#destroyed) return;
    this.#fetchGeneration++;
    this.#abortController.abort();
    this.#abortController = new AbortController();
    this.#inFlight.clear();
    this.#inflightCount = 0;
    this.emit("loadingChange", false);
  }

  resume() {
    // DataSource is ready to fetch as soon as the coordinator asks.
  }

  setUrl(url) {
    this.#url = url;
    this.reset();
  }

  setPageSize(size) {
    if (size === this.#pageSize) return;
    this.#pageSize = size;
    this.#cache.clear();
    this.reset();
  }

  setCacheSize(size) {
    if (this.#destroyed) return;
    this.#cache.setMaxPages(parseInt(size, 10) || DEFAULT_CACHE_SIZE);
  }

  reset() {
    this.#fetchGeneration++;
    this.#abortController.abort();
    this.#abortController = new AbortController();
    this.#cache.clear();
    this.#maxLoadedIndex = -1;
    this.#endReached = false;
    this.#columns = null;
    this.#headersAutoDetected = false;
    this.#inFlight.clear();
    this.#inflightCount = 0;
    this.emit("loadingChange", false);
  }

  destroy() {
    this.#destroyed = true;
    this.#fetchGeneration++;
    this.#abortController.abort();
  }
}

/* ------------------------------------------------------------------ */
/* 5.5 RowHeightManager                                               */
/* ------------------------------------------------------------------ */

class RowHeightManager {
  #defaultHeight;
  #blockSize;
  #heights = new Map();
  #blockHeights = new Map();

  constructor({ defaultRowHeight, blockSize = 1024 }) {
    this.#defaultHeight = defaultRowHeight;
    this.#blockSize = blockSize;
  }

  setHeight(index, height) {
    const old = this.#heights.get(index);
    if (old === height) return false;
    this.#heights.set(index, height);
    this.#blockHeights.delete(Math.floor(index / this.#blockSize));
    return true;
  }

  getHeight(index) {
    return this.#heights.get(index) || this.#defaultHeight;
  }

  #computeBlockHeight(blockIndex) {
    const start = blockIndex * this.#blockSize;
    const end = start + this.#blockSize;
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += this.#heights.get(i) || this.#defaultHeight;
    }
    this.#blockHeights.set(blockIndex, sum);
    return sum;
  }

  #getBlockHeight(blockIndex) {
    if (this.#blockHeights.has(blockIndex)) {
      return this.#blockHeights.get(blockIndex);
    }
    return this.#computeBlockHeight(blockIndex);
  }

  getOffset(index) {
    if (index <= 0) return 0;
    const targetBlock = Math.floor((index - 1) / this.#blockSize);
    let offset = 0;

    for (let b = 0; b < targetBlock; b++) {
      offset += this.#getBlockHeight(b);
    }

    const blockStart = targetBlock * this.#blockSize;
    for (let i = blockStart; i < index; i++) {
      offset += this.#heights.get(i) || this.#defaultHeight;
    }
    return offset;
  }

  getIndexAtOffset(offset) {
    if (offset <= 0) return 0;
    let current = 0,
      block = 0;
    for (; ; block++) {
      const h = this.#getBlockHeight(block);
      if (current + h > offset) break;
      current += h;
    }
    let i = block * this.#blockSize;
    for (; current < offset; i++) {
      current += this.#heights.get(i) || this.#defaultHeight;
    }
    return Math.max(0, i - 1);
  }

  getTotalHeight(knownRowCount, endReached, extraRows = 0) {
    if (knownRowCount <= 0) return 0;
    const fullBlocks = Math.floor((knownRowCount - 1) / this.#blockSize);
    let total = 0;

    for (let b = 0; b <= fullBlocks; b++) {
      const start = b * this.#blockSize;
      const end = Math.min(start + this.#blockSize, knownRowCount);
      if (this.#blockHeights.has(b) && end === start + this.#blockSize) {
        total += this.#blockHeights.get(b);
      } else {
        for (let i = start; i < end; i++) {
          total += this.#heights.get(i) || this.#defaultHeight;
        }
      }
    }

    if (!endReached && extraRows > 0) {
      total += this.#defaultHeight * extraRows;
    }
    return total;
  }

  updateDefaultHeight(height) {
    if (height > 0 && height !== this.#defaultHeight) {
      this.#defaultHeight = height;
      this.#blockHeights.clear();
      return true;
    }
    return false;
  }

  clear() {
    this.#heights.clear();
    this.#blockHeights.clear();
  }

  get defaultHeight() {
    return this.#defaultHeight;
  }
}

/* ------------------------------------------------------------------ */
/* 6. Viewport                                                        */
/* ------------------------------------------------------------------ */

class Viewport extends EventEmitter {
  #el;
  #bufferRows;
  #rowHeightManager;
  #resizeObserver;
  #heightProbe;
  #probeObserver;

  #onScroll = () => this.emit("scroll");
  #onResize = () => this.emit("resize");

  constructor(scrollEl, { bufferRows, defaultRowHeight, rowHeightManager }) {
    super();
    this.#el = scrollEl;
    this.#bufferRows = bufferRows;
    this.#rowHeightManager = rowHeightManager;

    this.#el.addEventListener("scroll", this.#onScroll, { passive: true });

    this.#resizeObserver = new ResizeObserver(this.#onResize);
    this.#resizeObserver.observe(this.#el);

    this.#heightProbe = document.createElement("div");
    this.#heightProbe.className = "vsg-row";
    this.#heightProbe.style.cssText =
      "position:absolute;visibility:hidden;pointer-events:none;";
    this.#heightProbe.innerHTML = '<div class="vsg-cell">M</div>';
    this.#el.appendChild(this.#heightProbe);

    this.#probeObserver = new ResizeObserver((entries) => {
      const h = entries[0].contentRect.height;
      if (h > 0 && this.#rowHeightManager.updateDefaultHeight(h)) {
        this.emit("resize");
      }
    });
    this.#probeObserver.observe(this.#heightProbe);
  }

  get rowHeight() {
    return this.#rowHeightManager.defaultHeight;
  }
  get clientHeight() {
    return this.#el.clientHeight;
  }
  get scrollTop() {
    return this.#el.scrollTop;
  }
  set scrollTop(val) {
    this.#el.scrollTop = val;
  }

  getStartRow() {
    const idx = this.#rowHeightManager.getIndexAtOffset(this.#el.scrollTop);
    return Math.max(0, idx - this.#bufferRows);
  }

  scrollIntoView(rowIndex) {
    const rowTop = this.#rowHeightManager.getOffset(rowIndex);
    const rowBottom = rowTop + this.#rowHeightManager.getHeight(rowIndex);
    const st = this.#el.scrollTop;
    const sb = st + this.#el.clientHeight;
    if (rowTop < st) this.#el.scrollTop = rowTop;
    else if (rowBottom > sb)
      this.#el.scrollTop = rowBottom - this.#el.clientHeight;
  }

  suspend() {
    this.#el.removeEventListener("scroll", this.#onScroll, { passive: true });
    this.#resizeObserver.disconnect();
    this.#probeObserver.disconnect();
  }

  resume() {
    this.#el.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#resizeObserver.observe(this.#el);
    this.#probeObserver.observe(this.#heightProbe);
  }

  destroy() {
    this.#el.removeEventListener("scroll", this.#onScroll, { passive: true });
    this.#resizeObserver.disconnect();
    this.#probeObserver.disconnect();
    this.#heightProbe.remove();
  }
}

/* ------------------------------------------------------------------ */
/* 7. Renderer                                                        */
/* ------------------------------------------------------------------ */

class Renderer {
  #root;
  #rowHeightManager;

  #pool = [];
  #poolState = [];
  #poolSize = 0;
  #rangeStart = 0;

  #columns = null;
  #allColumns = null;
  #seenKeys = new Set();
  #hiddenKeys = new Set();
  #showHeaders = true;
  #selectable = false;
  #multiSelect = true;
  #syncingScroll = false;

  #lastSpacerHeight = null;
  #lastColCount = null;
  #lastRowCount = null;
  #lastTransform = null;

  #colWidthOverrides = [];
  #cellMetrics = null;
  #colBasis = null;
  #colGrowth = null;
  #lockedWidths = null;

  #resizeSheet = new CSSStyleSheet();
  #resizeAbort = null;
  #widthLockRaf = null;
  #resizeColIndex = -1;

  #delegate = null;
  #cellRendererRegistry = null;

  #domRoot;
  #headerRow;
  #scroll;
  #spacer;
  #content;
  #colToggleBtn;
  #colToggleMenu;

  #headerWidthObserver;

  /* Event handlers — arrow fields keep stable identity */
  #onContentClick = (e) => this.#delegate?.onContentClick?.(e);
  #onKeyDown = (e) => this.#delegate?.onKeyDown?.(e);
  #onFocusIn = (e) => {
    if (e.target === this.#scroll) this.#delegate?.onFocusIn?.(e);
  };
  #onScrollSync = () => {
    if (this.#syncingScroll) return;
    this.#syncingScroll = true;
    this.#headerRow.scrollLeft = this.#scroll.scrollLeft;
    this.#syncingScroll = false;
  };
  #onHeaderScrollSync = () => {
    if (this.#syncingScroll) return;
    this.#syncingScroll = true;
    this.#scroll.scrollLeft = this.#headerRow.scrollLeft;
    this.#syncingScroll = false;
  };
  #syncScrollbarGutter = () => {
    const gutter = this.#scroll.offsetWidth - this.#scroll.clientWidth;
    this.#headerRow.style.width = gutter > 0 ? `calc(100% - ${gutter}px)` : "";
    // Expose the viewport's inner width so sticky expansion panels
    // (rendered under rows for expand:true cells) can fit exactly the
    // visible area instead of the full min-content row width.
    const viewportWidth = this.#scroll.clientWidth;
    if (viewportWidth > 0) {
      this.#domRoot.style.setProperty(
        "--vsg-viewport-width",
        `${viewportWidth}px`,
      );
    }
    this.scheduleWidthRelock();
  };
  #onHeaderPointerDown = (e) => this.#onResizePointerDown(e);

  #onColToggleBtnClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.#toggleColToggleMenu();
  };

  #onColToggleMenuChange = (e) => {
    const cb = e.target.closest("input[type=checkbox][data-col-key]");
    if (!cb) return;
    const key = cb.dataset.colKey;
    const hidden = !cb.checked;
    this.#root.host?.setColumnHidden?.(key, hidden);
  };

  #onDocumentPointerDown = (e) => {
    const path = e.composedPath();
    if (path.includes(this.#colToggleBtn) || path.includes(this.#colToggleMenu))
      return;
    this.#closeColToggleMenu();
  };

  #bindings = [
    [() => this.#content, "click", this.#onContentClick],
    [() => this.#scroll, "keydown", this.#onKeyDown],
    [() => this.#scroll, "focusin", this.#onFocusIn],
    [() => this.#scroll, "scroll", this.#onScrollSync, { passive: true }],
    [
      () => this.#headerRow,
      "scroll",
      this.#onHeaderScrollSync,
      { passive: true },
    ],
    [() => this.#headerRow, "pointerdown", this.#onHeaderPointerDown],
    [() => this.#colToggleBtn, "click", this.#onColToggleBtnClick],
    [() => this.#colToggleMenu, "change", this.#onColToggleMenuChange],
  ];

  constructor(root, { rowHeightManager, cellRendererRegistry = null }) {
    this.#root = root;
    this.#rowHeightManager = rowHeightManager;
    this.#cellRendererRegistry = cellRendererRegistry;

    this.#root.adoptedStyleSheets = [VSG_STYLESHEET, this.#resizeSheet];
    this.#buildDOM();
    this.#bindEvents();
  }

  /** Replace the local registry and force all visible cells to re-render. */
  setCellRendererRegistry(registry) {
    this.#cellRendererRegistry = registry;
    this.invalidatePool();
  }

  #buildDOM() {
    const root = createEl("div", "vsg-root", this.#root, { role: "grid" });
    this.#headerRow = createEl("div", "vsg-header-row", root, {
      role: "row",
      part: "header",
    });
    this.#colToggleBtn = createEl("button", "vsg-col-toggle-btn", root, {
      type: "button",
      "aria-label": "Toggle column visibility",
      "aria-haspopup": "menu",
      title: "Show/hide columns",
      tabindex: "-1",
    });
    this.#colToggleBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    this.#colToggleMenu = createEl("div", "vsg-col-toggle-menu", root, {
      role: "menu",
    });
    const scroll = createEl("div", "vsg-scroll", root, {
      tabindex: "0",
      role: "rowgroup",
    });
    this.#spacer = createEl("div", "vsg-spacer", scroll);
    this.#content = createEl("div", "vsg-content", scroll);
    this.#scroll = scroll;
    this.#domRoot = root;
  }

  #setBound(add) {
    const m = add ? "addEventListener" : "removeEventListener";
    for (const [getTarget, type, handler, opts] of this.#bindings) {
      const target = getTarget();
      if (target) target[m](type, handler, opts);
    }
  }

  #teardownResize() {
    if (this.#resizeAbort) {
      this.#resizeAbort.abort();
      this.#resizeAbort = null;
    }
    this.#headerRow
      .querySelector(".vsg-resize-handle.active")
      ?.classList.remove("active");
    this.#root.host?.classList.remove("col-resizing");
    this.#resizeSheet.replaceSync("");
    this.#root.host?.style.removeProperty("--vsg-resize-width");
    this.#headerRow.style.overflowX = "";
    this.#scroll.style.overflowX = "";
  }

  #bindEvents() {
    this.#setBound(true);
    this.#headerWidthObserver = new ResizeObserver(this.#syncScrollbarGutter);
    this.#headerWidthObserver.observe(this.#scroll);
  }

  get scrollContainer() {
    return this.#scroll;
  }

  get columnCount() {
    return this.#columns?.length || 0;
  }

  getAllColumns() {
    return this.#allColumns ? [...this.#allColumns] : [];
  }

  isColumnHidden(key) {
    return this.#hiddenKeys.has(key);
  }

  setEventDelegate(delegate) {
    this.#delegate = delegate;
  }

  #getCellMetrics() {
    if (this.#cellMetrics) return this.#cellMetrics;

    this.#cellMetrics = { charWidth: 8, paddingH: 16 };

    const row = document.createElement("div");
    row.className = "vsg-row";
    row.style.cssText =
      "position:absolute;top:-9999px;left:-9999px;visibility:hidden;pointer-events:none;";
    const cell = document.createElement("div");
    cell.className = "vsg-cell";

    const N = 10;
    const span = document.createElement("span");
    span.style.whiteSpace = "nowrap";
    span.textContent = "M".repeat(N);
    cell.appendChild(span);
    row.appendChild(cell);
    this.#scroll.appendChild(row);

    const cellRect = cell.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const paddingH = Math.max(0, cellRect.width - spanRect.width);
    const charWidth = Math.max(1, spanRect.width / N);

    this.#scroll.removeChild(row);

    if (
      charWidth !== this.#cellMetrics.charWidth ||
      paddingH !== this.#cellMetrics.paddingH
    ) {
      this.#cellMetrics = { charWidth, paddingH };
    }

    return this.#cellMetrics;
  }

  #computeColumnStyles() {
    if (!this.#columns) return;
    const { charWidth, paddingH } = this.#getCellMetrics();
    this.#colBasis = this.#columns.map((col) => {
      const charCount = col.width != null ? Math.max(0, Number(col.width)) : 2;
      return charCount * charWidth + paddingH;
    });
    this.#colGrowth = this.#columns.map((col) => {
      return col.growth != null && Number(col.growth) > 0
        ? Number(col.growth)
        : 0;
    });
    this.#columns.forEach((col, i) => {
      col.minWidth = col.minWidth ?? Math.max(20, this.#colBasis[i]);
    });
  }

  #applyColumnFlexStyles() {
    if (!this.#columns || !this.#colBasis) return;
    Array.from(this.#headerRow.children).forEach((cell, i) =>
      this.#styleCell(cell, i),
    );
    for (const { cells } of this.#pool) {
      cells.forEach((cell, i) => this.#styleCell(cell, i));
    }
    this.#updateContentWidth(this.#getTotalColumnWidth());
  }

  #styleCell(cell, colIndex) {
    if (!cell) return;
    const locked = this.#lockedWidths?.[colIndex];
    if (locked != null) {
      cell.style.flex = "none";
      cell.style.width = locked + "px";
      cell.style.minWidth = "auto";
      return;
    }
    const override = this.#colWidthOverrides[colIndex];
    if (override != null) {
      cell.style.flex = "none";
      cell.style.width = override + "px";
      cell.style.minWidth = "";
    } else {
      cell.style.flex = `${this.#colGrowth[colIndex]} 0 ${this.#colBasis[colIndex]}px`;
      cell.style.minWidth = `${this.#colBasis[colIndex]}px`;
      cell.style.width = "";
    }
  }

  #getTotalColumnWidth() {
    if (this.#lockedWidths) {
      return this.#lockedWidths.reduce((a, b) => a + b, 0);
    }
    if (!this.#columns || !this.#colBasis) return 0;
    return this.#columns.reduce((sum, _, i) => {
      const override = this.#colWidthOverrides[i];
      if (override != null) return sum + override;
      if (this.#showHeaders) {
        const headerCell = this.#headerRow.children[i];
        const renderedWidth = headerCell
          ? Math.round(headerCell.getBoundingClientRect().width)
          : 0;
        return sum + (renderedWidth > 0 ? renderedWidth : this.#colBasis[i]);
      }
      return sum + this.#colBasis[i];
    }, 0);
  }

  #lockColumnWidths() {
    if (!this.#columns) return;
    let sourceCells;
    if (!this.#showHeaders) {
      const firstRow = this.#pool.find(
        (r) => r.row.isConnected && r.cells.length,
      );
      if (!firstRow) return;
      sourceCells = firstRow.cells;
    } else {
      if (!this.#headerRow.children.length) return;
      sourceCells = Array.from(this.#headerRow.children);
    }
    const widths = sourceCells.map((cell) =>
      Math.round(cell.getBoundingClientRect().width),
    );
    if (widths.some((w) => w === 0)) return;
    this.#lockedWidths = widths;
    this.#applyColumnFlexStyles();
  }

  #unlockColumnWidths() {
    if (!this.#lockedWidths) return;
    this.#lockedWidths = null;
    this.#applyColumnFlexStyles();
  }

  scheduleWidthRelock() {
    if (this.#resizeAbort) return;
    if (this.#widthLockRaf) {
      cancelAnimationFrame(this.#widthLockRaf);
      this.#widthLockRaf = null;
    }
    this.#widthLockRaf = requestAnimationFrame(() => {
      this.#widthLockRaf = null;
      this.#unlockColumnWidths();
      this.#headerRow.offsetHeight;
      this.#lockColumnWidths();
    });
  }

  #onResizePointerDown(e) {
    const handle = e.target.closest(".vsg-resize-handle");
    if (!handle) return;
    e.preventDefault();
    e.stopPropagation();

    const colIndex = parseInt(handle.dataset.colIndex, 10);
    if (isNaN(colIndex) || !this.#columns) return;

    const startWidth =
      this.#headerRow.children[colIndex]?.getBoundingClientRect().width || 0;
    this.#startResize(handle, colIndex, e.clientX, startWidth);
  }

  #startResize(handle, colIndex, startX, startWidth) {
    if (this.#widthLockRaf) {
      cancelAnimationFrame(this.#widthLockRaf);
      this.#widthLockRaf = null;
    }
    this.#resizeColIndex = colIndex;
    const minWidth = this.#columns[colIndex].minWidth ?? 20;
    const host = this.#root?.host;

    handle.classList.add("active");
    host?.classList.add("col-resizing");

    const savedHeaderOverflow = this.#headerRow.style.overflowX;
    const savedScrollOverflow = this.#scroll.style.overflowX;
    this.#headerRow.style.overflowX = "hidden";
    this.#scroll.style.overflowX = "hidden";

    this.#resizeSheet.replaceSync(`
      .vsg-header-cell[data-col-index="${colIndex}"],
      .vsg-cell[data-col-index="${colIndex}"] {
        width: var(--vsg-resize-width, ${startWidth}px) !important;
        flex: none !important;
        min-width: auto !important;
      }
    `);

    this.#resizeAbort = new AbortController();

    const onMove = (moveEvt) =>
      this.#onResizeMove(moveEvt, host, startX, startWidth, minWidth);

    const onUp = (upEvt) => {
      const ac = this.#resizeAbort;
      this.#resizeAbort = null;
      ac?.abort();
      this.#onResizeCommit(
        upEvt,
        handle,
        colIndex,
        host,
        startX,
        startWidth,
        minWidth,
        savedHeaderOverflow,
        savedScrollOverflow,
      );
    };

    document.addEventListener("pointermove", onMove, {
      signal: this.#resizeAbort.signal,
    });
    document.addEventListener("pointerup", onUp, {
      signal: this.#resizeAbort.signal,
    });
  }

  #onResizeMove(moveEvt, host, startX, startWidth, minWidth) {
    const newWidth = Math.max(
      minWidth,
      Math.round(startWidth + moveEvt.clientX - startX),
    );
    host?.style.setProperty("--vsg-resize-width", `${newWidth}px`);
    if (this.#lockedWidths && this.#resizeColIndex >= 0) {
      this.#lockedWidths[this.#resizeColIndex] = newWidth;
      this.#updateContentWidth(this.#getTotalColumnWidth());
    }
  }

  #onResizeCommit(
    upEvt,
    handle,
    colIndex,
    host,
    startX,
    startWidth,
    minWidth,
    savedHeaderOverflow,
    savedScrollOverflow,
  ) {
    handle.classList.remove("active");
    host?.classList.remove("col-resizing");

    this.#headerRow.style.overflowX = savedHeaderOverflow;
    this.#scroll.style.overflowX = savedScrollOverflow;

    const finalWidth = Math.max(
      minWidth,
      Math.round(startWidth + upEvt.clientX - startX),
    );
    this.#colWidthOverrides[colIndex] = finalWidth;

    this.#lockColumnWidths();

    this.#resizeSheet.replaceSync("");
    host?.style.removeProperty("--vsg-resize-width");

    this.#resizeColIndex = -1;
    const key = this.#columns[colIndex]?.key ?? null;
    this.#delegate?.onColumnResize?.(
      colIndex,
      key,
      finalWidth,
      this.#lockedWidths || [],
    );
  }

  setShowHeaders(show) {
    this.#showHeaders = show;
    this.#headerRow.style.display = show ? "" : "none";
    if (this.#colToggleBtn) {
      this.#colToggleBtn.style.display = show ? "" : "none";
    }
    if (!show) this.#closeColToggleMenu();
    this.scheduleWidthRelock();
  }

  #rebuildVisibleColumns() {
    this.#columns = this.#allColumns
      ? this.#allColumns.filter((col) => !this.#hiddenKeys.has(col.key))
      : null;
  }

  #resetColumnLayout() {
    this.#renderHeader();
    this.#pool = [];
    this.#poolState = [];
    this.#poolSize = 0;
    this.#content.innerHTML = "";
    this.#lastTransform = null;
    this.#colWidthOverrides = [];
    this.#cellMetrics = null;
    this.#colBasis = null;
    this.#colGrowth = null;
    this.#lockedWidths = null;

    this.#teardownResize();

    if (this.#columns) {
      this.#computeColumnStyles();
      this.#applyColumnFlexStyles();
      this.scheduleWidthRelock();
    } else {
      this.#updateContentWidth(0);
    }
  }

  setColumns(columns) {
    this.#allColumns = columns.map((col, i) => {
      const key = col.key;
      if (!this.#seenKeys.has(key)) {
        this.#seenKeys.add(key);
        if (col.hidden === true) {
          this.#hiddenKeys.add(key);
        }
      }
      return { ...col, originalIndex: i };
    });
    this.#rebuildVisibleColumns();
    this.#resetColumnLayout();
  }

  setColumnHidden(key, hidden) {
    if (hidden) this.#hiddenKeys.add(key);
    else this.#hiddenKeys.delete(key);
    this.#rebuildVisibleColumns();
    this.#resetColumnLayout();
  }

  setSelectable(selectable) {
    this.#selectable = selectable;
    this.#content.classList.toggle("selectable", selectable);
    if (!this.#domRoot) return;
    if (selectable)
      this.#domRoot.setAttribute(
        "aria-multiselectable",
        this.#multiSelect ? "true" : "false",
      );
    else this.#domRoot.removeAttribute("aria-multiselectable");
  }

  setMultiSelect(multiSelect) {
    this.#multiSelect = multiSelect;
    if (this.#selectable)
      this.#domRoot?.setAttribute(
        "aria-multiselectable",
        this.#multiSelect ? "true" : "false",
      );
  }

  #renderHeader() {
    if (!this.#columns) return;
    this.#headerRow.innerHTML = "";
    this.#headerRow.setAttribute("role", "row");
    if (this.#showHeaders) this.#headerRow.setAttribute("aria-rowindex", "1");
    const frag = document.createDocumentFragment();
    this.#columns.forEach((col, i) => {
      const cell = createEl("div", "vsg-header-cell", frag, {
        role: "columnheader",
        "aria-colindex": i + 1,
        part: "header-cell",
        "data-col-index": i,
      });
      const label = createEl("span", "vsg-header-cell-label", cell);
      label.textContent = col.label || col.key;
      createEl("div", "vsg-resize-handle", cell, {
        "data-col-index": i,
        "aria-hidden": "true",
      });
    });
    this.#headerRow.appendChild(frag);
    this.#colWidthOverrides = [];
    this.#lockedWidths = null;
  }

  renderHeader() {
    this.#renderHeader();
    this.#computeColumnStyles();
    this.#applyColumnFlexStyles();
    this.scheduleWidthRelock();
  }

  #toggleColToggleMenu() {
    if (this.#colToggleMenu.classList.contains("open")) {
      this.#closeColToggleMenu();
    } else {
      this.#openColToggleMenu();
    }
  }

  #openColToggleMenu() {
    this.#renderColToggleMenu();
    this.#colToggleMenu.classList.add("open");
    this.#colToggleBtn.classList.add("open");
    document.addEventListener("pointerdown", this.#onDocumentPointerDown, true);
  }

  #closeColToggleMenu() {
    if (!this.#colToggleMenu || !this.#colToggleMenu.classList.contains("open"))
      return;
    this.#colToggleMenu.classList.remove("open");
    this.#colToggleBtn.classList.remove("open");
    document.removeEventListener(
      "pointerdown",
      this.#onDocumentPointerDown,
      true,
    );
  }

  #renderColToggleMenu() {
    this.#colToggleMenu.innerHTML = "";
    if (!this.#allColumns || !this.#allColumns.length) return;
    const frag = document.createDocumentFragment();
    this.#allColumns.forEach((col) => {
      const item = createEl("label", "vsg-col-toggle-item", frag);
      const cb = createEl("input", "", item, {
        type: "checkbox",
        "data-col-key": col.key,
      });
      cb.checked = !this.#hiddenKeys.has(col.key);
      const span = createEl("span", "", item);
      span.textContent = col.label || col.key;
    });
    this.#colToggleMenu.appendChild(frag);
  }

  ensurePoolSize(containerHeight, rowHeight, bufferRows) {
    if (!this.#columns || containerHeight === 0) return;
    const visible = Math.ceil(containerHeight / rowHeight);
    const needed = visible + bufferRows * 2 + 2;
    if (this.#pool.length >= needed) {
      this.#poolSize = needed;
      return;
    }
    const frag = document.createDocumentFragment();
    while (this.#pool.length < needed) {
      const row = createEl("div", "vsg-row", frag, {
        role: "row",
        tabindex: "-1",
        part: "row",
      });
      const cells = [];
      const cellContents = [];
      const copyBtns = [];
      this.#columns.forEach((_, ci) => {
        const cell = createEl("div", "vsg-cell", row, {
          role: "gridcell",
          "aria-colindex": ci + 1,
          part: "cell",
          "data-col-index": ci,
        });
        const content = createEl("div", "vsg-cell-content", cell);
        const copyBtn = createEl("button", "vsg-copy-btn", cell, {
          "aria-label": "Copy cell",
          title: "Copy to clipboard",
          tabindex: "-1",
        });
        copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        cells.push(cell);
        cellContents.push(content);
        copyBtns.push(copyBtn);
      });
      const expansionsEl = createEl("div", "vsg-row-expansions", row, {
        part: "expansions",
      });
      this.#pool.push({
        row,
        cells,
        cellContents,
        copyBtns,
        expansionsEl,
        expansionPanels: new Map(),
      });
      this.#poolState.push({
        index: -2,
        pastEnd: false,
        hasData: false,
        selected: false,
        focused: false,
        focusedCol: -1,
        selectable: false,
        expandSig: "",
      });
    }
    this.#content.appendChild(frag);
    this.#poolSize = needed;
    this.#applyColumnFlexStyles();
  }

  updateSpacer(height) {
    if (this.#lastSpacerHeight === height) return;
    this.#lastSpacerHeight = height;
    this.#spacer.style.height = Math.max(0, height) + "px";
  }

  #updateContentWidth(totalColumnPx) {
    const w = totalColumnPx > 0 ? `${totalColumnPx}px` : "";
    this.#spacer.style.minWidth = w;
    this.#content.style.minWidth = w;
  }

  updateAriaCounts(colCount, dataRowCount) {
    if (!this.#domRoot) return;
    const rowCount =
      dataRowCount >= 0 && this.#showHeaders ? dataRowCount + 1 : dataRowCount;
    if (this.#lastColCount === colCount && this.#lastRowCount === rowCount)
      return;
    this.#lastColCount = colCount;
    this.#lastRowCount = rowCount;
    if (colCount > 0)
      this.#domRoot.setAttribute("aria-colcount", String(colCount));
    else this.#domRoot.removeAttribute("aria-colcount");
    if (rowCount >= 0)
      this.#domRoot.setAttribute("aria-rowcount", String(rowCount));
    else this.#domRoot.setAttribute("aria-rowcount", "-1");
  }

  render(
    rangeStart,
    dataSource,
    selectionModel,
    { focusedRowIndex, focusedColIndex, endReached, maxLoadedIndex },
  ) {
    if (!this.#columns || this.#poolSize === 0) return null;
    this.#rangeStart = rangeStart;

    const transform = `translateY(${Math.round(this.#rowHeightManager.getOffset(rangeStart))}px)`;
    if (this.#lastTransform !== transform) {
      this.#lastTransform = transform;
      this.#content.style.transform = transform;
    }

    const touched = new Set();
    const touchedPages = new Set();
    const pageSize = dataSource.pageSize;

    for (let i = 0; i < this.#poolSize; i++) {
      const rowIndex = rangeStart + i;
      const slot = this.#pool[i];
      const state = this.#poolState[i];
      const isPastEnd = endReached && rowIndex > maxLoadedIndex;
      const rowData = dataSource.getRow(rowIndex);
      if (rowData != null) touchedPages.add(Math.floor(rowIndex / pageSize));
      const hasData = rowData != null;
      const selected = !isPastEnd ? selectionModel.isSelected(rowIndex) : false;
      const isFocusedRow = rowIndex === focusedRowIndex;
      const activeCellCol = isFocusedRow ? focusedColIndex : -1;

      const expandedKeys =
        hasData && !isPastEnd ? dataSource.getExpandedColKeys(rowIndex) : null;
      const expandSig = expandedKeys
        ? Array.from(expandedKeys).sort().join("\u0001")
        : "";

      if (
        state.index === rowIndex &&
        state.pastEnd === isPastEnd &&
        state.hasData === hasData &&
        state.selected === selected &&
        state.focused === isFocusedRow &&
        state.focusedCol === activeCellCol &&
        state.selectable === this.#selectable &&
        state.expandSig === expandSig
      )
        continue;
      touched.add(i);
      Object.assign(state, {
        index: rowIndex,
        pastEnd: isPastEnd,
        hasData,
        selected,
        focused: isFocusedRow,
        focusedCol: activeCellCol,
        selectable: this.#selectable,
        expandSig,
      });

      if (isPastEnd) {
        this.#renderEmptySlot(slot);
        continue;
      }

      this.#renderDataSlot(
        slot,
        rowIndex,
        rowData,
        hasData,
        selected,
        isFocusedRow,
        focusedColIndex,
        expandedKeys,
      );
    }

    dataSource.touchPages(touchedPages);
    return touched;
  }

  measureAndReportHeights(touched = null) {
    let changed = false;
    for (let i = 0; i < this.#poolSize; i++) {
      if (touched && !touched.has(i)) continue;
      const slot = this.#pool[i];
      const idx = parseInt(slot.row.dataset.index, 10);
      if (idx >= 0 && slot.row.style.visibility !== "hidden") {
        const h = slot.row.getBoundingClientRect().height;
        if (this.#rowHeightManager.setHeight(idx, h)) {
          changed = true;
        }
      }
    }
    return changed;
  }

  #renderEmptySlot(slot) {
    slot.row.style.visibility = "hidden";
    slot.row.dataset.index = "-1";
    slot.row.classList.toggle("selected", false);
    slot.row.removeAttribute("aria-rowindex");
    slot.row.setAttribute("aria-hidden", "true");
    slot.row.removeAttribute("aria-selected");
    slot.row.setAttribute("tabindex", "-1");
    slot.cells.forEach((cell, ci) => {
      const contentEl = slot.cellContents[ci];
      if (contentEl._lastVal !== "") {
        contentEl.textContent = "";
        contentEl._lastVal = "";
      }
      const copyBtn = slot.copyBtns[ci];
      copyBtn.style.display = "none";
      copyBtn.dataset.value = "";
      cell.classList.remove("focused-cell");
      cell.removeAttribute("aria-selected");
    });
    if (slot.expansionsEl.childNodes.length > 0) {
      slot.expansionsEl.replaceChildren();
      slot.expansionPanels.clear();
    }
  }

  #renderDataSlot(
    slot,
    rowIndex,
    rowData,
    hasData,
    selected,
    isFocusedRow,
    focusedColIndex,
    expandedKeys,
  ) {
    slot.row.style.visibility = "";
    slot.row.dataset.index = String(rowIndex);
    const rowIndexOffset = this.#showHeaders ? 2 : 1;
    slot.row.setAttribute("aria-rowindex", String(rowIndex + rowIndexOffset));
    slot.row.removeAttribute("aria-hidden");

    slot.row.classList.toggle("selected", selected);
    if (this.#selectable)
      slot.row.setAttribute("aria-selected", selected ? "true" : "false");
    else slot.row.removeAttribute("aria-selected");

    slot.row.setAttribute("tabindex", isFocusedRow ? "0" : "-1");

    slot.cells.forEach((cell, ci) => {
      const col = this.#columns[ci];
      if (!col) return;
      const contentEl = slot.cellContents[ci];
      const copyBtn = slot.copyBtns[ci];
      const rawVal = hasData
        ? getVal(rowData, col, col.originalIndex)
        : undefined;

      const isExpandable = hasData && col.expand === true && rawVal != null;

      if (isExpandable) {
        const isOpen = expandedKeys ? expandedKeys.has(col.key) : false;
        const btn = this.#ensureExpandButton(contentEl, col.key);
        btn.classList.toggle("open", isOpen);
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        const label = isOpen ? "Collapse" : "Expand";
        btn.dataset.label = label;
        btn.lastChild.textContent = label;
        copyBtn.style.display = "none";
        copyBtn.dataset.value = "";
      } else {
        const rendered = hasData
          ? formatCell(rawVal, col, this.#cellRendererRegistry)
          : "";

        if (rendered instanceof Node) {
          if (contentEl._lastVal !== rendered) {
            contentEl.replaceChildren(rendered);
            contentEl._lastVal = rendered;
          }
        } else {
          if (contentEl._lastVal !== rendered) {
            contentEl.textContent = rendered;
            contentEl._lastVal = rendered;
          }
        }

        copyBtn.style.display = hasData && rendered !== "" ? "" : "none";
        copyBtn.dataset.value = hasData ? String(rawVal ?? "") : "";
      }

      const isFocusedCell = isFocusedRow && ci === focusedColIndex;
      cell.classList.toggle("focused-cell", isFocusedCell);
      if (isFocusedCell) cell.setAttribute("aria-selected", "true");
      else cell.removeAttribute("aria-selected");
    });

    this.#renderExpansionPanels(slot, rowData, hasData, expandedKeys);
  }

  /** Replace the cell's content with a reusable expand toggle button. */
  #ensureExpandButton(contentEl, colKey) {
    const existing = contentEl.firstChild;
    if (
      existing &&
      existing.nodeType === 1 &&
      existing.classList?.contains("vsg-expand-btn") &&
      existing.dataset.colKey === colKey
    ) {
      return existing;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vsg-expand-btn";
    btn.setAttribute("part", "expand-btn");
    btn.setAttribute("tabindex", "-1");
    btn.dataset.colKey = colKey;
    const chev = document.createElement("span");
    chev.className = "vsg-expand-btn-chevron";
    chev.textContent = "\u25B6"; // ▶
    chev.setAttribute("aria-hidden", "true");
    const lbl = document.createElement("span");
    lbl.className = "vsg-expand-btn-label";
    lbl.textContent = "Expand";
    btn.appendChild(chev);
    btn.appendChild(lbl);
    contentEl.replaceChildren(btn);
    contentEl._lastVal = btn;
    return btn;
  }

  #renderExpansionPanels(slot, rowData, hasData, expandedKeys) {
    const container = slot.expansionsEl;
    const panels = slot.expansionPanels;

    if (!hasData || !expandedKeys || expandedKeys.size === 0) {
      if (container.childNodes.length > 0) {
        container.replaceChildren();
        panels.clear();
      }
      return;
    }

    const colByKey = new Map();
    for (const col of this.#columns || []) {
      if (col && col.expand === true) colByKey.set(col.key, col);
    }

    for (const key of Array.from(panels.keys())) {
      if (!expandedKeys.has(key)) {
        panels.get(key).panel.remove();
        panels.delete(key);
      }
    }

    const orderedKeys = [];
    for (const col of this.#columns || []) {
      if (col && expandedKeys.has(col.key)) orderedKeys.push(col.key);
    }

    for (const key of orderedKeys) {
      const col = colByKey.get(key);
      if (!col) continue;
      let entry = panels.get(key);
      if (!entry) {
        const panel = createEl("div", "vsg-row-expansion", null, {
          part: "expansion",
          "data-col-key": key,
        });
        const header = createEl("div", "vsg-row-expansion-header", panel);
        const label = createEl("div", "vsg-row-expansion-label", header, {
          part: "expansion-label",
        });
        label.textContent = col.label || col.key;
        const close = createEl("button", "vsg-row-expansion-close", header, {
          type: "button",
          part: "expansion-close",
          tabindex: "-1",
          "aria-label": "Collapse",
        });
        close.dataset.colKey = key;
        close.textContent = "Collapse ✕";
        const content = createEl("div", "vsg-row-expansion-content", panel, {
          part: "expansion-content",
        });
        entry = { panel, content, lastVal: null };
        panels.set(key, entry);
      }
      container.appendChild(entry.panel);

      const val = getVal(rowData, col, col.originalIndex);
      const rendered = formatCell(val, col, this.#cellRendererRegistry);
      if (rendered instanceof Node) {
        if (entry.lastVal !== rendered) {
          entry.content.replaceChildren(rendered);
          entry.lastVal = rendered;
        }
      } else {
        if (entry.lastVal !== rendered) {
          entry.content.textContent = rendered;
          entry.lastVal = rendered;
        }
      }
    }
  }

  getRowIndexFromEventTarget(target) {
    const rowEl = target.closest(".vsg-row");
    if (!rowEl) return -1;
    const idx = parseInt(rowEl.dataset.index, 10);
    return isNaN(idx) ? -1 : idx;
  }

  focusRow(rowIndex) {
    const poolIndex = rowIndex - this.#rangeStart;
    if (poolIndex >= 0 && poolIndex < this.#poolSize) {
      this.#pool[poolIndex]?.row?.focus({ preventScroll: true });
    }
  }

  invalidatePool() {
    for (const state of this.#poolState) {
      Object.assign(state, {
        index: -2,
        pastEnd: false,
        hasData: false,
        selected: false,
        focused: false,
        focusedCol: -1,
        selectable: false,
        expandSig: "",
      });
    }
  }

  suspend() {
    this.#closeColToggleMenu();
    this.#setBound(false);
    this.#headerWidthObserver.disconnect();
    this.#teardownResize();
    if (this.#widthLockRaf) {
      cancelAnimationFrame(this.#widthLockRaf);
      this.#widthLockRaf = null;
    }
  }

  resume() {
    this.#setBound(true);
    this.#headerWidthObserver.observe(this.#scroll);
    this.scheduleWidthRelock();
  }

  destroy() {
    this.#closeColToggleMenu();
    this.#setBound(false);
    this.#teardownResize();
    this.#headerWidthObserver.disconnect();
  }
}

/* ------------------------------------------------------------------ */
/* 8. VirtualScrollCore (coordinator)                                 */
/* ------------------------------------------------------------------ */

class VirtualScrollCore {
  #root;
  #destroyed = false;
  #focusedRowIndex = 0;
  #focusedColIndex = 0;
  #showHeaders;
  #keyRepeatRaf = null;
  #lastScrollTop = 0;
  #lastScrollTime = 0;
  #updateScheduled = false;
  #updateRafId = null;

  #rowHeightManager;
  #renderer;
  #viewport;
  #dataSource;
  #selectionModel;

  static #NAV_KEYS = new Map([
    ["ArrowDown", (s, e) => s.#goRow(s.#clampRow(s.#focusedRowIndex + 1))],
    ["ArrowUp", (s, e) => s.#goRow(s.#clampRow(s.#focusedRowIndex - 1))],
    [
      "ArrowRight",
      (s, e) =>
        s.#goCol(Math.min(s.#renderer.columnCount - 1, s.#focusedColIndex + 1)),
    ],
    ["ArrowLeft", (s, e) => s.#goCol(Math.max(0, s.#focusedColIndex - 1))],
    [
      "PageDown",
      (s, e) => s.#goRow(s.#clampRow(s.#focusedRowIndex + s.#pageRows())),
    ],
    [
      "PageUp",
      (s, e) => s.#goRow(s.#clampRow(s.#focusedRowIndex - s.#pageRows())),
    ],
    [
      "Home",
      (s, e) => {
        if (e.ctrlKey) {
          s.#focusedRowIndex = 0;
          s.#focusedColIndex = 0;
          s.#viewport.scrollIntoView(0);
        } else s.#goCol(0);
      },
    ],
    [
      "End",
      (s, e) => {
        const lastRow = s.#lastNavigableRow;
        const lastCol = s.#renderer.columnCount - 1;
        if (e.ctrlKey) {
          s.#focusedRowIndex = lastRow;
          s.#focusedColIndex = lastCol;
          s.#viewport.scrollIntoView(lastRow);
        } else s.#goCol(lastCol);
      },
    ],
    ["Enter", (s, e) => s.#toggleFocusSelection(e)],
    [" ", (s, e) => s.#toggleFocusSelection(e)],
    ["Escape", (s, e) => s.#selectionModel.clear()],
  ]);

  constructor(root, options) {
    this.#root = root;
    this.#showHeaders = options.showHeaders !== false;

    this.#rowHeightManager = new RowHeightManager({
      defaultRowHeight: DEFAULT_ROW_HEIGHT,
      blockSize: options.pageSize || DEFAULT_PAGE_SIZE,
    });

    this.#renderer = new Renderer(root, {
      rowHeightManager: this.#rowHeightManager,
      cellRendererRegistry: options.cellRendererRegistry ?? null,
    });
    this.#renderer.setShowHeaders(this.#showHeaders);

    this.#viewport = new Viewport(this.#renderer.scrollContainer, {
      bufferRows: BUFFER_ROWS,
      defaultRowHeight: DEFAULT_ROW_HEIGHT,
      rowHeightManager: this.#rowHeightManager,
    });

    this.#dataSource = new DataSource({
      url: options.url,
      pageSize: options.pageSize || DEFAULT_PAGE_SIZE,
      cacheSize: options.cacheSize,
    });

    this.#selectionModel = new SelectionModel({
      multiSelect: options.multiSelect !== false,
    });

    this.#renderer.setSelectable(true);

    this.#viewport.on("scroll", () => this.#onScroll());
    this.#viewport.on("resize", () => this.#onResize());

    this.#dataSource.on("loadingChange", (isLoading) =>
      this.#dispatch("loading", { loading: isLoading }),
    );
    this.#dataSource.on("columnsDetected", (cols) =>
      this.#onColumnsDetected(cols),
    );
    this.#dataSource.on("data", ({ offset, rows }) => {
      this.#scheduleUpdate();
      if (this.#selectionModel.hasAnyInRange(offset, offset + rows.length - 1))
        this.#emitSelectionEvent();
    });
    this.#dataSource.on("endReached", () => {
      this.#snapScrollIfBeyondEnd();
      this.#scheduleUpdate();
    });
    this.#dataSource.on("expansionChange", () => this.#scheduleUpdate());
    this.#dataSource.on("error", ({ pageIndex, error }) =>
      this.#onError(pageIndex, error),
    );

    this.#selectionModel.on("change", () => this.#onSelectionChange());

    this.#renderer.setEventDelegate({
      onContentClick: (e) => this.#onContentClick(e),
      onKeyDown: (e) => this.#onKeyDown(e),
      onFocusIn: (e) => this.#onFocusIn(e),
      onColumnResize: (colIndex, key, width, widths) =>
        this.#dispatch("columnresize", {
          columnIndex: colIndex,
          key,
          width,
          widths,
        }),
    });

    this.#scheduleUpdate();
    this.#dataSource.fetchPage(0).catch(() => {});
  }

  #onColumnsDetected(columns) {
    this.#renderer.setColumns(columns);
    this.#scheduleUpdate();
    this.#renderer.scheduleWidthRelock();
  }

  #onResize() {
    this.#renderer.ensurePoolSize(
      this.#viewport.clientHeight,
      this.#rowHeightManager.defaultHeight,
      BUFFER_ROWS,
    );
    this.#renderer.scheduleWidthRelock();
    this.#scheduleUpdate();
  }

  #onScroll() {
    this.#scheduleUpdate();
    if (this.#dataSource.isEndReached) return;

    const now = performance.now();
    const dt = now - this.#lastScrollTime || 1;
    const velocity =
      Math.abs(this.#viewport.scrollTop - this.#lastScrollTop) / dt;
    this.#lastScrollTop = this.#viewport.scrollTop;
    this.#lastScrollTime = now;
    if (velocity > 3) return;

    const bottomRow = this.#rowHeightManager.getIndexAtOffset(
      this.#viewport.scrollTop + this.#viewport.clientHeight,
    );
    const aheadPage = Math.floor(
      (bottomRow + this.#dataSource.pageSize) / this.#dataSource.pageSize,
    );
    if (
      !this.#dataSource.hasPage(aheadPage) &&
      !this.#dataSource.isFetching(aheadPage)
    ) {
      this.#dataSource.fetchPage(aheadPage).catch(() => {});
    }
  }

  #scheduleUpdate() {
    if (this.#updateScheduled) return;
    this.#updateScheduled = true;
    this.#updateRafId = requestAnimationFrame(() => {
      this.#updateScheduled = false;
      this.#updateRafId = null;
      if (!this.#destroyed) this.#update();
    });
  }

  #update() {
    if (this.#destroyed) return;
    const touched = this.#updateLayout();
    const heightsChanged =
      touched != null ? this.#renderer.measureAndReportHeights(touched) : false;
    if (heightsChanged) {
      this.#updateLayout();
    }
    this.#prefetchVisiblePages();
    if (this.#root.activeElement !== null) {
      this.#renderer.focusRow(this.#focusedRowIndex);
    }
  }

  #updateLayout() {
    const endReached = this.#dataSource.isEndReached;
    const maxLoaded = this.#dataSource.maxLoadedIndex;

    const totalHeight = this.#rowHeightManager.getTotalHeight(
      maxLoaded + 1,
      endReached,
      endReached ? 0 : this.#dataSource.pageSize * 3,
    );
    this.#renderer.updateSpacer(totalHeight);
    this.#renderer.updateAriaCounts(
      this.#renderer.columnCount,
      endReached ? maxLoaded + 1 : -1,
    );

    if (!this.#dataSource.columns) return null;

    this.#renderer.ensurePoolSize(
      this.#viewport.clientHeight,
      this.#rowHeightManager.defaultHeight,
      BUFFER_ROWS,
    );

    const rangeStart = this.#viewport.getStartRow();
    return this.#renderer.render(
      rangeStart,
      this.#dataSource,
      this.#selectionModel,
      {
        focusedRowIndex: this.#focusedRowIndex,
        focusedColIndex: this.#focusedColIndex,
        endReached,
        maxLoadedIndex: maxLoaded,
        rowHeight: this.#rowHeightManager.defaultHeight,
      },
    );
  }

  #prefetchVisiblePages() {
    const endReached = this.#dataSource.isEndReached;
    const maxLoaded = this.#dataSource.maxLoadedIndex;
    const rangeStart = this.#viewport.getStartRow();

    const visibleEnd =
      this.#rowHeightManager.getIndexAtOffset(
        this.#viewport.scrollTop + this.#viewport.clientHeight,
      ) + BUFFER_ROWS;
    const pageSize = this.#dataSource.pageSize;
    const startPage = Math.floor(rangeStart / pageSize);
    const endPage = Math.floor(visibleEnd / pageSize);
    const lastPage = endReached ? Math.floor(maxLoaded / pageSize) : Infinity;
    for (let p = startPage; p <= endPage; p++) {
      if (p > lastPage) continue;
      if (!this.#dataSource.hasPage(p) && !this.#dataSource.isFetching(p))
        this.#dataSource.fetchPage(p).catch(() => {});
    }
  }

  #snapScrollIfBeyondEnd() {
    if (!this.#dataSource.isEndReached) return;
    const trueEnd = this.#dataSource.maxLoadedIndex;
    const maxScrollTop = Math.max(
      0,
      this.#rowHeightManager.getOffset(trueEnd) +
        this.#rowHeightManager.getHeight(trueEnd) -
        this.#viewport.clientHeight,
    );
    if (this.#viewport.scrollTop > maxScrollTop)
      this.#viewport.scrollTop = maxScrollTop;
  }

  #onFocusIn(e) {
    if (e.target === this.#renderer.scrollContainer) {
      this.#renderer.focusRow(this.#focusedRowIndex);
    }
  }

  #onContentClick(e) {
    const expandBtn = e.target.closest(".vsg-expand-btn");
    if (expandBtn) {
      e.stopPropagation();
      const rowIndex = this.#renderer.getRowIndexFromEventTarget(e.target);
      const colKey = expandBtn.dataset.colKey;
      if (rowIndex >= 0 && colKey) {
        this.#dataSource.toggleCellExpanded(rowIndex, colKey);
      }
      return;
    }

    const expansionClose = e.target.closest(".vsg-row-expansion-close");
    if (expansionClose) {
      e.stopPropagation();
      const rowIndex = this.#renderer.getRowIndexFromEventTarget(e.target);
      const colKey = expansionClose.dataset.colKey;
      if (rowIndex >= 0 && colKey) {
        this.#dataSource.setCellExpanded(rowIndex, colKey, false);
      }
      return;
    }

    if (e.target.closest(".vsg-row-expansion")) {
      return;
    }

    const copyBtn = e.target.closest(".vsg-copy-btn");
    if (copyBtn) {
      e.stopPropagation();
      const cell = copyBtn.closest(".vsg-cell");
      const content = cell?.querySelector(".vsg-cell-content");
      const text = content
        ? content.textContent || copyBtn.dataset.value || ""
        : copyBtn.dataset.value || "";
      copyToClipboard(text);
      return;
    }

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      if (
        this.#renderer.scrollContainer.contains(range.commonAncestorContainer)
      ) {
        return;
      }
    }

    const rowIndex = this.#renderer.getRowIndexFromEventTarget(e.target);
    if (rowIndex < 0 || rowIndex > this.#dataSource.maxLoadedIndex) return;
    this.#focusedRowIndex = rowIndex;
    this.#selectionModel.toggleRowSelection(rowIndex, e, (idx) =>
      this.#dataSource.getRow(idx),
    );
    this.#scheduleUpdate();
  }

  get #lastNavigableRow() {
    return Math.max(
      0,
      this.#dataSource.isEndReached
        ? this.#dataSource.maxLoadedIndex
        : this.#dataSource.maxLoadedIndex + this.#dataSource.pageSize * 3,
    );
  }

  #clampRow(i) {
    return Math.max(0, Math.min(this.#lastNavigableRow, i));
  }
  #goRow(i) {
    if (i !== this.#focusedRowIndex) {
      this.#focusedRowIndex = i;
      this.#viewport.scrollIntoView(i);
    }
  }
  #goCol(i) {
    if (i !== this.#focusedColIndex) this.#focusedColIndex = i;
  }

  #pageRows() {
    const start = this.#rowHeightManager.getIndexAtOffset(
      this.#viewport.scrollTop,
    );
    const end = this.#rowHeightManager.getIndexAtOffset(
      this.#viewport.scrollTop + this.#viewport.clientHeight,
    );
    return Math.max(1, end - start - 1);
  }

  #toggleFocusSelection(e) {
    if (this.#focusedRowIndex <= this.#dataSource.maxLoadedIndex) {
      this.#selectionModel.toggleRowSelection(
        this.#focusedRowIndex,
        {
          ctrlKey: e.ctrlKey || e.metaKey,
          shiftKey: e.shiftKey,
        },
        (idx) => this.#dataSource.getRow(idx),
      );
    }
  }

  #onKeyDown(e) {
    if (!this.#dataSource.columns) return;
    if (e.repeat) {
      if (this.#keyRepeatRaf) {
        e.preventDefault();
        return;
      }
      this.#keyRepeatRaf = requestAnimationFrame(() => {
        this.#keyRepeatRaf = null;
      });
    }
    const action = VirtualScrollCore.#NAV_KEYS.get(e.key);
    if (!action) return;
    e.preventDefault();
    action(this, e);
    this.#scheduleUpdate();
  }

  #dispatch(name, detail) {
    this.#root.host?.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true }),
    );
  }

  #onSelectionChange() {
    this.#scheduleUpdate();
    this.#emitSelectionEvent();
  }

  #emitSelectionEvent() {
    const { selection, indices } = this.#selectionModel.getSelectionData(
      this.#dataSource,
    );
    this.#dispatch("selectionchange", { selection, indices });
  }

  #onError(pageIndex, error) {
    console.error(
      `[virtual-scroll-grid] failed to fetch page ${pageIndex}:`,
      error,
    );
    this.#dispatch("error", { pageIndex, error });
  }

  #restart() {
    this.#rowHeightManager.clear();
    this.#selectionModel.clear();
    this.#focusedRowIndex = 0;
    this.#focusedColIndex = 0;
    this.#renderer.invalidatePool();
    this.#viewport.scrollTop = 0;
    this.#scheduleUpdate();
    this.#dataSource.fetchPage(0).catch(() => {});
  }

  reload() {
    this.#dataSource.reset();
    this.#restart();
  }

  clearSelection() {
    this.#selectionModel.clear();
  }

  setColumnHidden(key, hidden) {
    this.#renderer.setColumnHidden(key, hidden);
    const colCount = this.#renderer.columnCount;
    if (this.#focusedColIndex >= colCount && colCount > 0) {
      this.#focusedColIndex = colCount - 1;
    }
    this.#scheduleUpdate();
  }

  getAllColumns() {
    return this.#renderer.getAllColumns();
  }

  isColumnHidden(key) {
    return this.#renderer.isColumnHidden(key);
  }

  suspend() {
    if (this.#destroyed) return;
    this.#dataSource.suspend();
    this.#viewport.suspend();
    this.#renderer.suspend();
    if (this.#keyRepeatRaf) {
      cancelAnimationFrame(this.#keyRepeatRaf);
      this.#keyRepeatRaf = null;
    }
    if (this.#updateRafId) {
      cancelAnimationFrame(this.#updateRafId);
      this.#updateRafId = null;
    }
    this.#updateScheduled = false;
  }

  resume() {
    if (this.#destroyed) return;
    this.#viewport.resume();
    this.#renderer.resume();
    this.#scheduleUpdate();
  }

  setUrl(url) {
    this.#dataSource.setUrl(url);
    this.#restart();
  }

  setShowHeaders(show) {
    this.#showHeaders = show;
    this.#renderer.setShowHeaders(show);
  }

  setPageSize(size) {
    this.#dataSource.setPageSize(size);
    this.#restart();
  }

  setCacheSize(size) {
    this.#dataSource.setCacheSize(size);
  }

  setMultiSelect(val) {
    this.#selectionModel.setMultiSelect(val);
    this.#renderer.setMultiSelect(val);
  }

  setCellRendererRegistry(registry) {
    this.#renderer.setCellRendererRegistry(registry);
    this.#scheduleUpdate();
  }

  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#dataSource.destroy();
    this.#viewport.destroy();
    this.#renderer.destroy();
    if (this.#keyRepeatRaf) {
      cancelAnimationFrame(this.#keyRepeatRaf);
      this.#keyRepeatRaf = null;
    }
    if (this.#updateRafId) {
      cancelAnimationFrame(this.#updateRafId);
      this.#updateRafId = null;
    }
  }
}

/* ------------------------------------------------------------------ */
/* 9. VirtualScrollGrid (custom element wrapper)                      */
/* ------------------------------------------------------------------ */

class VirtualScrollGrid extends HTMLElement {
  static get observedAttributes() {
    return ["url", "show-headers", "page-size", "cache-size", "multi-select"];
  }

  #instance = null;
  #cellRendererRegistry = new CellRendererRegistry();
  #pendingHiddenKeys = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  /**
   * Register a custom cell renderer for a specific datatype.
   *
   * The renderer is called with `(value, columnDef)` and must return
   * either a plain string or a DOM Node.  Returning a Node allows rich
   * HTML inside a cell (badges, icons, progress bars, etc.).
   *
   * Calling this method with a datatype that already has a built-in
   * renderer (e.g. "boolean", "currency") will override it for this
   * element only; other grid instances are unaffected.
   *
   * @param {string}   datatype — must match the `datatype` field from the API headers.
   * @param {Function} fn       — (value: any, col: ColumnDef) => string | Node
   *
   * @example
   *   grid.registerCellRenderer('status', (val) => {
   *     const badge = document.createElement('span');
   *     badge.className = `badge badge--${val.toLowerCase()}`;
   *     badge.textContent = val;
   *     return badge;
   *   });
   *
   *   grid.registerCellRenderer('percent', (val) => {
   *     const bar = document.createElement('div');
   *     bar.style.cssText = `width:${Math.round(val*100)}%;height:6px;background:steelblue`;
   *     return bar;
   *   });
   */
  registerCellRenderer(datatype, fn) {
    this.#cellRendererRegistry.register(datatype, fn);
    this.#instance?.setCellRendererRegistry(this.#cellRendererRegistry);
  }

  /**
   * Hide or unhide a column by its key.
   *
   * @param {string}  key    — the column key.
   * @param {boolean} hidden — true to hide, false to show.
   */
  setColumnHidden(key, hidden) {
    this.#pendingHiddenKeys.set(key, hidden);
    this.#instance?.setColumnHidden(key, hidden);
  }

  /**
   * Returns a Map<key, boolean> of every known column's visibility.
   * A value of `true` means the column is currently hidden.
   */
  getColumnVisibility() {
    const all = this.#instance?.getAllColumns() || [];
    const result = new Map();
    for (const col of all) {
      result.set(col.key, this.#instance?.isColumnHidden(col.key) ?? false);
    }
    return result;
  }

  reload() {
    this.#instance?.reload();
  }

  clearSelection() {
    this.#instance?.clearSelection();
  }

  connectedCallback() {
    if (this.#instance) {
      this.#instance.resume();
    } else {
      this.#tryInit();
    }
  }

  disconnectedCallback() {
    this.#instance?.suspend();
  }

  destroy() {
    this.#instance?.destroy();
    this.#instance = null;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (!this.#instance) {
      this.#tryInit();
      return;
    }
    switch (name) {
      case "url":
        this.#instance.setUrl(newVal);
        break;
      case "show-headers":
        this.#instance.setShowHeaders(newVal !== "false");
        break;
      case "page-size":
        this.#instance.setPageSize(parseInt(newVal) || DEFAULT_PAGE_SIZE);
        break;
      case "cache-size":
        this.#instance.setCacheSize(parseInt(newVal) || DEFAULT_CACHE_SIZE);
        break;
      case "multi-select":
        this.#instance.setMultiSelect(newVal !== "false");
        break;
    }
  }

  #tryInit() {
    const url = this.getAttribute("url");
    if (!url || !this.isConnected) return;
    if (this.#instance) return;

    this.shadowRoot.replaceChildren();

    const pageSize =
      parseInt(this.getAttribute("page-size")) || DEFAULT_PAGE_SIZE;
    const cacheSize =
      parseInt(this.getAttribute("cache-size")) || DEFAULT_CACHE_SIZE;
    const showHeaders = this.getAttribute("show-headers") !== "false";
    const multiSelect = this.getAttribute("multi-select") !== "false";

    this.#instance = new VirtualScrollCore(this.shadowRoot, {
      url,
      pageSize,
      cacheSize,
      showHeaders,
      multiSelect,
      cellRendererRegistry: this.#cellRendererRegistry,
    });

    // Flush any column-visibility calls that arrived before init
    for (const [key, hidden] of this.#pendingHiddenKeys) {
      this.#instance.setColumnHidden(key, hidden);
    }
  }
}

customElements.define("virtual-scroll-grid", VirtualScrollGrid);
