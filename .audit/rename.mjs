#!/usr/bin/env node
/**
 * One-shot repo rename: product brand "Tell Proof" -> "Design Proof",
 * gallery artifacts "specimens" -> "templates", plus every brand-scoped
 * identifier (package scope, CSS prefix, env vars, storage keys, MCP tools).
 *
 * Domain vocabulary is deliberately preserved: the common noun "tell" / "tells"
 * (a genericness giveaway) and detector names ending in "Tell".
 *
 * Usage: node .audit/rename.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", ".audit", "dist", ".vercel", ".turbo", "coverage",
]);

const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonl", ".md", ".mdc",
  ".css", ".scss", ".yml", ".yaml", ".sh", ".bash", ".py", ".txt", ".sql",
  ".example", ".html", ".htm", ".toml", ".env", ".xml", ".svg", ".gitignore",
  ".dockerignore", ".editorconfig", ".prettierrc",
]);

const TEXT_NAMES = new Set([
  "Dockerfile", "LICENSE", "Makefile", ".gitignore", ".dockerignore", ".npmrc",
]);

/** External identifiers that cannot be renamed from inside this checkout. */
const PROTECTED = [
  "tell-five.vercel.app",
  "tell-capture.onrender.com",
  "tell-xxxx.vercel.app",
  "tell-xxxx.onrender.com",
  "ashishpatill/tell-ai-ui-critic",
  "ashishpatill/tell-design-data",
];

/** Ordered replacements. Longest / most specific first. */
const RULES = [
  ["package scope", /@tell\//g, "@designproof/"],

  ["brand: Tell Proof", /Tell Proof/g, "Design Proof"],
  ["brand: TELL PROOF", /TELL PROOF/g, "DESIGN PROOF"],
  ["brand: Tell proof", /Tell proof/g, "Design proof"],
  ["brand: tell proof", /tell proof/g, "design proof"],
  ["brand: Tell Proof's", /Design Proof's/g, "Design Proof's"],

  ["gallery: Tell Specimens", /Tell Specimens/g, "Design Templates"],
  ["gallery: TELL SPECIMENS", /TELL SPECIMENS/g, "DESIGN TEMPLATES"],
  ["gallery: Tell specimens", /Tell specimens/g, "Design templates"],
  ["gallery: tell specimens", /tell specimens/g, "design templates"],
  ["gallery: Tell Specimen", /Tell Specimen/g, "Design Template"],
  ["gallery: tell specimen", /tell specimen/g, "design template"],
  ["gallery: Specimens", /Specimens/g, "Templates"],
  ["gallery: specimens", /specimens/g, "templates"],
  ["gallery: Specimen", /Specimen/g, "Template"],
  ["gallery: specimen", /specimen/g, "template"],
  ["gallery: SPECIMEN", /SPECIMEN/g, "TEMPLATE"],

  ["attr: data-tell-", /data-tell-/g, "data-dp-"],
  ["token: --tell-", /--tell-/g, "--dp-"],

  ["doc: TELL_PROOF", /TELL_PROOF/g, "DESIGN_PROOF"],
  ["env: TELL_", /TELL_/g, "DP_"],

  ["global: __tell", /__tell/g, "__designproof"],
  ["telemetry: 'tell.", /(["'`])tell\./g, "$1designproof."],

  ["uri: tell://", /\btell:\/\//g, "designproof://"],
  ["mcp: tell_*", /\btell_/g, "designproof_"],

  ["prop: .tell", /\.tell(?![A-Za-z0-9_-])/g, ".designproof"],

  ["storage: \"tell:", /(["'`])tell:/g, "$1dp:"],

  ["id: tell<Upper>", /\btell(?=[A-Z])/g, "dp"],
  ["id: <lower>Tell<Upper>", /([a-z])Tell(?=[A-Z])/g, "$1DesignProof"],
  ["id: Tell<Upper>", /\bTell(?=[A-Z])/g, "DesignProof"],

  ["kebab: tell-", /\btell-/g, "dp-"],
  ["path: tell/", /\btell(?=\/)/g, "designproof"],

  ["brand: Tell", /\bTell\b/g, "Design Proof"],
  ["brand: TELL", /\bTELL\b/g, "DESIGN PROOF"],
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

function isText(file) {
  const name = basename(file);
  if (TEXT_NAMES.has(name)) return true;
  const ext = extname(file);
  if (TEXT_EXT.has(ext)) return true;
  if (name.startsWith(".env")) return true;
  return false;
}

const sentinels = PROTECTED.map((_, i) => `\u0001PROTECT${i}\u0001`);
const files = walk(ROOT).filter(isText);
const counts = new Map();
const touched = [];

for (const file of files) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!/[Tt]ell|TELL|specimen|Specimen/.test(src)) continue;

  let next = src;
  for (let i = 0; i < PROTECTED.length; i += 1) {
    next = next.split(PROTECTED[i]).join(sentinels[i]);
  }

  for (const [label, re, to] of RULES) {
    const hits = next.match(re);
    if (!hits) continue;
    counts.set(label, (counts.get(label) ?? 0) + hits.length);
    next = next.replace(re, to);
  }

  for (let i = 0; i < PROTECTED.length; i += 1) {
    next = next.split(sentinels[i]).join(PROTECTED[i]);
  }

  if (next !== src) {
    touched.push(file);
    if (WRITE) writeFileSync(file, next);
  }
}

console.log(WRITE ? "WRITE" : "DRY RUN");
console.log("files scanned:", files.length, "files changed:", touched.length);
for (const [label, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(String(n).padStart(7), label);
}
