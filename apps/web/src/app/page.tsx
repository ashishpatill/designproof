import type { Metadata } from "next";
import Link from "next/link";
import "./landing.css";

export const metadata: Metadata = {
  title: "Design Proof — Every AI-built page has a tell",
  description:
    "Design Proof captures your page, names what makes it look generic, directs a better design, applies the fix in your code, and proves the result. Free to start.",
};

const STEPS = [
  {
    num: "01",
    name: "Observe",
    body: "The engine opens your page in a real browser and captures it the way a visitor sees it. Nothing is guessed from a screenshot someone pasted into a chat.",
  },
  {
    num: "02",
    name: "Name",
    body: "Fourteen detectors check the capture and name each generic pattern they find. Every finding points at the exact element and the evidence behind it.",
  },
  {
    num: "03",
    name: "Direct",
    body: "An art direction is chosen for your product, its audience and its story. The direction is a real design stance, not a fresh coat of the same template.",
  },
  {
    num: "04",
    name: "Repair",
    body: "Fixes are written as patches against your own source code and ranked by how much they matter. The changes that carry the design land first.",
  },
  {
    num: "05",
    name: "Prove",
    body: "The page is captured again and the detectors run a second time. A fix only counts when the new capture shows the tell is gone.",
  },
  {
    num: "06",
    name: "Author",
    body: "The verified result becomes the new baseline for your project. The next run compares against it, so the design keeps improving instead of drifting.",
  },
];

const DETECTORS = [
  "Gradient crutch",
  "Centered everything",
  "Emoji chrome",
  "Shadow everywhere",
  "One radius on everything",
  "Gray mush type",
  "System font default",
  "Boilerplate copy",
  "Acid accent",
  "Blank stretches",
  "Title lost on the fold",
  "Frame gutters",
  "Weak first phone screen",
  "Stock layout rhythm",
];

const FAQS = [
  {
    q: "What is a tell?",
    a: "A tell is a small pattern that gives away how a page was made. A purple gradient hero, three identical cards, emoji used as bullet points. Each one is harmless alone. Together they make a page feel generic, and visitors read that feeling as low effort. Design Proof names these patterns so they can be fixed on purpose.",
  },
  {
    q: "How is this different from a design generator?",
    a: "Generators make a new page from a prompt and hope it looks good. Design Proof works on the page you already have. It captures the real thing, shows evidence for every problem it finds, repairs your actual source code, and then captures the page again to prove the repair worked.",
  },
  {
    q: "Where does Design Proof run?",
    a: "Two ways. The plugin runs inside your coding agent, in Cursor today and in Codex, and works on your local project. The hosted studio on this site runs the same engine in the browser, which is the fastest way to try it. The plans page explains what each path includes.",
  },
  {
    q: "Do I need to pay to try it?",
    a: "No. The free plan runs real proofs every day with honest caps, and the plugin path is documented for anyone who wants to run the engine on their own machine. Paid plans buy better models, faster loops and higher daily caps on the hosted engine.",
  },
  {
    q: "What does a proof run give me?",
    a: "A report that names every tell found, the evidence for each one, a chosen direction for the redesign, and patches ranked by importance. After the patches are applied, a second capture verifies the result and records it as your new baseline.",
  },
];

export default function HomePage() {
  return (
    <div className="ld">
      <header className="ld-nav">
        <div className="ld-wrap ld-nav__row">
          <Link className="ld-logo" href="/">
            Design <em>Proof</em>
          </Link>
          <nav className="ld-nav__links" aria-label="Main">
            <Link href="#loop">How it works</Link>
            <Link href="#engine">The engine</Link>
            <Link href="#install">Install</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <Link className="ld-btn ld-btn--primary ld-btn--small" href="/studio">
            Start free
          </Link>
        </div>
      </header>

      <main>
        <section className="ld-hero">
          <div className="ld-wrap">
            <p className="ld-eyebrow">Design review for AI-built interfaces</p>
            <h1 className="ld-hero__title">
              Every AI-built page has a <em>tell.</em> We find it and fix it.
            </h1>
            <p className="ld-hero__sub">
              Design Proof captures your live page, names the patterns that make
              it look generic, directs a design that fits your product, repairs
              your source code, and then captures the page again to prove the
              fix is real.
            </p>
            <div className="ld-hero__ctas">
              <Link className="ld-btn ld-btn--primary" href="/studio">
                Run a free proof
              </Link>
              <Link className="ld-btn ld-btn--ghost" href="#install">
                Install the plugin
              </Link>
            </div>
            <p className="ld-hero__note">
              Free plan included. No card needed. Works in Cursor and Codex.
            </p>
          </div>
        </section>

        <div className="ld-wrap">
          <div className="ld-stats">
            <div className="ld-stat">
              <p className="ld-stat__num">14</p>
              <p className="ld-stat__label">
                detectors that name generic patterns with evidence
              </p>
            </div>
            <div className="ld-stat">
              <p className="ld-stat__num">11</p>
              <p className="ld-stat__label">
                tools your coding agent calls directly inside your project
              </p>
            </div>
            <div className="ld-stat">
              <p className="ld-stat__num">17</p>
              <p className="ld-stat__label">
                offerings across capture, direction, repair and reporting
              </p>
            </div>
            <div className="ld-stat">
              <p className="ld-stat__num">6</p>
              <p className="ld-stat__label">
                steps in every proof run, ending with a verified new baseline
              </p>
            </div>
          </div>
        </div>

        <section className="ld-section">
          <div className="ld-wrap">
            <p className="ld-kicker">Before and after</p>
            <h2 className="ld-h2">The same page, before the proof and after it</h2>
            <p className="ld-lede">
              This example is a small fictional bakery site we made up for this
              page. The left side is the kind of page an agent produces on the
              first try. The right side is the same content after one proof run.
            </p>

            <div className="ld-ba">
              <div>
                <p className="ld-ba__tag">
                  <span>Before</span>
                  <strong>7 tells found</strong>
                </p>
                <div className="ld-shot">
                  <div className="ld-shot__bar">
                    <span className="ld-shot__dot" />
                    <span className="ld-shot__dot" />
                    <span className="ld-shot__dot" />
                    <span className="ld-shot__url">crumbandcraft.example</span>
                  </div>
                  <div className="ld-before">
                    <span className="ld-before__pill">Fresh bread, powered by AI</span>
                    <div className="ld-before__hero">
                      <h3>Bake happiness faster</h3>
                      <p>Everything your bakery needs in one place.</p>
                    </div>
                    <div className="ld-before__cards">
                      <div className="ld-before__card">
                        <h4>Order</h4>
                        <p>Beautiful ordering without the setup.</p>
                      </div>
                      <div className="ld-before__card">
                        <h4>Track</h4>
                        <p>Beautiful tracking without the setup.</p>
                      </div>
                      <div className="ld-before__card">
                        <h4>Grow</h4>
                        <p>Beautiful growth without the setup.</p>
                      </div>
                    </div>
                    <p className="ld-before__foot">Made with AI. Looks familiar.</p>
                  </div>
                </div>
                <ul className="ld-findings">
                  <li>
                    <code>GradientCrutch</code>
                    The hero leans on a purple gradient instead of a design idea.
                  </li>
                  <li>
                    <code>BoilerplateCopy</code>
                    Three cards repeat one sentence with a single word swapped.
                  </li>
                  <li>
                    <code>CenteredEverything</code>
                    Every block is centered, so nothing has a starting point.
                  </li>
                  <li>
                    <code>ShadowEverywhere</code>
                    Heavy shadows sit on every surface and flatten the depth.
                  </li>
                </ul>
              </div>

              <div>
                <p className="ld-ba__tag">
                  <span>After one proof run</span>
                  <strong>0 tells remain</strong>
                </p>
                <div className="ld-shot">
                  <div className="ld-shot__bar">
                    <span className="ld-shot__dot" />
                    <span className="ld-shot__dot" />
                    <span className="ld-shot__dot" />
                    <span className="ld-shot__url">crumbandcraft.example</span>
                  </div>
                  <div className="ld-after">
                    <p className="ld-after__brand">
                      Crumb <span>&amp;</span> Craft
                    </p>
                    <h3>Sourdough at seven, still warm at yours by eight.</h3>
                    <p className="ld-after__sub">
                      A neighborhood bakery that bakes in small batches and
                      delivers on foot within two streets.
                    </p>
                    <span className="ld-after__cta">See today&apos;s bake</span>
                    <div className="ld-after__row">
                      <div>
                        <h4>Baked at dawn</h4>
                        <p>
                          Two batches a day. When the second one sells out, the
                          day is done.
                        </p>
                      </div>
                      <div>
                        <h4>Regulars first</h4>
                        <p>
                          Standing orders are held before the counter opens to
                          walk-ins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ld-verdict">
                  <strong>Proof verdict</strong>
                  The page was captured again after the patches landed. All
                  seven tells are gone from the new capture, and this version
                  is now the baseline the next run will be measured against.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ld-section" id="loop" style={{ paddingTop: 0 }}>
          <div className="ld-wrap">
            <p className="ld-kicker">The proof loop</p>
            <h2 className="ld-h2">Six steps, and the last one checks the work</h2>
            <p className="ld-lede">
              Most design tools stop at advice. A proof run keeps going until
              the repaired page has been captured and checked again.
            </p>
            <div className="ld-steps">
              {STEPS.map((s) => (
                <article className="ld-step" key={s.num}>
                  <span className="ld-step__num">{s.num}</span>
                  <h3>{s.name}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ld-section ld-section--paper" id="engine">
          <div className="ld-wrap">
            <p className="ld-kicker">The engine</p>
            <h2 className="ld-h2">Built to show its evidence, not just its taste</h2>
            <p className="ld-lede">
              Anyone can say a page looks generic. The engine has to prove it,
              element by element, and then prove the repair.
            </p>
            <div className="ld-engine">
              <div className="ld-engine__item">
                <span className="ld-engine__num">Capture</span>
                <h3>It looks at the real page</h3>
                <p>
                  The engine loads your page in a real browser and studies the
                  rendered result. Layout, type, color and spacing are measured
                  as a visitor experiences them, on desktop and on a phone
                  screen.
                </p>
              </div>
              <div className="ld-engine__item">
                <span className="ld-engine__num">Detectors</span>
                <h3>Fourteen checks, each with a name</h3>
                <p>
                  Every detector hunts one known pattern of generic design and
                  reports where it found it. Findings are plain and specific,
                  so you can argue with them, accept them, or fix them.
                </p>
              </div>
              <div className="ld-engine__item">
                <span className="ld-engine__num">Direction</span>
                <h3>A stance, not a template</h3>
                <p>
                  The engine studies what your product is and who it serves,
                  then commits to an art direction with a point of view. Your
                  brand material guides it when you provide some.
                </p>
              </div>
              <div className="ld-engine__item">
                <span className="ld-engine__num">Repair</span>
                <h3>Patches ranked by importance</h3>
                <p>
                  Repairs are written against your source files and ordered by
                  the difference they make. Apply them in your agent, in the
                  hosted studio, or by hand. Nothing is changed behind your
                  back.
                </p>
              </div>
            </div>
            <div className="ld-chips" aria-label="Detector names">
              {DETECTORS.map((d) => (
                <span className="ld-chip" key={d}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="ld-section" id="install">
          <div className="ld-wrap">
            <p className="ld-kicker">Install</p>
            <h2 className="ld-h2">Run it where your agent already works</h2>
            <p className="ld-lede">
              The plugin gives your coding agent all eleven Design Proof tools.
              Your agent captures the page, reads the findings and applies the
              ranked patches without leaving your project.
            </p>
            <div className="ld-install">
              <article className="ld-install__card">
                <h3>Cursor</h3>
                <p>
                  Built for Cursor first, including Grok-powered agent setups.
                  Install the plugin, open your project, and ask your agent to
                  run a proof on any page.
                </p>
                <ol>
                  <li>Add the Design Proof plugin in Cursor settings.</li>
                  <li>Open the project you want reviewed.</li>
                  <li>Ask the agent to proof a page and read the report.</li>
                </ol>
                <p className="ld-code">designproof plugin for Cursor</p>
                <Link className="ld-btn ld-btn--ghost ld-btn--small" href="/studio">
                  Or try the hosted studio
                </Link>
              </article>
              <article className="ld-install__card">
                <h3>Codex and ChatGPT</h3>
                <p>
                  The same plugin package works in Codex, so the tools are
                  available in the ChatGPT coding agent as well. One install
                  covers both places.
                </p>
                <ol>
                  <li>Add the Design Proof plugin in Codex.</li>
                  <li>Open your repository in a Codex session.</li>
                  <li>Ask for a proof run and apply the ranked patches.</li>
                </ol>
                <p className="ld-code">designproof plugin for Codex</p>
                <Link className="ld-btn ld-btn--ghost ld-btn--small" href="/pricing">
                  See what each plan includes
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="ld-section" style={{ paddingTop: 0 }}>
          <div className="ld-wrap">
            <p className="ld-kicker">Pricing</p>
            <h2 className="ld-h2">Free proves the point. Paid plans raise the ceiling.</h2>
            <p className="ld-lede">
              The free plan runs real proofs every day. Paid plans buy better
              models, faster loops and higher daily caps on the hosted engine.
              The plugin path stays open either way.
            </p>
            <div className="ld-plans">
              <article className="ld-plan">
                <p className="ld-plan__name">Free</p>
                <p className="ld-plan__price">
                  $0 <span>always</span>
                </p>
                <p className="ld-plan__blurb">
                  10 flash generations a day, one at a time, on the design
                  engine and its skills. Enough to proof your most important
                  pages every single day.
                </p>
                <Link className="ld-btn ld-btn--ghost ld-btn--small" href="/studio">
                  Start free
                </Link>
              </article>
              <article className="ld-plan">
                <p className="ld-plan__name">Maker</p>
                <p className="ld-plan__price">
                  $7 <span>per month</span>
                </p>
                <p className="ld-plan__blurb">
                  Stronger models, faster loops, a higher daily pool and deeper
                  agent access. For one person shipping real product every
                  week. Yearly billing is $69.
                </p>
                <Link className="ld-btn ld-btn--ghost ld-btn--small" href="/pricing">
                  Continue with Maker
                </Link>
              </article>
              <article className="ld-plan ld-plan--featured">
                <p className="ld-plan__name">Studio</p>
                <p className="ld-plan__price">
                  $15 <span>per month</span>
                </p>
                <p className="ld-plan__blurb">
                  The best models we can offer, priority runs, full agent
                  access and the highest caps. For people who run the engine
                  all day. Yearly billing is $129.
                </p>
                <Link className="ld-btn ld-btn--primary ld-btn--small" href="/pricing">
                  Continue with Studio
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="ld-section" style={{ paddingTop: 0 }}>
          <div className="ld-wrap">
            <p className="ld-kicker">Questions</p>
            <h2 className="ld-h2">Asked often, answered plainly</h2>
            <div className="ld-faq">
              {FAQS.map((f) => (
                <div className="ld-faq__item" key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ld-final">
          <div className="ld-wrap">
            <h2>Your next page does not have to look generated.</h2>
            <p>
              Run a proof on the page you are least proud of. The report is
              free, the evidence is specific, and the fix is verified.
            </p>
            <div className="ld-hero__ctas">
              <Link className="ld-btn ld-btn--primary" href="/studio">
                Run a free proof
              </Link>
              <Link className="ld-btn ld-btn--ghost" href="/pricing">
                Compare plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="ld-wrap ld-footer">
          <span>Design Proof. Every AI-built page has a tell.</span>
          <nav aria-label="Footer">
            <Link href="/pricing">Pricing</Link>
            <Link href="/studio">Studio</Link>
            <Link href="/create">Create</Link>
            <Link href="https://github.com/ashishpatill/designproof">GitHub</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
