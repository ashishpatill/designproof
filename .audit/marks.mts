import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const probe = `(() => {
  const svgs = [...document.querySelectorAll("svg")];
  return svgs.map(s => { const r = s.getBoundingClientRect(); const c=(s.getAttribute("class")||"");
    return { cls: c.slice(0,44), df: s.getAttribute("data-figure"), w: Math.round(r.width), h: Math.round(r.height),
      hasImage: !!s.querySelector("image"), imgs: s.querySelectorAll("image").length,
      textChars: [...s.querySelectorAll("text")].map(t=>t.textContent).join("|").slice(0,60),
      prims: s.querySelectorAll("path,line,rect,circle,polyline,ellipse").length }; });
})()`;
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(120);
  const r: any[] = await page.evaluate(probe);
  const photo = r.filter(x => x.hasImage).reduce((a,x)=>a+x.imgs,0);
  const marks = r.filter(x => x.cls.includes("ds-fig-mark")).length;
  const same = new Set(r.map(x => x.w+"x"+x.h)).size;
  console.log(t.key.padEnd(12), "svgs:"+String(r.length).padStart(3), "photos-in-svg:"+String(photo).padStart(2),
    "distinctSizes:"+String(same).padStart(2), "prims:"+String(r.reduce((a,x)=>a+x.prims,0)).padStart(4),
    "textInSvg:"+String(r.reduce((a,x)=>a+x.textChars.length,0)).padStart(4),
    "|", r.map(x=>(x.df||x.cls.split(" ")[0]||"svg")+":"+x.w+"x"+x.h).join(" "));
}
await browser.close();
