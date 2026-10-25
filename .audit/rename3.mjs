import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const SKIP = new Set(["node_modules", ".git", ".next", ".audit", "dist", ".vercel", ".turbo"]);
const RULES = [
  [/`"tell"`/g, '`"designproof"`'],
  [/`tell`/g, "`designproof`"],
  [/\btell\.(?=[a-z])/g, "designproof."],
  [/\/opt\/tell\b/g, "/opt/designproof"],
  [/\/path\/to\/tell\b/g, "/path/to/designproof"],
];
function walk(d, out = []) {
  for (const e of readdirSync(d)) {
    if (SKIP.has(e)) continue;
    const f = join(d, e);
    const st = statSync(f);
    if (st.isDirectory()) walk(f, out);
    else if (st.isFile()) out.push(f);
  }
  return out;
}
const OK = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".mdc", ".sh", ".yml", ".yaml", ".example", ".css"]);
const counts = new Map(); let changed = 0;
for (const file of walk(ROOT)) {
  if (!OK.has(extname(file)) && basename(file) !== "Dockerfile" && !basename(file).startsWith(".env")) continue;
  let src; try { src = readFileSync(file, "utf8"); } catch { continue; }
  if (!src.includes("tell")) continue;
  let next = src;
  for (const [re, to] of RULES) {
    const hits = next.match(re); if (!hits) continue;
    counts.set(String(re), (counts.get(String(re)) ?? 0) + hits.length);
    next = next.replace(re, to);
  }
  if (next !== src) { changed++; if (WRITE) writeFileSync(file, next); }
}
console.log(WRITE ? "WRITE" : "DRY", "changed:", changed);
for (const [k, v] of counts) console.log(String(v).padStart(5), k);
