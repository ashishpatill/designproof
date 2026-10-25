#!/usr/bin/env node
/** Pass 2: brand-scoped leftovers in code that the generic rules could not reach safely. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".audit", "dist", ".vercel", ".turbo"]);

const RULES = [
  [/\{ tell:/g, "{ designproof:"],
  [/\btell: \{/g, "designproof: {"],
  [/"tell": \{/g, '"designproof": {'],
  [/"  tell:"/g, '"  designproof:"'],
  [/\(\^  tell:\\n/g, "(^  designproof:\\n"],
  [/serverName: "tell"/g, 'serverName: "designproof"'],
  [/--scope user tell /g, "--scope user designproof "],
  [/tell mcp install/g, "designproof mcp install"],
  [/tell mcp print-config/g, "designproof mcp print-config"],
  [/tell mcp platforms/g, "designproof mcp platforms"],
  [/tell diagnose/g, "designproof diagnose"],
  [/tell doctor/g, "designproof doctor"],
  [/\[tell diagnose\]/g, "[designproof diagnose]"],
  [/"name": "tell"/g, '"name": "designproof"'],
  [/"tell": "pnpm -F @designproof\/cli/g, '"designproof": "pnpm -F @designproof/cli'],
  [/"tell": "\.\/dist\/cli\.js"/g, '"designproof": "./dist/cli.js"'],
  [/"tell:build"/g, '"designproof:build"'],
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (st.isFile()) out.push(full);
  }
  return out;
}

const OK = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".mdc", ".sh", ".yml", ".yaml", ".css", ".example"]);
const counts = new Map();
let changed = 0;

for (const file of walk(ROOT)) {
  const name = basename(file);
  if (!OK.has(extname(file)) && name !== "Dockerfile" && !name.startsWith(".env")) continue;
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!src.includes("tell")) continue;
  let next = src;
  for (const [re, to] of RULES) {
    const hits = next.match(re);
    if (!hits) continue;
    counts.set(String(re), (counts.get(String(re)) ?? 0) + hits.length);
    next = next.replace(re, to);
  }
  if (next !== src) {
    changed += 1;
    if (WRITE) writeFileSync(file, next);
  }
}

console.log(WRITE ? "WRITE" : "DRY", "files changed:", changed);
for (const [k, v] of [...counts.entries()].sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(5), k);
