import { bangs } from "./bang";
import "./global.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// ─── CUSTOM BANGS ───

const CUSTOM_BANGS_KEY = "custom-bangs";

type Bang = { t: string; s: string; d: string; u: string };

function loadCustomBangs(): Bang[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_BANGS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCustomBangs(customs: Bang[]) {
  localStorage.setItem(CUSTOM_BANGS_KEY, JSON.stringify(customs));
}

function findBang(trigger: string): Bang | undefined {
  const customs = loadCustomBangs();
  return customs.find((b) => b.t === trigger) ?? bangs.find((b) => b.t === trigger);
}

// ─── IMPORT / EXPORT ───

function isValidBang(b: unknown): b is Bang {
  return (
    typeof b === "object" && b !== null &&
    typeof (b as any).t === "string" && /^\S+$/.test((b as any).t) &&
    typeof (b as any).s === "string" &&
    typeof (b as any).d === "string" &&
    typeof (b as any).u === "string" && (b as any).u.includes("{{{s}}}")
  );
}

function parseBangsPayload(raw: unknown): Bang[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (!raw.every(isValidBang)) return null;
  return raw as Bang[];
}

function exportAsJson() {
  const customs = loadCustomBangs();
  if (!customs.length) return;
  const blob = new Blob([JSON.stringify(customs, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ud-bangs.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildShareLink(): string {
  const customs = loadCustomBangs();
  const encoded = btoa(encodeURIComponent(JSON.stringify(customs)));
  return `${window.location.origin}${window.location.pathname}#import=${encoded}`;
}

function showImportDialog(incoming: Bang[]) {
  const existing = loadCustomBangs();
  const existingTriggers = new Set(existing.map((b) => b.t));
  const conflictCount = incoming.filter((b) => existingTriggers.has(b.t)).length;
  const sorted = [...incoming].sort((a, b) => a.t.localeCompare(b.t));

  const overlay = document.createElement("div");
  overlay.className = "import-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "import-dialog-title");

  overlay.innerHTML = `
    <div class="import-dialog">
      <h2 class="import-title" id="import-dialog-title">Import bangs</h2>
      <p class="import-subtitle">
        ${incoming.length} bang${incoming.length !== 1 ? "s" : ""}${conflictCount ? ` · <span class="import-conflict-count">${conflictCount} conflict${conflictCount !== 1 ? "s" : ""}</span>` : ""}
      </p>
      <label class="import-select-all-label">
        <input type="checkbox" id="import-select-all" checked />
        <span>Select all</span>
      </label>
      <ul class="import-list" role="list">
        ${sorted.map((b) => {
          const conflict = existingTriggers.has(b.t);
          return `
          <li class="import-item${conflict ? " import-item--conflict" : ""}">
            <label class="import-item-label">
              <input type="checkbox" class="import-check" data-t="${b.t}" checked />
              <span class="import-bang-info">
                <span class="import-bang-row">
                  <code class="bang-trigger">!${b.t}</code>
                  <span class="import-bang-name">${b.s}</span>
                  ${conflict ? '<span class="import-conflict-badge">overwrites</span>' : ""}
                </span>
                <span class="import-bang-domain">${b.d}</span>
              </span>
            </label>
          </li>`;
        }).join("")}
      </ul>
      <div class="import-actions">
        <button class="import-cancel-btn" type="button">Cancel</button>
        <button class="import-confirm-btn" type="button">Import all (${incoming.length})</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const dialog = overlay.querySelector<HTMLDivElement>(".import-dialog")!;
  const selectAllCheck = overlay.querySelector<HTMLInputElement>("#import-select-all")!;
  const itemChecks = Array.from(overlay.querySelectorAll<HTMLInputElement>(".import-check"));
  const confirmBtn = overlay.querySelector<HTMLButtonElement>(".import-confirm-btn")!;
  const cancelBtn = overlay.querySelector<HTMLButtonElement>(".import-cancel-btn")!;

  function updateState() {
    const n = itemChecks.filter((c) => c.checked).length;
    confirmBtn.textContent =
      n === incoming.length ? `Import all (${n})` :
      n > 0 ? `Import selected (${n})` : "Import selected";
    confirmBtn.disabled = n === 0;
    if (n === 0) {
      selectAllCheck.checked = false;
      selectAllCheck.indeterminate = false;
    } else if (n === incoming.length) {
      selectAllCheck.checked = true;
      selectAllCheck.indeterminate = false;
    } else {
      selectAllCheck.indeterminate = true;
    }
  }

  selectAllCheck.addEventListener("change", () => {
    itemChecks.forEach((c) => (c.checked = selectAllCheck.checked));
    updateState();
  });
  itemChecks.forEach((c) => c.addEventListener("change", updateState));

  function clearFragment() {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function doClose() {
    clearFragment();
    overlay.remove();
  }

  function doImport() {
    const selected = new Set(itemChecks.filter((c) => c.checked).map((c) => c.dataset.t!));
    const toImport = incoming.filter((b) => selected.has(b.t));
    const kept = loadCustomBangs().filter((b) => !selected.has(b.t));
    saveCustomBangs([...kept, ...toImport]);
    overlay.remove();
    clearFragment();
    noSearchDefaultPageRender();
  }

  confirmBtn.addEventListener("click", doImport);
  cancelBtn.addEventListener("click", doClose);

  overlay.addEventListener("click", (e) => {
    if (!dialog.contains(e.target as Node)) doClose();
  });

  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { doClose(); return; }
    const focusable = Array.from(
      overlay.querySelectorAll<HTMLElement>("input:not([disabled]), button:not([disabled])")
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  requestAnimationFrame(() => selectAllCheck.focus());
}

function checkImportFragment() {
  const hash = window.location.hash;
  if (!hash.startsWith("#import=")) return;
  const encoded = hash.slice("#import=".length);
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
    const parsed = parseBangsPayload(decoded);
    if (parsed) showImportDialog(parsed);
  } catch {
    // silently ignore malformed fragments
  }
}

// ─── HOMEPAGE ───

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "s";

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const customs = loadCustomBangs();
  const customTriggers = new Set(customs.map((b) => b.t));

  const customRows = [...customs].sort((a, b) => a.t.localeCompare(b.t))
    .map(
      (b) => `
      <tr class="custom-row">
        <td><code class="bang-trigger">!${b.t}</code></td>
        <td>${b.s}</td>
        <td class="bang-domain">${b.d}</td>
        <td class="bang-delete-cell">
          <button class="delete-btn" data-t="${b.t}" aria-label="Remove !${b.t}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </td>
      </tr>`
    )
    .join("");

  const builtInRows = [...bangs].sort((a, b) => a.t.localeCompare(b.t))
    .map((b) => {
      const overridden = customTriggers.has(b.t);
      return `
      <tr class="${overridden ? "overridden-row" : ""}">
        <td><code class="bang-trigger">!${b.t}</code></td>
        <td>${b.s}${overridden ? ' <span class="overridden-badge">overridden</span>' : ""}</td>
        <td class="bang-domain">${b.d}</td>
        <td></td>
      </tr>`;
    })
    .join("");

  app.innerHTML = `
    <div class="page">
      <main class="main">
        <header class="site-header">
          <h1 class="site-title">Ud</h1>
          <p class="site-desc">Fast bang redirects. Add as a custom search engine in your browser.</p>
        </header>

        <section class="url-section">
          <div class="url-container">
            <input
              type="text"
              class="url-input"
              value="https://ud.jon.gl/?q=%s"
              readonly
              aria-label="Search engine URL"
            />
            <button class="copy-button" aria-label="Copy URL">
              <img src="/clipboard.svg" alt="" />
            </button>
          </div>
          <span class="sr-only" id="copy-status" aria-live="polite"></span>
        </section>

        <section class="bangs-section">
          <h2 class="section-heading">Available bangs</h2>
          <table class="bang-table">
            <thead>
              <tr>
                <th>Bang</th>
                <th>Site</th>
                <th class="bang-domain">Domain</th>
                <th><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              ${customRows}${builtInRows}
            </tbody>
          </table>
        </section>

        <div role="group" aria-labelledby="default-label" class="default-section">
          <span class="default-label" id="default-label">Default:</span>
          ${[...customs, ...bangs].map((b) => {
            const overridden = customTriggers.has(b.t) && !customs.includes(b);
            return `<button class="default-btn${b.t === LS_DEFAULT_BANG ? " active" : ""}${overridden ? " overridden-default" : ""}" data-t="${b.t}" aria-pressed="${b.t === LS_DEFAULT_BANG}" ${overridden ? 'disabled aria-disabled="true"' : ""}>!${b.t}</button>`;
          }).join("")}
        </div>

        <details class="add-bang-details">
          <summary class="add-bang-summary">Custom bangs</summary>
          <form class="add-bang-form" id="add-bang-form">
            <div class="add-bang-fields">
              <div class="add-bang-field">
                <label class="add-bang-label" for="new-trigger">Trigger</label>
                <div class="trigger-input-wrap">
                  <span class="trigger-prefix">!</span>
                  <input id="new-trigger" class="add-bang-input" type="text" placeholder="mytrigger" autocomplete="off" spellcheck="false" />
                </div>
              </div>
              <div class="add-bang-field add-bang-field--grow">
                <label class="add-bang-label" for="new-url">URL <span class="add-bang-hint">use <code>{{{s}}}</code> for the search query</span></label>
                <input id="new-url" class="add-bang-input" type="text" placeholder="https://example.com/search?q={{{s}}}" autocomplete="off" spellcheck="false" />
              </div>
              <div class="add-bang-field">
                <label class="add-bang-label" for="new-name">Name <span class="add-bang-hint">optional</span></label>
                <input id="new-name" class="add-bang-input" type="text" placeholder="My Site" autocomplete="off" />
              </div>
            </div>
            <p class="add-bang-error" id="add-bang-error" role="alert" aria-live="polite"></p>
            <button type="submit" class="add-bang-submit">Add bang</button>
          </form>
          <div class="bang-io">
            <input type="file" id="import-file-input" accept=".json" hidden />
            <button class="bang-io-btn" id="import-file-btn" type="button">Import from file</button>
            ${customs.length > 0 ? `
            <button class="bang-io-btn" id="export-json-btn" type="button">Download .json</button>
            <button class="bang-io-btn" id="copy-share-btn" type="button">Copy share link</button>
            ` : ""}
          </div>
          <p class="add-bang-error" id="io-error" role="alert" aria-live="polite"></p>
        </details>
      </main>

      <footer class="footer">
        <a href="https://jon.gl" target="_blank" rel="noopener noreferrer">jon.gl</a>
        •
        <a href="https://github.com/t3dotgg/unduck" target="_blank" rel="noopener noreferrer">based on unduck</a>
      </footer>
    </div>
  `;

  // copy button
  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;
  const copyStatus = app.querySelector<HTMLSpanElement>("#copy-status")!;
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";
    copyStatus.textContent = "URL copied to clipboard";
    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
      copyStatus.textContent = "";
    }, 2000);
  });

  // default selector
  app.querySelectorAll<HTMLButtonElement>(".default-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("default-bang", btn.dataset.t!);
      app.querySelectorAll<HTMLButtonElement>(".default-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    });
  });

  // delete custom bang
  app.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.t!;
      const updated = loadCustomBangs().filter((b) => b.t !== t);
      saveCustomBangs(updated);
      noSearchDefaultPageRender();
    });
  });

  // add custom bang form
  const form = app.querySelector<HTMLFormElement>("#add-bang-form")!;
  const errorEl = app.querySelector<HTMLParagraphElement>("#add-bang-error")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const t = (app.querySelector<HTMLInputElement>("#new-trigger")!.value.trim().replace(/^!/, "").toLowerCase());
    const u = app.querySelector<HTMLInputElement>("#new-url")!.value.trim();
    const sRaw = app.querySelector<HTMLInputElement>("#new-name")!.value.trim();

    if (!t) { errorEl.textContent = "Trigger is required."; return; }
    if (!/^\S+$/.test(t)) { errorEl.textContent = "Trigger cannot contain spaces."; return; }
    if (!u) { errorEl.textContent = "URL is required."; return; }
    if (!u.includes("{{{s}}}")) { errorEl.textContent = 'URL must contain {{{s}}} as the search placeholder.'; return; }

    let d = u;
    try { d = new URL(u.replace("{{{s}}}", "x")).hostname; } catch { /* keep raw */ }

    const s = sRaw || d;
    const existing = loadCustomBangs().filter((b) => b.t !== t);
    saveCustomBangs([...existing, { t, s, d, u }]);
    noSearchDefaultPageRender();
  });

  // import from file
  const details = app.querySelector<HTMLDetailsElement>(".add-bang-details")!;
  details.addEventListener("toggle", () => {
    if (details.open) details.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  const ioError = app.querySelector<HTMLParagraphElement>("#io-error")!;
  const importFileInput = app.querySelector<HTMLInputElement>("#import-file-input")!;
  const importFileBtn = app.querySelector<HTMLButtonElement>("#import-file-btn")!;

  importFileBtn.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", () => {
    const file = importFileInput.files?.[0];
    if (!file) return;
    ioError.textContent = "";
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        const parsed = parseBangsPayload(raw);
        if (parsed) showImportDialog(parsed);
        else ioError.textContent = "Invalid file — expected an array of bang objects.";
      } catch {
        ioError.textContent = "Could not parse file.";
      }
      importFileInput.value = "";
    };
    reader.readAsText(file);
  });

  // export
  if (customs.length > 0) {
    app.querySelector<HTMLButtonElement>("#export-json-btn")!.addEventListener("click", exportAsJson);

    const shareBtn = app.querySelector<HTMLButtonElement>("#copy-share-btn")!;
    shareBtn.addEventListener("click", async () => {
      const link = buildShareLink();
      await navigator.clipboard.writeText(link);
      shareBtn.textContent = "Copied!";
      setTimeout(() => { shareBtn.textContent = "Copy share link"; }, 2000);
    });
  }
}

// ─── REDIRECT ───

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);
  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = findBang(bangCandidate ?? "") ?? findBang(LS_DEFAULT_BANG);

  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  if (cleanQuery === "")
    return selectedBang ? `https://${selectedBang.d}` : null;

  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  return searchUrl ?? null;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
checkImportFragment();
window.addEventListener("hashchange", checkImportFragment);
