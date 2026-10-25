import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const probe = `(() => {
  const name = window.__probe;
  const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const key = norm(name);
  const hits = [];
  for (const s of document.querySelectorAll("[data-section]")) {
    if (s.dataset.section !== "features" && s.dataset.section !== "hero") continue;
    const walk = document.createTreeWalker(s, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { const p = n.parentElement; return p && p.tagName === "SCRIPT" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    let n;
    while ((n = walk.nextNode())) {
      const v = norm(n.textContent);
      if (v && v.includes(key)) hits.push({ where: n.parentElement.tagName + "." + (n.parentElement.getAttribute("class") || ""), text: n.textContent.trim().slice(0, 46), exact: v === key });
    }
    for (const el of s.querySelectorAll("[aria-label],[data-rail-label],[data-view]")) {
      for (const a of ["aria-label", "data-rail-label", "data-view"]) {
        const val = norm(el.getAttribute(a));
        if (val && val.includes(key)) hits.push({ where: el.tagName + "[" + a + "]", text: (el.getAttribute(a) || "").slice(0, 46), exact: val === key });
      }
    }
  }
  return hits;
})()`;
const t = DESIGN_TEMPLATES.find((x) => x.key === "herbarium")!;
const { previewHtml } = designFromFeatures(t.brief) as any;
await page.setContent(previewHtml, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
await page.addScriptTag({ content: `window.__probe = "Binomial strip";` });
await page.waitForTimeout(200);
const hits: any[] = await page.evaluate(probe);
for (const h of hits) console.log((h.exact ? "EXACT " : "sub   ") + h.where.padEnd(46), JSON.stringify(h.text));
await browser.close();
