# One System: DSS/WSS + Design Proof + Our Own Component Library

Status: plan, written 2026-11-09. This document lives in two places on purpose: `docs/` in BIMLabz/OpenHarness and `docs/` in ashishpatill/designproof. It merges the two Astryx comparison plans (one for Design Proof, one for DSS/WSS) into a single programme, and adds the SuperLearn adoption path.

## The idea in one paragraph

DSS/WSS and Design Proof are complementary. DSS (Design Synthesis System) plans an app in 8 stages and produces a typed FeatureSpec. WSS (Web Synthesis System) generates the app deterministically from that spec, behind integrity gates, with atomic rollback. Design Proof judges design: it captures a running app, diagnoses it with detectors, applies source ranked patches, and proves a fix in a disposable checkout with measured deltas. Neither system has the other's half. Combined, plus a home built component library whose every component is born verified by Design Proof, the result is one system that plans, builds, and proves design quality end to end. SuperLearn is its first real customer.

## The seam decision: MCP first

Design Proof plugs into DSS/WSS as an MCP server. That is the primary seam, for five reasons.

1. It already exists in that shape. Design Proof is an MCP server with 11 typed `tell_*` tools and a schema package, with Cursor and Codex plugin packages shipped 2026-11-09. OpenHarness already lives in an MCP world. The integration work is one adapter, not a port of the engine.
2. The auditor's independence demands it. DSS/WSS verification is independent by design: the auditor runs on a different model class from the architect. If the design detectors were copied into the WSS codebase, the judged and the judge would share a release, a version, and a maintainer's blind spots. Over MCP the design judge stays a separate system, and its deterministic detectors stay model independent by construction.
3. Capture is a hosting problem, not a library problem. Capture needs a real browser, Playwright, screenshots and state probes. Design Proof's own deployment already splits the web UI from the capture host. Over MCP, capture runs on its own host and a capture failure is a clean tool error, not a crashed orchestrator.
4. Failure isolation protects atomicity. The FeatureOrchestrator's promise is all or nothing. A separate MCP server cannot corrupt that transaction. Worst case it times out or returns a bad verdict, the gate treats that as a failed check, and the feature rolls back, which is exactly the behaviour already designed for gate failures.
5. Publishing stays clean. One project, one repo, one folder. Design Proof is public under ashishpatill, OpenHarness is private under BIMLabz. MCP lets OpenHarness declare Design Proof as an external capability pack, the same opt in pattern its other packs use, without absorbing a second repo's history, licence surface, or release cadence.

Two supporting roles:

- As a package: the vocabulary becomes one shared, versioned schema package. The brand contract schema, the tool input and output types, and the verdict shape live there, so DSS, WSS, Design Proof, and SuperLearn all compile against the same contract format. Shared words, separate engines.
- As code inside DSS/WSS: only a thin adapter belongs inside OpenHarness. One MCP client bridge, plus one middleware class that translates a Design Proof verdict into the structured Violation shape the integrity pipeline already uses (rule, location, explanation, suggested fix). Nothing else is vendored. Detector fixtures may be mirrored for offline tests, clearly marked as fixtures.

How the combined engine serves SuperLearn: the component library arrives as a package in the platform frontend, Design Proof works over MCP in the authoring and release path, and nothing runs in the learner's request path. A student loading a lesson never waits on a capture run. Verification happens when pages and content are built and released, not when they are read.

## Where Design Proof sits in DSS (planning)

- Stage 1, requirements: the FeatureSpec gains a design section, written in the same testable style as every other requirement, naming banned patterns from the brand contract, so design intent is checkable later instead of being a vibe.
- Stage 4, architecture and visual strategy: Design Proof's home in planning. Stage 4 now produces or confirms the project's brand contract (tokens, type, banned patterns, voice rules), calls `tell_resolve_intent` to turn the brief into a named direction, and, where an existing app is being changed, calls `tell_capture` on the current pages so the plan starts from the real fingerprint of what exists.
- Stage 5, deliberation: for significant screens, Design Proof's staged authoring flow (concepts, mood board, art direction, key screen) runs as Stage 5 sub steps, each approved before the next. The adversarial reviewer stays on a different model class, which is already the DSS rule.
- Stage 6, contracts: component contracts carry design obligations next to function contracts: which catalogue component is used, which tokens it consumes, which states (empty, loading, error) it must render.

## Where Design Proof sits in WSS (building)

WSS generators stay deterministic and model free. Design Proof does not write generated code. It shapes inputs.

- Component generation reads the brand contract and the component catalogue first. The generator composes catalogue components and emits the token layer from the contract, instead of emitting stock shadcn derived components with hard coded styling.
- The Stage 2 reuse scan gets the catalogue as its default module index, which also fixes the known console path gap where planning runs with an empty index.
- Design Proof's Studio offerings and design skill graph become named recipe inputs for the feature generator, so a brief can ask for a known layout grammar instead of a freehand composition.

## Where Design Proof sits in verification, and the rollback rule

The auditor gains a fourth leg. Today it checks behaviour (Playwright), accessibility (axe), and performance (Lighthouse). It now also produces a design verdict: capture the built app in the sandbox across the scenario matrix (route, viewport, theme, interaction, auth state), run `tell_diagnose`, and, where a fix is claimed, `tell_proof_verify`.

The integrity pipeline gains a design rule, enforced in tiers (gate, warn, off), like the tells registry already supports. On failure it splits by lane:

- Generated lane (the normal case): the whole feature rolls back, and the fix goes upstream. Design Proof must not patch deterministic generator output inside the transaction, because a hand patch would break byte determinism and the next regeneration would silently lose the fix. A gate tier design failure produces structured violations, the orchestrator rolls back the entire diff exactly as it does for any gate failure, and the violations feed a spec revision: the contract, the catalogue component, or the generator is fixed, then the feature is regenerated. The fix lands where it will survive regeneration.
- Freehand lane (business logic inside generated shells): patch and proof are allowed. The auditor may run the Design Proof patch flow in the disposable checkout, then `tell_proof_verify`. If the proof passes and all other gates still pass, the transaction commits. If the proof fails, Design Proof's own revert runs first, and if anything is still red, the orchestrator's full rollback runs. Two safety nets, in that order.

## The shared brand contract

- Schema lives in the shared schema package, versioned, alongside the tell tool schemas.
- One instance per project: a `designproof.contract.json` checked into that project's repo root.
- DSS writes or confirms it at Stage 4. WSS consumes it when emitting tokens and components. Design Proof reads it as the authority on intentional versus generic, which ends fixed confidence guessing for anything the contract blesses or bans. SuperLearn reads the same instance for its platform pages, and lesson components reference its tokens, so a lesson and the page around it can never drift into two visual identities.
- One `contract check` command validates the file, the plugin wiring, and capture host reachability, with stable exit codes for CI. It is built once and shared by both plans.

## Our own component library: the catalogue

Built by us. Nothing is copied from Meta's Astryx: no code, no names, no assets. What we take is only the discipline the studies identified (typed docs beside the code, scorecards, themes as data), applied to components that come out of our own work.

How a component is born:

1. Seeded from real use. The first candidates are components DSS/WSS has already generated repeatedly across real projects, plus the patterns SuperLearn already renders. A component is harvested from working code, then rewritten clean by us, in our tokens, under our contract.
2. Admitted on the second use rule. The same rule DSS Stage 4 uses for design patterns: one use is a project component, two uses in different places earns catalogue admission. This keeps the catalogue small, real, and free of speculative inventory.
3. Born verified. Before admission, every component must pass, in a standard harness page, across the scenario matrix: zero gate tier detector findings from Design Proof, accessibility AA including contrast, all required states rendered (empty, loading, error), and performance within budget. The captures, the detector report, and the scorecard are stored in the repo pinned to the admission commit.

That third point is the quality claim. A normal library asserts quality through documentation and reputation. Ours ships the evidence per component: the scorecard, the captures it passed, the rubric version, the commit. The checks are scripts, so CI re runs them on every change, and a component whose proof goes stale is flagged, never silently trusted.

Starting domains, in order:

1. React primitives and patterns on the locked stack: buttons, inputs, forms (one schema for client and server, as WSS already generates), tables, cards, navigation, layout shells, empty and loading states. Licence note: the shadcn lineage of the seed code gets a proper audit before any public ship.
2. Next.js patterns: the page shapes our apps actually repeat. Table pages, detail layouts, form wizards, sign in gated route shells, data entry flows, SEO and metadata shells. This is where DSS/WSS and SuperLearn overlap most, so the reuse payoff is immediate.
3. The styling layer as data: a Tailwind v4 token layer driven by CSS variables, so a brand contract restyles the whole catalogue without touching component code. Other styling approaches get adapters only when a real project needs one, under the same second use rule.

Catalogue mechanics: a typed doc per component, colocated with the code, exporting props, variants, usage, accessibility notes, and design obligations. The catalogue index is generated from these files, so it cannot drift from the source, and a CI drift test fails when a hand written list disagrees. The generated index is the module index the DSS Stage 2 reuse scan reads by default, in both the recipe path and the console path.

## SuperLearn integration

What SuperLearn gains:

- Platform pages built and design verified, not eyeballed. Marketing pages, pricing, and app surfaces go through DSS planning, WSS generation, and the four legged audit, design verdict included.
- Lesson components from the catalogue. Interactive lesson elements become catalogue citizens: consistent, accessible, token driven, and proven once instead of re verified per lesson.
- One visual identity across product and content, because platform and lessons read the same brand contract instance.

Adoption order, respecting the content first rule and the live site:

1. Contract first, no content touched. SuperLearn's brand contract is authored and checked into the platform repo. Zero risk to the live site.
2. Pilot on a non lesson surface. One platform page (pricing is the natural candidate) is rebuilt through the combined system behind the existing deployment flow and verified live. Still no content change.
3. Catalogue components into lesson rendering, one course at a time, content first. New or revised lesson components are authored in the superlearn-content repo and published through its own release path, exactly as the 2026-11-09 publish worked. Platform support lands only after the content release is merged and verified. Each course is verified on the live site before the next one starts.

## The merged roadmap

The two earlier 7 phase plans overlap. Merged honestly, three pairs collapse into single pieces of work: one benchmark battery (critique, build, and repair tasks under one fairness protocol), one brand contract (one schema, one check command), and one packaging programme (the MCP server on npm, the OpenHarness capability packs standalone, the catalogue package, one doctor pattern). The generated manifest work likewise becomes one generator pattern applied in both repos, and the scorecard format is defined once and reused three times.

### Phase 0: Foundations (Medium)
Shared schema package extended with the brand contract and verdict types. The MCP bridge adapter and verdict to Violation middleware land in OpenHarness. The design rule enters the integrity pipeline in warn tier only. SuperLearn's brand contract authored.
Verify: the canonical DSS/WSS demo runs end to end with design warnings reported and nothing blocked. Contract check exits correctly on a broken contract fixture.

### Phase 1: The catalogue v1 (Large)
Harvest and rewrite the first React primitives and Next.js patterns from real generated code, each admitted on second use and born verified, with captures, detector report, and scorecard in the repo. Generated index wired as the reuse scan's default.
Verify: every catalogue entry carries a current scorecard. The default console plan completes its reuse stage against the catalogue. Reuse rate on a standard brief is measurable and above the empty index baseline of zero.

### Phase 2: The design gate earns its teeth (Medium)
Calibration corpus built from dogfood captures across Design Proof and DSS/WSS outputs. Detector precision measured per detector. Tells move from warn to gate tier one at a time, each backed by a before and after fixture pair, and no detector gates below the precision floor.
Verify: registry coverage report in CI for both repos. The deliberately broken demo feature is caught by the design gate as well as the behavioural audit and rolls back clean.

### Phase 3: The unified benchmark battery (Medium)
The merged battery runs: DSS/WSS versus freehand, with and without Design Proof in the loop, across two model classes, with a 10 turn degradation mode. First scoreboard recorded in both repos.
Verify: the combined system beats freehand on auditor findings and design scores, repeatably across two runs. This scoreboard is the core evidence for any later public claim.

### Phase 4: Staged authoring inside DSS (Large)
Design Proof's staged authoring flow lands as DSS Stage 4 and 5 sub steps rather than as a separate tool family: concepts through key screen, each stage approved, every output a runnable page that must pass the swap test (rebrand it and the concept must change). Catalogue and recipe scorecards adopt the single shared format here.
Verify: one brief taken end to end through staged authoring scores above the one shot baseline on the battery's authoring family.

### Phase 5: SuperLearn adoption (Medium to Large)
The three step order above: contract (done in Phase 0), pilot page, then lesson components course by course through the content repo's release path.
Verify: per course, the live lesson check used for the Optimization lesson, published content serving from the content store with the new components rendered and design verified.

### Phase 6: Packaging, doctor, migrations (Medium)
The MCP server and CLI publish to npm. The OpenHarness packs install standalone. The catalogue ships as a versioned package. One doctor command family checks stack, contract, wiring, and capture host in each home. Schema and config migrations ship with version bumps.
Verify: a clean machine installs everything from packages only, doctor passes, the canonical demo and a Design Proof diagnosis both run, and a previous version project migrates without manual edits.

### Phase 7: Publication readiness for OpenHarness and DeepHarness (Small to Medium, gated)
Everything above working is necessary but not sufficient. See the decision list below.
Verify: a full clean room run: fresh install, demo brief to a published quality app, design gate on, battery scoreboard attached to the release notes, no private data, no internal architecture disclosures beyond what Ashish approves for publication.

## Decisions that stay Ashish's

- The public flip itself. OpenHarness is private, its changelog says "not a public ship", and the flip has never been authorised. Nothing in this roadmap publishes anything. Phase 7 prepares, Ashish decides.
- What ships: DSS/WSS packs alone, or DeepHarness whole. Whether the catalogue ships at v1 or waits. Whether the tell-proof steering feature and the DSS/WSS naming collision get resolved before or after any flip (worth doing before, since public docs cannot carry the ambiguity).
- The licence and provenance audit, in particular the shadcn derived seed code in WSS generators and the catalogue's first harvest, before any public release.
- The hosted capture question: whether a public OpenHarness offers Design Proof only as a local MCP server, or also a hosted endpoint (also the outstanding piece for ChatGPT), with its cost and abuse implications.
- Claims discipline: which battery numbers, if any, are published, under the rule that claims must be backed by evidence he can open.

What must be true before any flip: Phases 0 to 6 verified as above. A security pass over generated auth and payments patterns, because generated apps carry sign in gates and webhook handling and their defaults become other people's production code. A docs honesty pass in plain words. The naming collision resolved. And a support burden decision, because a public harness with a design gate will attract issues a solo builder must be willing to carry.

## Risks and honest tradeoffs

- The determinism tension is real. Design Proof's instinct is to patch, WSS's strength is never needing to. The two lane rule resolves it, but design fixes to generated code are slower (fix the contract or component, regenerate) in exchange for fixes that survive. That trade should be stated plainly in the docs.
- Gate fatigue is the failure mode. If the design gate fires often at low precision, builders will switch it off, and off by default is already DSS/WSS's known weakness. Calibration (Phase 2) therefore precedes enforcement, and the warn tier exists. Skipping Phase 2 to ship the gate sooner would likely kill the gate.
- Capture in the loop costs time and money. Every audited feature pays for browser captures across a scenario matrix, and any model based enrichment is a metered dependency inside someone else's build pipeline. Brief mode outputs and capture caching are necessities, not extras.
- Three systems, one builder. The sequencing is deliberately value ordered (contract and catalogue before packaging, measurement before claims) so that stopping after any phase leaves something coherent and useful.
- The catalogue can become a second job. A component library is a maintenance commitment forever. The defences are the second use admission rule and evidence based scorecards. If admission discipline slips, the catalogue becomes the stock look it was built to replace, only with our name on it.
- Stack lock in deepens before it loosens. Everything here is built on the one locked stack. That is honest for now, since it is the stack SuperLearn and DSS/WSS actually run, but each phase should be judged partly on whether it makes the eventual second stack cheaper or dearer.
