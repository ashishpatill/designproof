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
  for (const section of document.querySelectorAll("[data-section]")) {
    const parts = [];
    const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { const p = n.parentElement; return p && (p.tagName === "SCRIPT" || p.tagName === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    let n; while ((n = walk.nextNode())) parts.push(n.textContent || "");
    const hay = norm(parts.join(" "));
    for (const name of names) {
      const key = norm(name); if (!key) continue;
      let c = 0, i = 0;
      while ((i = hay.indexOf(key, i)) !== -1) { c += 1; i += key.length; }
      if (c) out.push({ section: section.dataset.section, name, count: c });
    }
  }
  return out;
})()`;
const hist = new Map<number, number>();
const perSection = new Map<string, number>();
let worst = 0; const worstList: string[] = [];
for (const t of DESIGN_TEMPLATES) {
  const names = t.brief.features.map((f) => f.name);
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
  await page.waitForTimeout(180);
  const rows: any[] = await page.evaluate(probe);
  for (const r of rows) {
    hist.set(r.count, (hist.get(r.count) ?? 0) + 1);
    perSection.set(r.section, Math.max(perSection.get(r.section) ?? 0, r.count));
    if (r.count > worst) { worst = r.count; worstList.length = 0; }
    if (r.count === worst) worstList.push(`${t.key}/${r.section}:"${r.name}"`);
  }
}
console.log("count histogram (all templates):", [...hist.entries()].sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k}×→${v}`).join("  "));
console.log("worst per section:", [...perSection.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(" "));
console.log("overall worst:", worst, worstList.slice(0,8).join(", "));
const over4 = [...hist.entries()].filter(([k])=>k>4).reduce((a,[,v])=>a+v,0);
const over5 = [...hist.entries()].filter(([k])=>k>5).reduce((a,[,v])=>a+v,0);
console.log("occurrences >4:", over4, "| >5:", over5);
await browser.close();
