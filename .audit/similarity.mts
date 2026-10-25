import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
import { createHash } from "node:crypto";

type Row = { key: string; html: string; css: string; body: string; sections: string[] };
const rows: Row[] = [];
for (const t of DESIGN_TEMPLATES) {
  const res: any = designFromFeatures(t.brief);
  const html: string = res.previewHtml;
  const css = (html.match(/<style>([\s\S]*?)<\/style>/) ?? ["", ""])[1];
  const body = html.split("</head>")[1] ?? "";
  const sections = [...html.matchAll(/<section[^>]*class="([^"]*)"/g)].map((m) => m[1].split(/\s+/).sort().join("."));
  rows.push({ key: t.key, html, css, body, sections });
}

const h = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);

console.log("=== per template hashes ===");
for (const r of rows) console.log(r.key.padEnd(12), "css:" + h(r.css), "sections:" + h(r.sections.join("|")), "body:" + h(r.body), "cssLen:" + r.css.length);

const uniq = (f: (r: Row) => string) => new Set(rows.map(f)).size;
console.log("\ndistinct CSS blobs:", uniq((r) => r.css), "/", rows.length);
console.log("distinct section-class sequences:", uniq((r) => r.sections.join("|")), "/", rows.length);
console.log("distinct body markup:", uniq((r) => r.body), "/", rows.length);
console.log("distinct full html:", uniq((r) => r.html), "/", rows.length);

// common CSS: the CSS text shared by every template (order-insensitive on rule blocks)
const ruleSets = rows.map((r) => r.css.split("}").map((x) => x.trim() + "}").filter((x) => x.length > 3));
const counts = new Map<string, number>();
for (const set of ruleSets) for (const rule of new Set(set)) counts.set(rule, (counts.get(rule) ?? 0) + 1);
const shared = [...counts.entries()].filter(([, c]) => c === rows.length);
const totalSharedChars = shared.reduce((a, [k]) => a + k.length, 0);
console.log("\nCSS rules present in ALL 17 templates:", shared.length);
console.log("chars of shared CSS:", totalSharedChars, `(${((totalSharedChars / rows[0].css.length) * 100).toFixed(1)}% of one template's CSS)`);

// class inventory
const classes = new Map<string, number>();
for (const r of rows) for (const m of r.html.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) classes.set(c, (classes.get(c) ?? 0) + 1);
const sorted = [...classes.entries()].sort((a, b) => b[1] - a[1]);
console.log("\ndistinct CSS classes used:", classes.size);
console.log("top 25 classes by occurrence across all pages:");
for (const [c, n] of sorted.slice(0, 25)) console.log("  ", String(n).padStart(4), c);
console.log("\nclasses used on ALL 17 pages:", sorted.filter(([, n]) => n >= 17).length);
