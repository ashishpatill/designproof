import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

/** Every custom property the sheet READS via var(--x) must be declared somewhere. */
function auditVars(html: string) {
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  const declared = new Set([...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]!));
  const used = new Map<string, number>();
  for (const m of css.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*(,)?/g)) {
    const key = m[1]! + (m[2] ? " (has fallback)" : " (NO fallback)");
    used.set(key, (used.get(key) ?? 0) + 1);
  }
  const undeclared = [...used.entries()].filter(([k]) => !declared.has(k.split(" ")[0]!));
  return { declared: declared.size, undeclared };
}

for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  const r = auditVars(previewHtml);
  const hard = r.undeclared.filter(([k]) => k.includes("NO fallback"));
  console.log(t.key.padEnd(12), "declared:" + String(r.declared).padStart(4),
    "undeclared:" + String(r.undeclared.length).padStart(2),
    "hard:" + String(hard.length).padStart(2),
    hard.length ? hard.map(([k, n]) => `${k}×${n}`).join(", ") : "");
}
