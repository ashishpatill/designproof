/**
 * Shared footer: no template names pages no brief gave, and none claims every capability is live.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures } from "../orchestrate";
import { DESIGN_TEMPLATES } from "../templates";

const BANNED_LABELS = ["About", "Customers", "Careers", "Press", "Contact", "Security", "Availability", "Data handling", "Subprocessors", "Status", "Accessibility", "Privacy", "Terms"];
const CLAIM = "All capabilities listed on this page are available today";

function footerOf(html: string): string {
  const m = html.match(/<footer class="ds-footer" data-surface[\s\S]*?<\/footer>/);
  expect(m, "footer present").toBeTruthy();
  return m![0];
}

describe("shared footer only links sections on this page", () => {
  for (const t of DESIGN_TEMPLATES) {
    it(`${t.key}: no invented pages, no availability claim, every link resolves`, () => {
      const html = designFromFeatures(t.brief).previewHtml as string;
      expect(html).not.toContain(CLAIM);
      const footer = footerOf(html);
      for (const label of BANNED_LABELS) expect(footer).not.toMatch(new RegExp(`>\\s*${label}\\s*<`));
      for (const [, id] of footer.matchAll(/href="#([^"]+)"/g)) {
        expect(html, `#${id} target`).toMatch(new RegExp(`id="${id}"`));
      }
      if (t.siteKind !== "control-plane-oss") expect(footer).not.toContain("ds-footer-item");
    });
  }
});
