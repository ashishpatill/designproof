import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
import { createHash } from "node:crypto";

type Row = { key: string; html: string; css: string };
const rows: Row[] = [];
for (const t of DESIGN_TEMPLATES) {
  const res: any = designFromFeatures(t.brief);
  const html: string = res.previewHtml;
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  rows.push({ key: t.key, html, css: styles.join("\n/*--*/\n") });
}
const h = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);
for (const r of rows) console.log(r.key.padEnd(12), "cssLen:" + String(r.css.length).padStart(7), "hash:" + h(r.css));
console.log("\ndistinct CSS blobs:", new Set(rows.map((r) => r.css)).size, "/", rows.length);

// how much of the CSS is byte-identical between pairs? use a line-level set difference
const lines = rows.map((r) => new Set(r.css.split("\n").filter((l) => l.trim())));
const common = lines[0];
const inter = [...lines[0]].filter((l) => lines.every((s) => s.has(l)));
console.log("CSS lines (non-empty) in template 0:", lines[0].size);
console.log("CSS lines present in ALL:", inter.length, `(${((inter.length / lines[0].size) * 100).toFixed(1)}%)`);
const charsInter = inter.reduce((a, l) => a + l.length, 0);
console.log("chars in shared lines:", charsInter, `(${((charsInter / rows[0].css.length) * 100).toFixed(1)}% of css)`);
console.log("union of all CSS lines:", new Set(rows.flatMap((r) => [...r.css.split("\n").filter((l) => l.trim())])).size);

// same for body markup: strip text content and compare tag structure
const strip = (s: string) => s.replace(/>[^<]+</g, "><").replace(/\s+/g, " ");
const struct = rows.map((r) => strip(r.html.split("</head>")[1] ?? r.html));
console.log("\ndistinct tag-structure (text removed):", new Set(struct).size, "/", rows.length);
for (let i = 1; i < struct.length; i++) {
  const a = struct[0], b = struct[i];
  // longest common prefix ratio by token
  const ta = a.split(" "), tb = b.split(" ");
  let same = 0; const n = Math.min(ta.length, tb.length);
  for (let k = 0; k < n; k++) if (ta[k] === tb[k]) same++;
  console.log("  saas vs", rows[i].key.padEnd(12), "token-level common prefix:", ((same / n) * 100).toFixed(1) + "%");
}
