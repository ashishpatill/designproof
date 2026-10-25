import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const probe = `(() => {
  const imgs = [...document.querySelectorAll("image")].map(i => ({ href: (i.getAttribute("href")||"").slice(0,60), w: Math.round((i.getBoundingClientRect().width)), h: Math.round((i.getBoundingClientRect().height)) }));
  return { count: imgs.length, distinctHrefs: new Set(imgs.map(i=>i.href)).size, sizes: imgs.map(i=>i.w+"x"+i.h).join(" "), inSvg: [...document.querySelectorAll("svg")].filter(s=>s.querySelector("image")).map(s=>s.getAttribute("data-figure")||s.getAttribute("class")||"svg") };
})()`;
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(120);
  const r: any = await page.evaluate(probe);
  console.log(t.key.padEnd(12), "images:"+String(r.count).padStart(2), "distinct:"+String(r.distinctHrefs).padStart(2), "| in:", r.inSvg.join(","), "|", r.sizes.slice(0,80));
}
await browser.close();
