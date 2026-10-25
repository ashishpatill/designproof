import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });

const probeBody = `(() => {
  const names = window.__names || [];
  const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const out = [];
  for (const s of document.querySelectorAll("[data-section]")) {
    const hay = norm(
      s.innerText + " " +
      [...s.querySelectorAll("text,title")].map((e) => e.textContent).join(" ") + " " +
      [...s.querySelectorAll("*")].map((e) => (e.getAttribute("aria-label") || "") + " " + (e.getAttribute("data-rail-label") || "") + " " + (e.getAttribute("data-view") || "")).join(" ")
    );
    for (const n of names) {
      const key = norm(n);
      if (!key) continue;
      let count = 0, i = 0;
      while ((i = hay.indexOf(key, i)) !== -1) { count++; i += key.length; }
      if (count > 0) out.push({ section: s.dataset.section, name: n, count });
    }
  }
  return out;
})()`;

let worst = 0;
for (const t of DESIGN_TEMPLATES) {
  const names = t.brief.features.map((f) => f.name);
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
  await page.waitForTimeout(200);
  const rows: any[] = await page.evaluate(probeBody);
  const over = rows.filter((r) => r.count > 2);
  const max = rows.reduce((a, r) => Math.max(a, r.count), 0);
  worst = Math.max(worst, max);
  console.log(t.key.padEnd(12), "over-2:", String(over.length).padStart(2), "max:", max);
  for (const r of over.slice(0, 5)) console.log("      ", String(r.section).padEnd(12), r.count + "×", r.name);
}
console.log("\nworst count anywhere:", worst);
await browser.close();
