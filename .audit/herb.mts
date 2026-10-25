import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const t = DESIGN_TEMPLATES.find((x) => x.key === "herbarium")!;
const { previewHtml } = designFromFeatures(t.brief) as any;
await page.setContent(previewHtml, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
await page.waitForTimeout(500);
const r: any = await page.evaluate(`(() => {
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const label = [...document.querySelectorAll(".ds-press-label, .ds-specimen-tag")].map(box);
  // SVG text nodes inside the specimen plate, with their boxes
  const svgTexts = [...document.querySelectorAll("svg.fig, svg[data-figure]")].flatMap(s =>
    [...s.querySelectorAll("text")].map(t => ({ s: s.getAttribute("data-figure"), t: (t.textContent||"").slice(0,26), ...box(t), fill: getComputedStyle(t).fill })));
  // Elements whose hit-test at their own centre is NOT themselves (something paints on top)
  const covered = [];
  for (const el of document.querySelectorAll("h1,.ds-lede,.ds-display,.ds-eyebrow,p")) {
    const b = box(el); if (b.w < 20 || b.h < 8) continue;
    const cx = b.x + b.w/2, cy = b.y + b.h/2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
    const top = document.elementFromPoint(cx, cy);
    if (top && !el.contains(top) && !top.contains(el)) covered.push({ el: el.className || el.tagName, text: (el.textContent||"").slice(0,30), top: top.className || top.tagName });
  }
  return { label, svgTexts: svgTexts.slice(0, 22), covered: covered.slice(0, 10) };
})()`);
console.log("label boxes:", JSON.stringify(r.label));
console.log("\nsvg texts:");
for (const s of r.svgTexts) console.log("  ", JSON.stringify(s));
console.log("\ncovered elements:");
for (const c of r.covered) console.log("  ", JSON.stringify(c));
await browser.close();
