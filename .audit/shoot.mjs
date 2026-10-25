import { chromium } from "playwright";
const base = process.env.BASE || "http://localhost:3000";
const routes = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
for (const r of routes) {
  const [path, w, h, name] = r.split("|");
  const page = await browser.newPage({ viewport: { width: Number(w)||1440, height: Number(h)||900 }, deviceScaleFactor: 1 });
  try {
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
  } catch { try { await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 60000 }); } catch {} }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `.audit/shots/${name || path.replace(/\W+/g,"_") || "home"}.png`, fullPage: true });
  console.log("shot", path, "->", name);
  await page.close();
}
await browser.close();
