/** Which figure family prints a capability name as SVG text, and how many times. */
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
  for (const el of document.querySelectorAll('svg text')) {
    const t = norm(el.textContent || "");
    if (!t) continue;
    for (const name of names) {
      const key = norm(name);
      if (!key) continue;
      let i = 0, hits = 0;
      while ((i = t.indexOf(key, i)) !== -1) { hits += 1; i += key.length; }
      if (!hits) continue;
      const svg = el.closest("svg");
      out.push({
        name,
        figure: svg?.dataset.figure || svg?.className.baseVal || "?",
        cls: el.getAttribute("class") || "",
        x: el.getAttribute("x"), y: el.getAttribute("y"),
        hits,
        text: (el.textContent || "").trim().slice(0, 60),
      });
    }
  }
  // collapse per (name, figure)
  const agg = new Map();
  for (const r of out) {
    const k = r.name + "|" + r.figure + "|" + r.cls;
    const cur = agg.get(k) || { ...r, n: 0, xs: new Set(), ys: new Set() };
    cur.n += r.hits;
    cur.xs.add(r.x); cur.ys.add(r.y);
    agg.set(k, cur);
  }
  return [...agg.values()].map((r) => ({ ...r, xs: [...r.xs].join(","), ys: [...r.ys].join(",") }));
})()`;

for (const t of DESIGN_TEMPLATES) {
  const names = t.brief.features.map((f) => f.name);
  const { previewHtml } = designFromFeatures(t.brief) as never as { previewHtml: string };
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
  await page.waitForTimeout(120);
  const rows = (await page.evaluate(probe)) as Array<{ name: string; figure: string; cls: string; n: number; x: string; y: string; text: string }>;
  for (const r of rows) console.log(`${t.key}\t${r.figure}\t${r.name}\t×${r.n}\tcls=${r.cls}\tx=${r.x}\ty=${r.y}\t${JSON.stringify(r.text)}`);
}
await browser.close();
