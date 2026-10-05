import { describe, expect, it } from "vitest";
import { templateHtmlSrc, templateOpenHref } from "./templateSrc";

describe("templateSrc", () => {
  it("maps crease to the live multipage template, not the design HTML API", () => {
    expect(templateHtmlSrc("crease")).toBe("/crease");
    expect(templateOpenHref("crease")).toBe("/crease");
  });

  it("maps baseline tennis template to the live multipage routes", () => {
    expect(templateHtmlSrc("baseline")).toBe("/baseline");
    expect(templateOpenHref("baseline")).toBe("/baseline");
  });

  it("keeps engine templates on the showcase HTML API", () => {
    expect(templateHtmlSrc("saas")).toBe("/api/design/html?showcase=saas");
    expect(templateOpenHref("saas")).toBe("/showcase/saas");
  });
});
