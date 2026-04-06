// Single source of truth for built-in bangs.
// Loaded by sw.js via importScripts and by index.html as a plain script,
// making BUILTIN_BANGS available as a global in both contexts.
var BUILTIN_BANGS = [
  { t: "mi",        s: "Mistral Le Chat",                 d: "chat.mistral.ai",        u: "https://chat.mistral.ai/chat?q={{{s}}}" },
  { t: "mii",       s: "Mistral Incognito",             d: "chat.mistral.ai",        u: "https://chat.mistral.ai/incognito" },
  { t: "g",        s: "Google",                           d: "www.google.com",         u: "https://www.google.com/search?q={{{s}}}" },
  { t: "q",        s: "Qwant Search",                     d: "www.qwant.com",          u: "https://www.qwant.com/?q={{{s}}}" },
  { t: "1881",     s: "1881.no",                          d: "www.1881.no",            u: "http://www.1881.no/?query={{{s}}}" },
  { t: "gs",       s: "Gule Sider",                       d: "www.gulesider.no",       u: "https://www.gulesider.no/{{{s}}}/hvem+har+ringt" },
  { t: "claude",   s: "Claude Chat",                      d: "claude.ai",              u: "https://claude.ai/new?q={{{s}}}" },
  { t: "dba",      s: "Den Bl\u00e5 Avis",                d: "www.dba.dk",             u: "http://www.dba.dk/soeg/?soeg={{{s}}}" },
  { t: "whoisno",  s: "Norid",                            d: "www.norid.no",           u: "https://www.norid.no/en/domeneoppslag/hvem-har-domenenavnet/?query={{{s}}}" },
  { t: "domain",   s: "Instant Domain Search",            d: "instantdomainsearch.com",u: "https://instantdomainsearch.com/?q={{{s}}}" },
  { t: "s",        s: "Startpage",                        d: "startpage.com",          u: "https://startpage.com/do/metasearch.pl?query={{{s}}}" },
  { t: "yt",       s: "YouTube",                          d: "youtube.com",            u: "https://www.youtube.com/results?search_query={{{s}}}" },
  { t: "pno",      s: "Proff.no",                         d: "proff.no",               u: "https://www.proff.no/bransjesøk?q={{{s}}}" },
  { t: "pdk",      s: "Proff.dk",                         d: "proff.dk",               u: "https://www.proff.dk/branchesøg?q={{{s}}}" },
  { t: "wa",       s: "Wolfram Alpha",                    d: "wolframalpha.com",       u: "https://www.wolframalpha.com/input?i={{{s}}}" },
];
