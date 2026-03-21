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

// ─── HOMEPAGE ───

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "qwant";

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const customs = loadCustomBangs();
  const customTriggers = new Set(customs.map((b) => b.t));

  const customRows = customs
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

  const builtInRows = bangs
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
          ${[...customs, ...bangs].map((b) => `<button class="default-btn${b.t === LS_DEFAULT_BANG ? " active" : ""}" data-t="${b.t}" aria-pressed="${b.t === LS_DEFAULT_BANG}">!${b.t}</button>`).join("")}
        </div>

        <details class="add-bang-details">
          <summary class="add-bang-summary">Add a custom bang</summary>
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
    const customs = loadCustomBangs().filter((b) => b.t !== t); // replace if same trigger
    saveCustomBangs([...customs, { t, s, d, u }]);
    noSearchDefaultPageRender();
    // re-open the details so the user sees their new bang in context
  });
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
