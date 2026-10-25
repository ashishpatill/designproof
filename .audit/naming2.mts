import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const probe = `(() => {
  const names = window.__names || [];
  const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const out = [];
  for (const s of document.querySelectorAll("[data-section]")) {
    // Visible text only: text nodes plus SVG text. aria-* attributes describe; they do not paint.
    const parts = [];
    const walk = document.createTreeWalker(s, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { const p = n.parentElement; return p && p.tagName === "SCRIPT" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    let n; while ((n = walk.nextNode())) parts.push(n.textContent || "");
    const hay = norm(parts.join(" \\u0000 "));
    for (const nm of names) {
      const key = norm(nm); if (!key) continue;
      let count = 0, i = 0;
      while ((i = hay.indexOf(key, i)) !== -1) { count++; i += key.length; }
      if (count > 0) out.push({ section: s.dataset.section, name: nm, count });
    }
  }
  return out;
})()`;
let worst = 0; const offenders: any[] = [];
for (const t of DESIGN_TEMPLATES) {
  const names = t.brief.features.map((f) => f.name);
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
  await page.waitForTimeout(180);
  const rows: any[] = await page.evaluate(probe);
  const over = rows.filter((r) => r.count > 2);
  const max = rows.reduce((a, r) => Math.max(a, r.count), 0);
  worst = Math.max(worst, max);
  offenders.push(...over.map((r) => ({ t: t.key, ...r })));
  console.log(t.key.padEnd(12), "over-2:", String(over.length).padStart(2), "max:", max, over.slice(0,3).map(r=>`${r.section}:${r.count}×${r.name}`).join(" | "));
}
console.log("\nworst:", worst, "| offenders >2:", offenders.length);
const hist = new Map<number, number>();
for (const o of offenders) hist.set(o.count, (hist.get(o.count) ?? 0) + 1);
console.log("count histogram:", [...hist.entries()].sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k}×→${v}`).join("  "));
await browser.close();
