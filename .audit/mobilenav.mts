import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const probe = `(() => {
  const links = [...document.querySelectorAll(".ds-nav-links a")];
  const visible = links.filter(a => a.getBoundingClientRect().width > 0 && getComputedStyle(a).display !== "none");
  const rail = document.querySelector(".ds-nav-links");
  return { total: links.length, visible: visible.length, railW: rail ? Math.round(rail.getBoundingClientRect().width) : 0,
    scrollW: rail ? Math.round(rail.scrollWidth) : 0, navH: Math.round(document.querySelector(".ds-nav").getBoundingClientRect().height) };
})()`;
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(150);
  const r: any = await page.evaluate(probe);
  console.log(t.key.padEnd(12), `links ${r.visible}/${r.total}`, `rail ${r.railW}/${r.scrollW}px`, `navH ${r.navH}px`, r.visible > 0 ? "OK" : "NO NAV");
}
await browser.close();
