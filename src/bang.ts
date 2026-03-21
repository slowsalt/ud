// This file was (mostly) ripped from https://duckduckgo.com/bang.js
// => This file has been severely trimmed from original

export const bangs = [
  {
    d: "mistral.ai",
    s: "Mistral Le Chat",
    t: "mistral",
    u: "https://mistral.ai/chat?q={{{s}}}",
  },
  {
    d: "www.google.com",
    s: "Google",
    t: "g",
    u: "https://www.google.com/search?q={{{s}}}",
  },
  {
    d: "www.qwant.com",
    s: "Qwant Search",
    t: "q",
    u: "https://www.qwant.com/?q={{{s}}}",
  },
  {
    d: "www.1881.no",
    s: "1881.no",
    t: "1881",
    u: "http://www.1881.no/?query={{{s}}}",
  },
  {
    d: "www.gulesider.no",
    s: "Gule Sider",
    t: "gs",
    u: "https://www.gulesider.no/?q={{{s}}}",
  },
  {
    d: "claude.ai",
    s: "Claude Chat",
    t: "claude",
    u: "https://claude.ai/new?q={{{s}}}",
  },
  {
    d: "www.dba.dk",
    s: "Den Bl\u00e5 Avis",
    t: "dba",
    u: "http://www.dba.dk/soeg/?soeg={{{s}}}",
  },
  {
    d: "www.norid.no",
    s: "Norid",
    t: "whoisno",
    u: "http://www.norid.no/index.html?charset=UTF-8&page=index&sok=Søk&query={{{s}}}"
  },
  {
    d: "instantdomainsearch.com",
    s: "Instant Domain Search",
    t: "domain",
    u: "https://instantdomainsearch.com/#search={{{s}}}"
  },
  {
    t: "s",
    s: "Startpage",
    d: "startpage.com",
    u: "https://startpage.com/do/metasearch.pl?query={{{s}}}"
  },
  {
    t: "yt",
    s: "YouTube",
    d: "youtube.com",
    u: "https://www.youtube.com/results?search_query={{{s}}}"
  },
];
