import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
import { AUDIT_PROBE } from "../scripts/design-research/layout-audit";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });

let worst: any[] = [];
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(250);
  const res: any = await page.evaluate(AUDIT_PROBE);
  const counts = Object.fromEntries(Object.entries(res).map(([k, v]: any) => [k, Array.isArray(v) ? v.length : v]));
  console.log(t.key.padEnd(12), JSON.stringify(counts));
  worst.push({ key: t.key, ...res });
}
console.log("\n=== details (non-empty only) ===");
for (const w of worst) {
  for (const [k, v] of Object.entries(w)) {
    if (k === "key" || !Array.isArray(v) || !v.length) continue;
    console.log(`\n[${w.key}] ${k} (${v.length}):`);
    for (const item of v.slice(0, 6)) console.log("   ", JSON.stringify(item).slice(0, 220));
  }
}
await browser.close();
