import { bangs } from "./bang";
import "./global.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;

  const bangRows = bangs
    .map(
      (b) => `
      <tr>
        <td><code class="bang-trigger">!${b.t}</code></td>
        <td>${b.s}</td>
        <td class="bang-domain">${b.d}</td>
      </tr>`
    )
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
        </section>

        <section class="bangs-section">
          <h2 class="section-heading">Available bangs</h2>
          <table class="bang-table">
            <thead>
              <tr>
                <th>Bang</th>
                <th>Site</th>
                <th class="bang-domain">Domain</th>
              </tr>
            </thead>
            <tbody>
              ${bangRows}
            </tbody>
          </table>
        </section>
      </main>

      <footer class="footer">
        <a href="https://github.com/t3dotgg/unduck" target="_blank">based on unduck</a>
      </footer>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";
    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });
}

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "qwant";
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
  if (cleanQuery === "")
    return selectedBang ? `https://${selectedBang.d}` : null;

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
