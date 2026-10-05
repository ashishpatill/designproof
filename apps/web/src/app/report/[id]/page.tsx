"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DesignProofReport } from "@designproof/schema";
import { ConfidenceMeter, VerdictBadge } from "@/components/report";

/** Read-only handoff view — the same report a teammate can open without an account. */
export default function SharedReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<DesignProofReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load report.");
        setReport(data.report);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [params.id]);

  if (error) {
    return (
      <main className="dp-report">
        <header className="dp-report__head">
          <p className="dp-eyebrow">Shared report</p>
          <h1 className="dp-report__title">This link is not available</h1>
        </header>
        <div className="dp-empty">
          <div>
            <p className="text-drift">{error}</p>
            <p className="mt-2">
              Share links persist when a database or blob store is configured on the host that created them.
            </p>
            <Link className="dp-btn dp-btn--quiet mt-4" href="/">
              Back to Design Proof
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="dp-report">
        <header className="dp-report__head">
          <p className="dp-eyebrow">Shared report</p>
          <h1 className="dp-report__title">Loading the review…</h1>
        </header>
        <div className="dp-skeleton" style={{ minHeight: "40vh" }} aria-busy="true" />
      </main>
    );
  }

  return (
    <main className="dp-report">
      <header className="dp-report__head">
        <p className="dp-eyebrow">Shared Design Proof report</p>
        <h1 className="dp-report__title">{report.capture.url}</h1>
        <div className="dp-report__head-actions">
          <Link className="dp-btn dp-btn--primary" href="/">
            Open in Design Proof
          </Link>
          <span className="dp-badge">read-only handoff</span>
        </div>
      </header>

      <section className="dp-report__stats" aria-label="Score summary">
        {[
          { label: "Findings", value: report.score.total },
          { label: "Generic", value: report.score.generic, tone: "drift" },
          { label: "Drift", value: report.score.drift, tone: "accent" },
          { label: "Intentional", value: report.score.intentional, tone: "ok" },
        ].map((stat) => (
          <div key={stat.label} className="dp-stat" data-tone={stat.tone ?? "plain"}>
            <span className="dp-stat__value">{stat.value}</span>
            <span className="dp-stat__label">{stat.label}</span>
          </div>
        ))}
      </section>

      {report.capture.screenshotBase64 ? (
        <figure className="dp-report__shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`Captured surface for ${report.capture.url}`}
            src={`data:image/png;base64,${report.capture.screenshotBase64}`}
          />
          <figcaption className="dp-report__shot-caption">
            Rendered capture · {report.capture.viewport?.width ?? 1440}×{report.capture.viewport?.height ?? 900}
          </figcaption>
        </figure>
      ) : null}

      <section className="dp-report__findings" aria-label="Findings">
        {report.findings.map((finding) => {
          const verdict = report.verdicts.find((v) => v.findingId === finding.id);
          return (
            <article key={finding.id} className="dp-finding-card">
              <div className="dp-finding-card__head">
                <h2 className="dp-finding-card__title">{finding.detector}</h2>
                <VerdictBadge verdict={verdict?.verdict ?? finding.verdictHint} />
              </div>
              {typeof verdict?.confidence === "number" ? (
                <ConfidenceMeter value={verdict.confidence} />
              ) : null}
              {verdict?.rationale ? (
                <p className="dp-finding-card__rationale">{verdict.rationale}</p>
              ) : null}
              {finding.evidence.length ? (
                <ul className="dp-evidence">
                  {finding.evidence.map((ev) => (
                    <li key={`${ev.label}-${ev.value}`}>
                      <span className="dp-evidence__label">{ev.label}</span>
                      <span>{ev.value}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </section>

      {report.capture.stateShots.length > 0 ? (
        <section className="dp-report__probes" aria-label="State probes">
          <h2 className="dp-panel__title">State probes</h2>
          {report.capture.stateShots.some((shot) => shot.imageBase64) ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {report.capture.stateShots
                .filter((shot) => shot.imageBase64)
                .map((shot) => (
                  <figure
                    key={`${shot.selector}-${shot.state}`}
                    className="rounded-md border border-border bg-bg p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={`${shot.selector} ${shot.state}`}
                      src={`data:image/png;base64,${shot.imageBase64}`}
                      className="h-16 w-auto max-w-[140px] object-contain"
                    />
                    <figcaption className="mt-1 font-mono text-meta text-muted">{shot.state}</figcaption>
                  </figure>
                ))}
            </div>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {report.capture.stateShots.map((shot) => (
                <li
                  key={`${shot.selector}-${shot.state}`}
                  className="rounded-full border border-border px-3 py-1 font-mono text-meta text-secondary"
                >
                  {shot.selector} · {shot.state}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
