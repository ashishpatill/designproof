import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const html = readFileSync("/tmp/tell-audit/out/saas.html", "utf8");
await page.setContent(html, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
const out = await page.evaluate(() => {
  const info: any = {};
  const cs = (el: Element, props: string[]) => {
    const c = getComputedStyle(el);
    const o: any = {};
    for (const p of props) o[p] = c.getPropertyValue(p);
    return o;
  };
  info.body = cs(document.body, ["background-color", "color", "font-family", "width", "margin"]);
  info.html = cs(document.documentElement, ["background-color"]);
  const main = document.querySelector("main");
  if (main) info.main = { rect: main.getBoundingClientRect().toJSON(), ...cs(main, ["background-color", "max-width", "margin", "width", "padding"]) };
  const hero = document.querySelector(".ds-hero");
  if (hero) info.hero = { rect: hero.getBoundingClientRect().toJSON(), ...cs(hero, ["background-color", "background-image", "min-height", "padding", "max-width", "margin", "width"]) };
  const nav = document.querySelector(".ds-nav");
  if (nav) info.nav = { rect: nav.getBoundingClientRect().toJSON(), ...cs(nav, ["background-color", "max-width", "width", "padding"]) };
  info.shells = [...document.querySelectorAll("body > *, main > *")].slice(0, 12).map((el) => ({
    tag: el.tagName, cls: (el.className || "").toString().slice(0, 80), rect: el.getBoundingClientRect().toJSON(),
    bg: getComputedStyle(el).backgroundColor, maxw: getComputedStyle(el).maxWidth, w: getComputedStyle(el).width, pad: getComputedStyle(el).paddingLeft,
  }));
  return info;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
