import { ProductShell } from "@/components/shell";
import { CreaseMotionBand } from "@/components/showcase/motion/CreaseMotionBand";
import {
  CREASE_MOTION_PACK_CHIPS,
  creaseMotionSpecimen,
} from "@/components/showcase/motion/creaseMotionSpecimen";
import "./motion-gallery.css";

export const dynamic = "force-static";
export const metadata = {
  title: "DesignProof motion gallery — Crease loop",
  description:
    "A seekable Crease matchday motion loop — hero enter, score spine, fold settle, CTA pulse on an 8s transport. Reduced motion restacks the band as a static sheet.",
};

/** Pack chip names shown on the specimen sheet (names only). */
function PackChips() {
  return (
    <ul className="mg-band__packs" style={{ margin: 0 }} aria-label="DesignProof motion packs">
      {CREASE_MOTION_PACK_CHIPS.map((chip) => (
        <li key={chip} className="mono">{chip}</li>
      ))}
    </ul>
  );
}

/**
 * Motion gallery — DesignProof-native peer-gallery page for seekable
 * motion specimens. Composes the Crease band and a data-driven specimen
 * sheet; the band is fully client-side, the sheet is server-rendered.
 */
export default function MotionGalleryPage() {
  const s = creaseMotionSpecimen;

  return (
    <ProductShell active="showcase">
      <div className="mg-root" data-testid="motion-gallery-root">
        <div className="mg-grain" aria-hidden="true" />
        <div className="mg-wrap">
          <header className="mg-head">
            <p className="mg-kicker">Peer gallery · motion specimens</p>
            <h1>Motion gallery</h1>
            <p className="mg-lede">
              Crease-class motion, composed for proof — a stylized matchday loop you can scrub
              beat by beat. It plays on transform and opacity only; reduced motion restacks the
              band into a static sheet instead of blanking it.
            </p>
          </header>

          <CreaseMotionBand />

          <section className="mg-sheet" aria-labelledby="mg-sheet-title">
            <div className="mg-sheet__head">
              <p className="mg-kicker">Specimen sheet</p>
              <h2 id="mg-sheet-title">Crease motion spec</h2>
              <p>
                One motion loop, four beats, one seek handle. The transport registers{" "}
                <code>specimen.seekRegistry</code> on mount, clamps every seek into 0..1, and
                unregisters itself on the way out.
              </p>
              <PackChips />
            </div>
            <table className="mg-table">
              <caption>Motion specimen v{s.version} — {s.conceptId}</caption>
              <tbody>
                <tr>
                  <th scope="row">Beats</th>
                  <td>
                    {s.beats.map((b) => (
                      <span key={b.id} className="mg-table__beat">
                        <span className="mg-dot" aria-hidden="true" />
                        <span className="mono">{b.id}</span> — {b.label} ({b.t0}–{b.t1})
                      </span>
                    ))}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Site kind</th>
                  <td className="mono">{s.siteKind}</td>
                </tr>
                <tr>
                  <th scope="row">Seek registry</th>
                  <td className="mono">window.{s.seekRegistry}(t) · t clamped to 0..1</td>
                </tr>
                <tr>
                  <th scope="row">Loop duration</th>
                  <td className="mono">{s.durationMs} ms</td>
                </tr>
                <tr>
                  <th scope="row">Reduced motion</th>
                  <td className="mono">{s.reducedMotion}</td>
                </tr>
                <tr>
                  <th scope="row">Band layers</th>
                  <td>masthead · pavilion skyline · hero · score spine · fold sheet · CTA · chalk crease</td>
                </tr>
              </tbody>
            </table>
          </section>

          <footer className="mg-foot">
            Play starts the rAF loop mapped into seek(t); pause cancels it. Scrubbing seeks
            directly, including while the loop runs. Beats open the loop at their own t0.
          </footer>
        </div>
      </div>
    </ProductShell>
  );
}
