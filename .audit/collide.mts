import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });

/** Claim cards that sit over a figure, and SVG text that ends up underneath them. */
const probe = `(() => {
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
  const overlaps = (a, b) => a.x < b.r - 1 && a.r > b.x + 1 && a.y < b.b - 1 && a.b > b.y + 1;
  const cards = [...document.querySelectorAll(
    ".ds-specimen-tag,.ds-press-label,.ds-dossier-claim,.ds-entry-claim,.ds-chrono-claim,.ds-range-claim,.ds-gather-claim,.ds-ember-claim,.ds-care-claim,.ds-helm-claim,.ds-weft-claim,.ds-path-claim,.ds-seam-claim,.ds-hero-claim,.ds-diligence-claim,.ds-loom-claim"
  )].filter((el) => el.offsetParent !== null).map((el) => ({ el, box: box(el), cls: el.className }));
  const out = [];
  for (const card of cards) {
    if (card.box.w < 40 || card.box.h < 40) continue;
    for (const svg of document.querySelectorAll("svg")) {
      for (const t of svg.querySelectorAll("text")) {
        const txt = (t.textContent || "").trim();
        if (txt.length < 3) continue;
        const tb = box(t);
        if (tb.w < 4 || tb.h < 4) continue;
        if (overlaps(card.box, tb)) out.push({ figure: svg.getAttribute("data-figure") || svg.getAttribute("class") || "svg", text: txt.slice(0, 30), card: card.cls.split(" ")[0], tx: Math.round(tb.x), ty: Math.round(tb.y), cx: Math.round(card.box.x), cr: Math.round(card.box.r) });
      }
    }
  }
  return out;
})()`;

let total = 0;
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(200);
  const hits: any[] = await page.evaluate(probe);
  total += hits.length;
  console.log(t.key.padEnd(12), "figure-text-under-claim:", hits.length, hits.length ? JSON.stringify(hits.slice(0, 4)) : "");
}
console.log("\ntotal:", total);
await browser.close();
