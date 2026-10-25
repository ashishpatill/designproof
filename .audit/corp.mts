/** Where does the repeated corporate sentence come from, at runtime? */
import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const t = DESIGN_TEMPLATES.find((x) => x.key === "corporate")!;
await page.setContent(designFromFeatures(t.brief).previewHtml as never as { previewHtml: string }, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
await page.waitForTimeout(600);

const rows = (await page.evaluate(`(() => {
  const key = "a single system across product sales material and the contract you sign";
  const out = [];
  for (const el of document.querySelectorAll('p, h1, h2, h3, h4, li, dd, dt, span, blockquote, td, th, figcaption, caption')) {
    const text = (el.textContent || '').trim();
    if (!text || el.children.length !== 0 || text.length < 45) continue;
    const k = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\\s+/g, ' ');
    if (k !== key) continue;
    const bits = [];
    for (let n = el; n && n !== document.body && bits.length < 5; n = n.parentElement) {
      const cls = typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\\s+/).slice(0,2).join('.') : '';
      bits.unshift(n.tagName.toLowerCase() + cls);
    }
    out.push({ path: bits.join('>'), section: el.closest('[data-section]')?.dataset.section, text: text.slice(0,160), outer: el.outerHTML.slice(0,240) });
  }
  return out;
})()`)) as Array<{ path: string; section: string; text: string; outer: string }>;
for (const r of rows) console.log(`[${r.section}] ${r.path}\n     ${JSON.stringify(r.text)}\n     ${JSON.stringify(r.outer)}`);
await ctx.close();
await browser.close();
