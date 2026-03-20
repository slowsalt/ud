// This file was (mostly) ripped from https://duckduckgo.com/bang.js
// => This file has been severely trimmed from original

export const bangs = [
  {
    c: "AI",
    d: "mistral.ai",
    s: "Mistral Le Chat",
    sc: "AI",
    t: "mistral",
    u: "https://mistral.ai/chat?q={{{s}}}",
  },
  {
    c: "Online Services",
    d: "www.google.com",
    s: "Google",
    sc: "Google",
    t: "g",
    u: "https://www.google.com/search?q={{{s}}}",
  },
  {
    c: "Online Services",
    d: "www.qwant.com",
    s: "Qwant",
    sc: "Search",
    t: "qwant",
    u: "https://www.qwant.com/?q={{{s}}}",
  },
  {
    c: "Online Services",
    d: "www.1881.no",
    s: "1881.no",
    sc: "Tools",
    t: "1881",
    u: "http://www.1881.no/?query={{{s}}}",
  },
  {
    c: "Online Services",
    d: "www.gulesider.no",
    s: "Gule Sider",
    sc: "Maps",
    t: "gulesider",
    u: "https://www.gulesider.no/?q={{{s}}}",
  },
  {
    c: "Tech",
    d: "github.com",
    s: "GitHub",
    sc: "Programming",
    t: "gh",
    u: "https://github.com/search?utf8=%E2%9C%93&q={{{s}}}",
  },
  {
    c: "AI",
    d: "claude.ai",
    s: "Claude Chat",
    sc: "AI",
    t: "claude",
    u: "https://claude.ai/new?q={{{s}}}",
  },
  {
    c: "Shopping",
    d: "www.dba.dk",
    s: "Den Bl\u00e5 Avis",
    sc: "Online (marketplace)",
    t: "dba",
    u: "http://www.dba.dk/soeg/?soeg={{{s}}}",
  },
  {
    c: "Tech",
    d: "www.norid.no",
    s: "Norid",
    sc: "Domains",
    t: "nowhois",
    u: "http://www.norid.no/index.html?charset=UTF-8&page=index&sok=Søk&query={{{s}}}"
  },
  {
    c: "Tech",
    d: "instantdomainsearch.com",
    s: "Instant Domain Search",
    sc: "Domains",
    t: "domain",
    u: "https://instantdomainsearch.com/#search={{{s}}}"
  },
];
