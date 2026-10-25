/** Measure the harness turn labels: how many lines does each one need? */
import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript({ content: "window.__name = (f) => f;" });
const t = DESIGN_TEMPLATES.find((x) => x.key === "harness")!;
await page.setContent(designFromFeatures(t.brief).previewHtml, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
const out = await page.evaluate(`(() => {
  return [...document.querySelectorAll('.ds-turn-label')].map((el) => {
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    return {
      text: (el.textContent || '').trim(),
      w: el.clientWidth, h: el.clientHeight,
      scrollH: el.scrollHeight, scrollW: el.scrollWidth,
      fontSize: cs.fontSize, lineHeight: cs.lineHeight,
      lines: Math.ceil(el.scrollHeight / lh),
      beatH: el.closest('.ds-turn-beat')?.clientHeight,
      beatW: el.closest('.ds-turn-beat')?.clientWidth,
    };
  });
})()`);
console.log(JSON.stringify(out, null, 1));
await browser.close();
