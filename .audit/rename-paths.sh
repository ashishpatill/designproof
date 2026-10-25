#!/usr/bin/env bash
set -euo pipefail
cd /Volumes/Developer/Workspace/tell-proof

# Brand-scoped paths. External deployment hostnames / remote repo slugs are untouched.

# .cursor rules + skills
for f in .cursor/rules/tell-*.mdc; do mv "$f" "${f/tell-/dp-}"; done
for d in .cursor/skills/tell-*; do mv "$d" "${d/tell-/dp-}"; done

# Top-level docs
mv OPEN_TELL_DESIGN_DATA.md OPEN_DP_DESIGN_DATA.md
mv TELL_DESIGN_DATA_HERE.md DP_DESIGN_DATA_HERE.md
mv agent-skills/web-design/TELL_SKILL_REGISTRY.md agent-skills/web-design/DP_SKILL_REGISTRY.md
mv docs/06_TELL_PROOF.md docs/06_DESIGN_PROOF.md

# Web components (specimen -> template)
mv apps/web/src/components/showcase/SpecimenPreview.tsx apps/web/src/components/showcase/TemplatePreview.tsx
mv apps/web/src/components/showcase/specimenBeats.ts apps/web/src/components/showcase/templateBeats.ts
mv apps/web/src/components/showcase/specimenBeats.test.ts apps/web/src/components/showcase/templateBeats.test.ts
mv apps/web/src/components/showcase/specimenSrc.ts apps/web/src/components/showcase/templateSrc.ts
mv apps/web/src/components/showcase/specimenSrc.test.ts apps/web/src/components/showcase/templateSrc.test.ts

# Media + fixtures
mv docs/media/tell-demo.gif docs/media/dp-demo.gif
mv docs/media/tell-demo.mp4 docs/media/dp-demo.mp4
mv docs/media/tell-proof-demo-poster.webp docs/media/dp-proof-demo-poster.webp
mv docs/media/tell-proof-demo.mp4 docs/media/dp-proof-demo.mp4
mv docs/media/tell-superlearnai-demo.gif docs/media/dp-superlearnai-demo.gif
mv fixtures/reports/tell-report.json fixtures/reports/dp-report.json

# Vendored harness
mv developer-drop/tell-design-data developer-drop/dp-design-data
mv developer-drop/tell-design-data.tar.gz developer-drop/dp-design-data.tar.gz
mv tell-design-data dp-design-data

echo "paths renamed"
