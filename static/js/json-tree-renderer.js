/**
 * JSON Tree Renderer for VirtualScrollGrid
 *
 * Provides a collapsible, copyable JSON tree view for cells with datatype "json".
 * Uses WeakMap caching to preserve expansion state when rows scroll out and back into view.
 *
 * Styling can be customized via CSS custom properties on the grid element:
 *   --json-tree-font-family
 *   --json-tree-font-size
 *   --json-tree-bg
 *   --json-tree-border
 *   --json-tree-border-radius
 *   --json-tree-key-color
 *   --json-tree-string-color
 *   --json-tree-number-color
 *   --json-tree-boolean-color
 *   --json-tree-null-color
 *   --json-tree-meta-color
 *   --json-tree-caret-bg
 *   --json-tree-caret-hover-bg
 *   --json-tree-hover-bg
 *
 * Example usage:
 *   import { registerJsonRenderer } from './json-tree-renderer.js';
 *   const grid = document.getElementById('grid');
 *   registerJsonRenderer(grid, { copyButton: true });
 */

/**
 * Injects the JSON tree styles into the grid's shadow root.
 * Only adds them once per grid instance.
 */
function injectStyles(grid) {
  if (grid._jsonTreeStylesInjected) return;
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(`
    .json-tree {
      position: relative;
      font-family: var(--json-tree-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
      font-size: var(--json-tree-font-size, 12px);
      line-height: 1.55;
      color: var(--json-tree-color, #0f172a);
      background: var(--json-tree-bg, #ffffff);
      border: var(--json-tree-border, 1px solid #e2e8f0);
      border-radius: var(--json-tree-border-radius, 6px);
      padding: var(--json-tree-padding, 8px 10px);
      max-height: var(--json-tree-max-height, 320px);
      overflow: auto;
    }

    .json-tree .json-node {
      margin: 0;
    }

    .json-tree .json-node-header {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 1px 4px;
      border-radius: 3px;
      user-select: none;
    }

    .json-tree .json-node-header:hover {
      background: var(--json-tree-hover-bg, #eff6ff);
    }

    .json-tree .json-caret {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: var(--json-tree-caret-color, #64748b);
      background: var(--json-tree-caret-bg, #f1f5f9);
      border: 1px solid var(--json-tree-caret-border, #cbd5e1);
      border-radius: 3px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      flex-shrink: 0;
      transition: background 0.12s, color 0.12s;
    }

    .json-tree .json-node-header:hover .json-caret {
      background: var(--json-tree-caret-hover-bg, #e2e8f0);
      color: var(--json-tree-caret-hover-color, #0f172a);
    }

    .json-tree .json-node.open > .json-node-header .json-caret {
      background: var(--json-tree-caret-open-bg, #e2e8f0);
      color: var(--json-tree-caret-open-color, #0f172a);
    }

    .json-tree .json-node-children {
      display: none;
      padding-left: var(--json-tree-children-indent, 16px);
      margin-left: 4px;
      border-left: 1px solid var(--json-tree-children-border, #e2e8f0);
    }

    .json-tree .json-node.open > .json-node-children {
      display: block;
    }

    .json-tree .json-entry {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 1px 0;
    }

    .json-tree .json-key {
      color: var(--json-tree-key-color, #0e7490);
      font-weight: 600;
      flex-shrink: 0;
    }

    .json-tree .json-index {
      color: var(--json-tree-index-color, #94a3b8);
      flex-shrink: 0;
    }

    .json-tree .json-colon {
      color: var(--json-tree-colon-color, #94a3b8);
    }

    .json-tree .json-value {
      word-break: break-word;
    }

    .json-tree .json-string {
      color: var(--json-tree-string-color, #047857);
    }

    .json-tree .json-number {
      color: var(--json-tree-number-color, #b91c1c);
    }

    .json-tree .json-boolean {
      color: var(--json-tree-boolean-color, #7c3aed);
      font-weight: 600;
    }

    .json-tree .json-null {
      color: var(--json-tree-null-color, #6b7280);
      font-style: italic;
    }

    .json-tree .json-meta {
      color: var(--json-tree-meta-color, #64748b);
      font-style: italic;
      font-size: 11px;
    }

    .json-tree .json-copy {
      position: absolute;
      top: 6px;
      right: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      color: var(--json-tree-copy-color, #64748b);
      background: var(--json-tree-copy-bg, #f1f5f9);
      border: 1px solid var(--json-tree-copy-border, #cbd5e1);
      border-radius: 4px;
      padding: 0;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s, background 0.15s, color 0.15s;
    }

    .json-tree:hover .json-copy {
      opacity: 1;
    }

    .json-tree .json-copy:hover {
      background: var(--json-tree-copy-hover-bg, #e2e8f0);
      color: var(--json-tree-copy-hover-color, #0f172a);
    }

    .json-tree .json-copy.copied {
      background: #dcfce7;
      border-color: #86efac;
      color: #16a34a;
    }
  `);
  const sr = grid.shadowRoot;
  if (sr && !sr.adoptedStyleSheets.includes(styleSheet)) {
    sr.adoptedStyleSheets = [...sr.adoptedStyleSheets, styleSheet];
  }
  grid._jsonTreeStylesInjected = true;
}

/**
 * Recursively builds a DOM tree for a JSON value.
 */
function buildJsonNode(value, opts = {}) {
  const { topLevel = false, keyLabel = null, indexLabel = null } = opts;

  // Primitive (leaf)
  if (value === null || value === undefined || typeof value !== "object") {
    const entry = document.createElement("div");
    entry.className = "json-entry";
    if (keyLabel != null) {
      const k = document.createElement("span");
      k.className = "json-key";
      k.textContent = `"${keyLabel}"`;
      entry.appendChild(k);
      const c = document.createElement("span");
      c.className = "json-colon";
      c.textContent = ":";
      entry.appendChild(c);
    } else if (indexLabel != null) {
      const i = document.createElement("span");
      i.className = "json-index";
      i.textContent = `[${indexLabel}]`;
      entry.appendChild(i);
    }
    entry.appendChild(createPrimitiveSpan(value));
    return entry;
  }

  const isArray = Array.isArray(value);
  const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);

  // Top level: skip wrapper, render children directly
  if (topLevel) {
    const container = document.createElement("div");
    for (const [k, v] of entries) {
      container.appendChild(
        buildJsonNode(v, {
          keyLabel: isArray ? null : String(k),
          indexLabel: isArray ? k : null,
        }),
      );
    }
    return container;
  }

  const count = entries.length;
  const startOpen = count <= (window.JSON_TREE_AUTO_EXPAND_LIMIT ?? 3);

  const node = document.createElement("div");
  node.className = "json-node" + (startOpen ? " open" : "");

  const header = document.createElement("div");
  header.className = "json-node-header";

  const caret = document.createElement("span");
  caret.className = "json-caret";
  caret.textContent = startOpen ? "−" : "+";
  header.appendChild(caret);

  if (keyLabel != null) {
    const k = document.createElement("span");
    k.className = "json-key";
    k.textContent = `"${keyLabel}"`;
    header.appendChild(k);
    const c = document.createElement("span");
    c.className = "json-colon";
    c.textContent = ":";
    header.appendChild(c);
  } else if (indexLabel != null) {
    const i = document.createElement("span");
    i.className = "json-index";
    i.textContent = `[${indexLabel}]`;
    header.appendChild(i);
  }

  const meta = document.createElement("span");
  meta.className = "json-meta";
  meta.textContent = isArray
    ? `Array(${count})`
    : `Object · ${count} ${count === 1 ? "key" : "keys"}`;
  header.appendChild(meta);

  header.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const isOpen = node.classList.toggle("open");
    caret.textContent = isOpen ? "−" : "+";
  });

  node.appendChild(header);

  const children = document.createElement("div");
  children.className = "json-node-children";
  for (const [k, v] of entries) {
    children.appendChild(
      buildJsonNode(v, {
        keyLabel: isArray ? null : String(k),
        indexLabel: isArray ? k : null,
      }),
    );
  }
  node.appendChild(children);
  return node;
}

function createPrimitiveSpan(v) {
  const span = document.createElement("span");
  span.classList.add("json-value");
  if (v === null || v === undefined) {
    span.classList.add("json-null");
    span.textContent = "null";
  } else if (typeof v === "string") {
    span.classList.add("json-string");
    span.textContent = `"${v}"`;
  } else if (typeof v === "number") {
    span.classList.add("json-number");
    span.textContent = String(v);
  } else if (typeof v === "boolean") {
    span.classList.add("json-boolean");
    span.textContent = v ? "true" : "false";
  } else {
    span.textContent = String(v);
  }
  return span;
}

/**
 * Registers the JSON tree renderer with a VirtualScrollGrid instance.
 *
 * @param {HTMLElement} grid - The virtual-scroll-grid element.
 * @param {Object} options - Configuration options.
 * @param {boolean} options.copyButton - Whether to show a copy button (default: true).
 * @param {Function} options.toast - Optional toast function (message, type) called on copy.
 * @param {number} options.autoExpandLimit - Maximum number of top-level keys to auto-expand (default: 3).
 */
export function registerJsonRenderer(grid, options = {}) {
  const { copyButton = true, toast = null, autoExpandLimit = 3 } = options;

  // Set global for buildJsonNode
  window.JSON_TREE_AUTO_EXPAND_LIMIT = autoExpandLimit;

  // Inject styles once
  injectStyles(grid);

  // Create a WeakMap cache to preserve DOM nodes per value (Strategy 1)
  const nodeCache = new WeakMap();

  // Register the renderer with the grid
  grid.registerCellRenderer("json", (value, columnDef) => {
    if (value == null) return "";

    // Return cached node if available
    if (nodeCache.has(value)) {
      return nodeCache.get(value);
    }

    // Build the tree container
    const root = document.createElement("div");
    root.className = "json-tree";

    if (copyButton) {
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "json-copy";
      copyBtn.title = "Copy JSON";
      copyBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      copyBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const text = JSON.stringify(value, null, 2);
        navigator.clipboard.writeText(text).then(
          () => {
            copyBtn.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            copyBtn.classList.add("copied");
            if (toast) toast("JSON copied to clipboard", "success");
            setTimeout(() => {
              copyBtn.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
              copyBtn.classList.remove("copied");
            }, 1500);
          },
          () => toast && toast("Copy failed", "error"),
        );
      });
      root.appendChild(copyBtn);
    }

    root.appendChild(buildJsonNode(value, { topLevel: true }));

    nodeCache.set(value, root);
    return root;
  });
}
