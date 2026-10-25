import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });

const probe = `(() => {
  const skip = new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE"]);
  const out = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      for (let p = n.parentElement; p; p = p.parentElement) if (skip.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let n;
  while ((n = walk.nextNode())) {
    const s = n.textContent || "";
    const re = /[a-z0-9][A-Z][a-z]/g; let m;
    while ((m = re.exec(s))) out.push(s.slice(Math.max(0, m.index - 14), m.index + 18).replace(/\\s+/g, " "));
  }
  // Also flag a missing space at a node boundary inside a text container.
  const glue = [];
  document.querySelectorAll("h1,h2,h3,p,li,button,span.ds-weft-ink").forEach((el) => {
    const t = (el.textContent || "").trim();
    const re = /[a-z0-9][A-Z][a-z]/g; let m;
    while ((m = re.exec(t))) glue.push(t.slice(Math.max(0, m.index - 14), m.index + 18));
  });
  return { text: out, glue };
})()`;

let total = 0;
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(120);
  const r: any = await page.evaluate(probe);
  const shown = r.text.filter((s: string) => !/querySelector|matchMedia|=>|function|\.ds-|addEventListener|JSON|window\./.test(s));
  total += shown.length;
  console.log(t.key.padEnd(12), "hits:" + String(shown.length).padStart(2), shown.slice(0, 3).join("  ///  "));
}
console.log("\ntotal real glued-word hits:", total);
await browser.close();
