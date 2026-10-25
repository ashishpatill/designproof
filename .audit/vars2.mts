import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
function audit(html: string) {
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  const declared = new Set([...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]));
  const hard: string[] = [];
  for (const m of css.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*(,)?/g)) {
    const k = m[1]!;
    if (!declared.has(k) && !m[2]) hard.push(k);
  }
  const inline = new Set([...html.matchAll(/style="[^"]*?(--[a-zA-Z0-9-]+):/g)].map((m) => m[1]));
  return { hard: [...new Set(hard)].filter((k) => !inline.has(k)), inline: [...inline].sort() };
}
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  const r = audit(previewHtml);
  console.log(t.key.padEnd(12), "hard-undeclared:", r.hard.length ? r.hard.join(", ") : "none", "| inline:", r.inline.join(",") || "-");
}
