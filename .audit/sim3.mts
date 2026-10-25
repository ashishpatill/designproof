import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const rows: { key: string; html: string }[] = [];
for (const t of DESIGN_TEMPLATES) {
  const res: any = designFromFeatures(t.brief);
  rows.push({ key: t.key, html: res.previewHtml });
}
const tokens = (s: string) => (s.split("</head>")[1] ?? s).replace(/>[^<]+</g, "><").replace(/[<>]/g, " ").split(/\s+/).filter(Boolean);
const sets = rows.map((r) => new Set(tokens(r.html)));
const jac = (a: Set<string>, b: Set<string>) => {
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};
console.log("Pairwise structural-token Jaccard (saas vs each):");
for (let i = 1; i < rows.length; i++) console.log("  saas vs", rows[i].key.padEnd(12), (jac(sets[0], sets[i]) * 100).toFixed(1) + "%");
let sum = 0, n = 0;
for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) { sum += jac(sets[i], sets[j]); n++; }
console.log("\nmean pairwise structural Jaccard across all 17:", ((sum / n) * 100).toFixed(1) + "%");

// text-token Jaccard (copy similarity)
const text = (s: string) => (s.split("</head>")[1] ?? s).replace(/<[^>]*>/g, " ").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3);
const tsets = rows.map((r) => new Set(text(r.html)));
const tjac = (a: Set<string>, b: Set<string>) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); };
let s2 = 0, n2 = 0;
for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) { s2 += tjac(tsets[i], tsets[j]); n2++; }
console.log("mean pairwise COPY (word) Jaccard across all 17:", ((s2 / n2) * 100).toFixed(1) + "%");

// inline CSS bytes vs "used" — count distinct declarations
const css = (rows[0].html.match(/<style>([\s\S]*?)<\/style>/g) ?? []).join("");
console.log("\ninline CSS bytes in saas:", css.length);
const decls = css.split(";").length;
console.log("declarations:", decls);
