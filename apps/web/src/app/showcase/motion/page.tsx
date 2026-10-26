import type { Metadata } from "next";
import Link from "next/link";
import { ProductShell } from "@/components/shell";
import { CreaseMotionBand } from "@/components/showcase/motion/CreaseMotionBand";
import "./motion-gallery.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Motion gallery — Crease seek loop · DesignProof",
  description:
    "Crease-first seekable motion specimen with window.__dpSeek and specimen.motion.json — DesignProof paper, ink, and terra.",
};

/**
 * P1c motion gallery — Crease loop first (README demo video is a follow-up).
 * Tokens: Instrument Serif / Source Sans 3 / IBM Plex Mono; #D4714A on #181614.
 */
export default function MotionGalleryPage() {
  return (
    <ProductShell active="showcase">
      <div className="mg-root" data-testid="motion-gallery-root">
        <div className="mg-grain" aria-hidden="true" />
        <div className="mg-shell">
          <header className="mg-hero">
            <p className="mg-kicker">Motion gallery · Crease-class peer bar</p>
            <h1 className="mg-display">Seek the crease</h1>
            <p className="mg-lede">
              DesignProof-native seek clock for specimen loops. Crease leads — hero enter, score
              spine, fold settle, CTA pulse — before the README demo video pass.
            </p>
            <div className="mg-hero-actions">
              <Link className="mg-cta-link" href="/crease" prefetch={false}>
                Open Crease
              </Link>
              <Link className="mg-ghost-link" href="/showcase" prefetch={false}>
                Back to specimens
              </Link>
            </div>
          </header>

          <CreaseMotionBand />

          <p className="mg-foot">
            Packs on deck: tell-motion-timeline · tell-physics-fold · tell-shader-band ·
            tell-audio-caption · tell-render-ship. Catalog stays eleven. README video follows.
          </p>
        </div>
      </div>
    </ProductShell>
  );
}
