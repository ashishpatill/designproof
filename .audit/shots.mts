import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";

const outDir = "/tmp/tell-audit/shots";
const htmlDir = "/tmp/tell-audit/out";
mkdirSync(outDir, { recursive: true });

const files = readdirSync(htmlDir).filter((f) => f.endsWith(".html"));
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

const report: any[] = [];
for (const f of files) {
  const key = f.replace(".html", "");
  const html = readFileSync(`${htmlDir}/${f}`, "utf8");
  await page.setContent(html, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${key}.png`, fullPage: false });
  await page.screenshot({ path: `${outDir}/${key}-full.png`, fullPage: true });
  const stats = await page.evaluate(() => {
    const q = (s: string) => document.querySelectorAll(s).length;
    const secs = [...document.querySelectorAll("section")];
    const shapes = secs.map((s) => (s.className || "").toString().split(/\s+/).filter(Boolean).sort().join("."));
    return {
      sections: secs.length,
      distinctSectionClasses: new Set(shapes).size,
      headings: q("h1,h2,h3,h4"),
      images: q("img"),
      svgs: q("svg"),
      ctas: q("a[class*=cta], .ds-cta, button"),
      tables: q("table"),
      divs: q("div"),
      cssBytes: [...document.querySelectorAll("style")].map((s) => s.textContent?.length ?? 0).reduce((a, b) => a + b, 0),
      textChars: (document.body.innerText || "").length,
      height: document.documentElement.scrollHeight,
    };
  });
  report.push({ key, ...stats });
  console.log(key.padEnd(12), JSON.stringify(stats));
}
writeFileSync("/tmp/tell-audit/stats.json", JSON.stringify(report, null, 2));
await browser.close();
