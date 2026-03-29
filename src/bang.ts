// Built-in bangs are defined in /public/bangs.js (loaded as a plain script
// before this module runs) so the same list is shared with the service worker
// and the inline fallback script in index.html without duplication.
declare const BUILTIN_BANGS: Array<{ t: string; s: string; d: string; u: string }>;

export const bangs = BUILTIN_BANGS;
