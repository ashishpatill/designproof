import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript({ content: "window.__name = (f) => f;" });
const t = DESIGN_TEMPLATES.find((x) => x.key === "loom")!;
await page.setContent(designFromFeatures(t.brief).previewHtml, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
const out = await page.evaluate(`(() => {
  const fig = document.querySelector('figure.ds-loom-plate');
  const texts = [...fig.querySelectorAll('svg text')].filter(t => (t.textContent||'').includes('Size treadles'));
  return { svgs: fig.querySelectorAll('svg').length, images: fig.querySelectorAll('image').length, hits: texts.map(t => t.outerHTML) };
})()`);
console.log(JSON.stringify(out, null, 1).slice(0, 1500));
await browser.close();
