# Ud

A customised fork of Unduck with a curated bang list and additional features. Set it up as a custom search engine in your browser:

```
https://<your-domain>/?q=%s
```

After the first visit the service worker caches everything locally — redirects happen on your device with no round trip to the server.

## Features

- **Curated bang list** — a trimmed, opinionated set of built-in bangs
- **Custom bangs** — add your own `!trigger → URL` mappings via the UI
- **Default bang** — choose which search engine handles unbanged queries
- **Import / export** — sync custom bangs between browsers and devices via JSON file download or a share link (`#import=…`)
- **Import confirmation** — share links prompt a review dialog before writing anything; conflicts are flagged per-bang and individually toggleable
- **Keyboard accessible** — full keyboard navigation throughout

---

# Unduck (original)

DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables all of DuckDuckGo's bangs to work, but much faster.

```
https://unduck.link?q=%s
```

## How is it that much faster?

DuckDuckGo does their redirects server side. Their DNS is...not always great. Result is that it often takes ages.

I solved this by doing all of the work client side. Once you've went to https://unduck.link once, the JS is all cache'd and will never need to be downloaded again. Your device does the redirects, not me.
