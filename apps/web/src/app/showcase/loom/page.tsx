import { getTemplate } from "@designproof/design-skills";
import { ShowcaseFrame } from "@/components/showcase/ShowcaseFrame";

export const dynamic = "force-static";

const KEY = "loom";

export default function ShowcaseTemplatePage() {
  const template = getTemplate(KEY)!;
  return (
    <ShowcaseFrame
      offeringKey={template.key}
      title={template.label}
      marketJob={template.marketJob}
      testId={`showcase-${template.key}`}
    />
  );
}
