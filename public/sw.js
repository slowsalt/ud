const CACHE = "ud-v3";
const CONFIG_KEY = "/__ud_config__";

const ASSETS = [
  "/",
  "/index.html",
  "/bangs.js",
  "/clipboard.svg",
  "/clipboard-check.svg",
  "/search.svg",
];

importScripts('/bangs.js'); // provides BUILTIN_BANGS global

// In-memory config cache — survives within a SW lifetime, repopulated from
// Cache API on restart and kept fresh via postMessage from the client.
let swConfig = null;

self.addEventListener("message", (event) => {
  if (event.data?.type === "ud-config-update") {
    swConfig = event.data.config;
  }
});

async function getConfig() {
  if (swConfig) return swConfig;
  try {
    const cache = await caches.open(CACHE);
    const resp = await cache.match(CONFIG_KEY);
    if (resp) swConfig = await resp.json();
  } catch (e) { /* fall through to defaults */ }
  return swConfig ?? { customs: [], defaultBang: "s" };
}

function findBang(trigger, customs) {
  return customs.find((b) => b.t === trigger) || BUILTIN_BANGS.find((b) => b.t === trigger);
}

function getBangRedirectUrl(query, customs, defaultBang) {
  const match = query.match(/!(\S+)/i);
  const bangCandidate = match ? match[1].toLowerCase() : "";
  const selectedBang = findBang(bangCandidate, customs) || findBang(defaultBang, customs);
  if (!selectedBang) return null;

  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();
  if (cleanQuery === "") return selectedBang.u.includes("{{{s}}}") ? `https://${selectedBang.d}` : selectedBang.u;

  return selectedBang.u.replace(
    "{{{s}}}",
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Pre-load config into memory so the first navigation request is fast.
  getConfig();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Intercept navigation requests with a query — attempt bang redirect
  if (event.request.mode === "navigate" && url.searchParams.has("q")) {
    event.respondWith((async () => {
      const q = url.searchParams.get("q").trim();
      if (q) {
        // swConfig ?? getConfig() avoids any async overhead on the warm path
        const { customs, defaultBang } = swConfig ?? await getConfig();
        const redirectUrl = getBangRedirectUrl(q, customs, defaultBang);
        if (redirectUrl) {
          try {
            const { protocol } = new URL(redirectUrl);
            if (protocol === "http:" || protocol === "https:") {
              return Response.redirect(redirectUrl, 307);
            }
          } catch (e) { /* fall through */ }
        }
      }
      // No redirect — serve the cached homepage
      return caches.match("/index.html").then((cached) => cached ?? fetch(event.request));
    })());
    return;
  }

  // All other requests: cache-first, populate on miss
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached ?? fetch(event.request).then((response) => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      })
    )
  );
});
