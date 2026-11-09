import Link from "next/link";

/**
 * The monetization story in plain words, rendered below the plan ladder.
 * Facts come only from the locked plan config. Paid tiers stay qualitative,
 * because their numeric caps wait for the plan of record.
 */

const ROWS: { label: string; free: string; maker: string; studio: string }[] = [
  {
    label: "Price",
    free: "$0, always",
    maker: "$7 a month or $69 a year",
    studio: "$15 a month or $129 a year",
  },
  {
    label: "Hosted generations",
    free: "10 flash generations a day, one at a time",
    maker: "A higher daily pool than Free",
    studio: "The highest daily caps we offer",
  },
  {
    label: "Models behind the engine",
    free: "Fast open models, good for a daily check",
    maker: "Stronger mid-range open models",
    studio: "The best open models we can afford to run",
  },
  {
    label: "Speed",
    free: "Standard queue",
    maker: "Faster loops",
    studio: "Priority runs",
  },
  {
    label: "Agent tools",
    free: "The hosted studio in your browser",
    maker: "Deeper access for your coding agent",
    studio: "Full access for your coding agent",
  },
  {
    label: "Best for",
    free: "Trying the engine on your real pages",
    maker: "One person shipping product every week",
    studio: "People who run proofs all day",
  },
];

const STRATEGY_FAQS = [
  {
    q: "Why is the free plan capped at all?",
    a: "Every hosted generation costs real money to run, because a browser has to load the page and models have to read it. A daily cap keeps the free plan honest and sustainable. The cap resets at midnight UTC, and it is high enough to proof the pages that matter most, every day.",
  },
  {
    q: "What am I actually paying for on Maker and Studio?",
    a: "Three things. Stronger models doing the design work, so directions and repairs are better. More generations each day, so the engine can cover a whole site instead of a few pages. And speed, because paid runs move ahead in the queue. You are never paying to unlock the detectors or the proof loop. Those are the product, and they are in every plan.",
  },
  {
    q: "Why does yearly billing cost less?",
    a: "A year of commitment lets us plan capacity and buy compute ahead at better rates. The saving is passed on. Maker yearly saves $15 against paying monthly, and Studio yearly saves $51.",
  },
  {
    q: "Can I just run the plugin for free?",
    a: "Yes. The plugin path runs the engine on your own machine inside your coding agent, and it stays documented and open. The hosted plans exist for people who would rather have the engine ready in a browser, with the models and the queue handled for them.",
  },
  {
    q: "What happens when I hit my daily cap?",
    a: "The run waits until the reset, and the site tells you plainly. There are no credit buckets, no surprise charges and no silent downgrade of the work. Caps are hard on purpose, so a bill can never surprise you.",
  },
];

export function Strategy() {
  return (
    <div className="pr-strategy">
      <section aria-labelledby="pr-how-title">
        <h2 id="pr-how-title" className="pr-h2">
          How the plans work
        </h2>
        <div className="pr-cols">
          <div>
            <h3 className="pr-h3">What a generation is</h3>
            <p className="pr-p">
              One generation is one full pass of the engine. Your page is
              captured, the detectors read it, a direction is chosen and a
              repair is drafted. When you ask for another pass, that is
              another generation.
            </p>
          </div>
          <div>
            <h3 className="pr-h3">What the cap means</h3>
            <p className="pr-p">
              A cap is simply the number of generations your plan can run in
              a day. Free runs ten, one at a time. It is a plain limit, not a
              credit balance that quietly drains, and it resets at midnight
              UTC.
            </p>
          </div>
          <div>
            <h3 className="pr-h3">What paid plans change</h3>
            <p className="pr-p">
              Paid plans do not unlock extra features of the proof loop. They
              raise the quality and the volume. Better models write the
              direction and the repair, the daily pool grows, and your runs
              move faster.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="pr-compare-title">
        <h2 id="pr-compare-title" className="pr-h2">
          The plans side by side
        </h2>
        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th scope="col"> </th>
                <th scope="col">Free</th>
                <th scope="col">Maker</th>
                <th scope="col">Studio</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td>{r.free}</td>
                  <td>{r.maker}</td>
                  <td>{r.studio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="pr-why-title">
        <h2 id="pr-why-title" className="pr-h2">
          Why the prices are set this way
        </h2>
        <div className="pr-cols pr-cols--two">
          <div>
            <h3 className="pr-h3">Free has to prove the product</h3>
            <p className="pr-p">
              Nobody pays for a design opinion they have not seen work. So
              the free plan runs the real engine on real pages, every day,
              with the full detector set. When a free user hits the daily cap
              in the middle of fixing a site that matters to them, the value
              of paying is already proven.
            </p>
            <h3 className="pr-h3">Maker is priced for one person</h3>
            <p className="pr-p">
              Maker costs about as much as a coffee each month. That is a
              deliberate choice. The person who ships a product every week
              should be able to say yes without a budget meeting, and the
              price still covers the stronger models it runs on, with room
              to spare.
            </p>
          </div>
          <div>
            <h3 className="pr-h3">Studio is priced for all-day use</h3>
            <p className="pr-p">
              Studio is for people who proof pages the way other people run
              tests, constantly and across whole sites. Priority runs and
              the highest caps cost more to serve, so Studio costs more,
              while staying well under the price of one hour of a freelance
              designer.
            </p>
            <h3 className="pr-h3">The model stays profitable</h3>
            <p className="pr-p">
              The engine runs on open models with known costs, and every
              plan has a hard daily cap. That pairing is the whole business
              model. Revenue per user is fixed by the plan, and the most a
              user can cost us in a day is fixed by the cap, so the margin
              never depends on hoping people use the product less.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="pr-path-title">
        <h2 id="pr-path-title" className="pr-h2">
          The path from free to paid
        </h2>
        <ol className="pr-path">
          <li>
            <strong>Start free in the studio.</strong> Proof the page you are
            least proud of and read a report with named evidence.
          </li>
          <li>
            <strong>Install the plugin.</strong> Bring the same tools into
            Cursor or Codex and proof pages as you build them.
          </li>
          <li>
            <strong>Hit the cap on a day that matters.</strong> That is the
            honest moment to upgrade, and Maker is priced to make it an easy
            yes.
          </li>
          <li>
            <strong>Move to Studio when proofs run all day.</strong>{" "}
            Priority runs and the highest caps keep up with a full site.
          </li>
        </ol>
        <p className="pr-p">
          Ready when you are.{" "}
          <Link className="pr-link" href="/studio">
            Open the studio
          </Link>{" "}
          and run your first proof free.
        </p>
      </section>

      <section aria-labelledby="pr-faq-title">
        <h2 id="pr-faq-title" className="pr-h2">
          Money questions, answered plainly
        </h2>
        <div className="pr-faq">
          {STRATEGY_FAQS.map((f) => (
            <div className="pr-faq__item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
