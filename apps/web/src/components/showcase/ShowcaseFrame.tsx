import Link from "next/link";
import { templateHtmlSrc } from "./templateSrc";
import "../../app/showcase/showcase.css";

type ShowcaseFrameProps = {
  offeringKey: string;
  title: string;
  marketJob: string;
  testId: string;
};

/** Proof-frame chrome around a generated offering — crop marks, sticky bar, gallery return. */
export function ShowcaseFrame({ offeringKey, title, marketJob, testId }: ShowcaseFrameProps) {
  return (
    <div className="sx-chrome" data-testid={testId}>
      <header className="sx-chrome-bar">
        <div className="sx-chrome-title">
          <strong>{title}</strong>
          <span>Template {offeringKey} · proof sheet</span>
        </div>
        <nav className="sx-chrome-actions" aria-label="Template chrome">
          <Link href="/showcase" prefetch={false}>
            All templates
          </Link>
          <a className="sx-nav-cta" href="#proof">
            View proof
          </a>
        </nav>
      </header>
      <div className="sx-stage" id="proof">
        <p className="sr-only">{marketJob}</p>
        <div className="sx-stage-inner">
          <iframe
            title={title}
            src={templateHtmlSrc(offeringKey)}
            data-testid="showcase-frame"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
