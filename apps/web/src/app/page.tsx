"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileCode2,
  Github,
  Link2,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { BrandDNA, RedesignProposal, DesignProofReport, UserDesignProfile, Verdict } from "@designproof/schema";
import { DIRECTION_PRESETS, parseDirectionPlan, type DirectionPlan } from "@designproof/taste";
import { RECONCILE_DIRECTIONS, buildOverridesPatch, learnBrandDNA, reconcile, resolveDirection } from "@designproof/redesign";
import { demoReport } from "@/lib/demo-report";
import { emptyReport } from "@/lib/empty-report";
import dynamic from "next/dynamic";
import { ConnectAgent } from "@/components/ConnectAgent";
import { useLlmRestyle } from "@/lib/use-llm-restyle";
import { useVoice } from "@/lib/use-voice";
import { SETUP_ACTIVE_STATES, type SetupJob } from "@/lib/setup-types";
import { discoverRoutes, routeFromInput, type DiscoveredRoute } from "@/lib/discover-routes";
import { matrixTarget } from "@/lib/matrix-target";
import {
  loadUserDesignProfile,
  recordDirectionSession,
  recordToolPreference,
  suggestedDirectionId,
} from "@/lib/user-session-learn";
import { byokHeaders } from "@/lib/byok";
import { projectCanvasTitle } from "@/lib/capture-honesty";
import {
  isGitHubRepoUrl,
  normalizeCaptureUrl,
  sameOrigin,
  siteLabel,
} from "@/lib/capture-url";
import {
  loadRecentSessions,
  newSessionId,
  sessionTitleFromBrief,
  sessionTitleFromUrl,
  upsertRecentSession,
  type ComposerMode,
  type RecentSession,
} from "@/lib/recent-sessions";
import { svgSessionThumb, thumbFromScreenshotBase64 } from "@/lib/session-thumb";
import {
  DEFAULT_DESIGN_CONTROLS,
  serializeDesignControls,
  type DesignControlsValue,
} from "@/lib/design-controls-catalog";
import {
  AppShell,
  EntryHome,
  ProductSidebar,
  ProjectWorkspace,
  SettingsDialog,
  type WorkspaceTab,
} from "@/components/shell";
import {
  BrandDnaBar,
  ConfidenceMeter,
  DiffViewer,
  OperationCurtain,
  OperationPlaceholder,
  PagesStrip,
  ReconciliationTable,
  ScenarioMatrixPanel,
  Scorecard,
  SetupPanel,
  STATE_LABEL,
  ToastNotice,
  VerdictBadge,
  VerifiedProofPanel,
  WhatChangedList,
  WorkflowRail,
  type CaptureMeta,
  type CaptureState,
  type DraftState,
  type MatrixCellSummary,
  type MatrixProofSummary,
  type ProofResult,
  type ProofState,
  type SourceContext,
  type UiNotice,
} from "@/components/report";

const BeforeAfterSeam = dynamic(
  () => import("@/components/BeforeAfterSeam").then((m) => m.BeforeAfterSeam),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[280px] rounded-card border border-border bg-surface-raised/40"
        data-testid="seam-loading"
        aria-busy="true"
      />
    ),
  },
);

const PRESET_CHIPS: { key: string; label: string }[] = [
  { key: "editorial", label: "Editorial" },
  { key: "precision", label: "Precision instrument" },
  { key: "warm-minimal", label: "Warm minimal" },
  { key: "bold-contrast", label: "Bold contrast" },
  { key: "luxury", label: "Classic luxury" },
  { key: "brutalist", label: "Brutalist utility" },
  { key: "explainer", label: "Visual textbook" },
];

type FindingFilter = "all" | Verdict;

const FINDING_FILTERS: { id: FindingFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "generic", label: "Generic" },
  { id: "drift", label: "Drift" },
  { id: "intentional", label: "Intentional" },
];

export default function HomePage() {
  const [report, setReport] = useState<DesignProofReport>(emptyReport);
  const [inputUrl, setInputUrl] = useState("");
  const [captureMeta, setCaptureMeta] = useState<CaptureMeta | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [seam, setSeam] = useState(50);
  const [directionId, setDirectionId] = useState("editorial");
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [offlineDemo, setOfflineDemo] = useState(false);
  const [captureNote, setCaptureNote] = useState("");
  const [proposal, setProposal] = useState<RedesignProposal | null>(null);
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const [draftError, setDraftError] = useState("");
  const [sourceContext, setSourceContext] = useState<SourceContext | null>(null);
  const [patchSource, setPatchSource] = useState<"cursor" | "deterministic" | null>(null);
  const [proofState, setProofState] = useState<ProofState>("idle");
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [proofError, setProofError] = useState("");
  const [directionPlan, setDirectionPlan] = useState<DirectionPlan | null>(null);
  const [directionParsing, setDirectionParsing] = useState(false);
  const [directionSource, setDirectionSource] = useState<"gemini" | "local" | null>(null);
  const parseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uiNotice, setUiNotice] = useState<UiNotice | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [sharingReport, setSharingReport] = useState(false);

  // ── Shell: entry home + project tabs ──
  const [shellView, setShellView] = useState<"home" | "project">("home");
  const [composerMode, setComposerMode] = useState<ComposerMode>("url");
  const [composerValue, setComposerValue] = useState("");
  const [sessionId, setSessionId] = useState(() => newSessionId());
  const [sessionTitle, setSessionTitle] = useState("Session");
  const [designBrief, setDesignBrief] = useState("");
  const [designControls, setDesignControls] = useState<DesignControlsValue>(DEFAULT_DESIGN_CONTROLS);
  const [recent, setRecent] = useState<RecentSession[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusCanvas, setFocusCanvas] = useState(false);
  const [mobilePane, setMobilePane] = useState<"critic" | "canvas">("canvas");
  const [openTabs, setOpenTabs] = useState<WorkspaceTab[]>([]);
  // ── Review-pane state: findings stay the default; direction and proof are one click away ──
  const [criticTab, setCriticTab] = useState<"findings" | "direction" | "proof">("findings");
  const [findingFilter, setFindingFilter] = useState<FindingFilter>("all");

  // ── GitHub repo setup ──
  const [setupJob, setSetupJob] = useState<SetupJob | null>(null);
  const [setupError, setSetupError] = useState("");
  const [setupStarting, setSetupStarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCapturedRef = useRef<string | null>(null);

  // ── Multi-page scanning ──
  const [pages, setPages] = useState<DiscoveredRoute[]>([]);
  const [pageInput, setPageInput] = useState("");
  const [scanningAll, setScanningAll] = useState(false);

  // ── Live scenario matrix (route × viewport × theme × interaction × auth) ──
  const [matrixState, setMatrixState] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [matrixProof, setMatrixProof] = useState<MatrixProofSummary | null>(null);
  const [matrixError, setMatrixError] = useState("");

  // ── Brand DNA memory (learned once, used as the redesign target + scoring yardstick) ──
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null);
  // ── Per-user session learning (browser-local; not developer corpus) ──
  const [userProfile, setUserProfile] = useState<UserDesignProfile | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dp:brand-dna");
      if (raw) setBrandDna(JSON.parse(raw) as BrandDNA);
    } catch {
      /* ignore malformed cache */
    }
    setRecent(loadRecentSessions());
    const profile = loadUserDesignProfile();
    setUserProfile(profile);
    const suggested = suggestedDirectionId(profile);
    if (suggested && Object.prototype.hasOwnProperty.call(RECONCILE_DIRECTIONS, suggested)) {
      setDirectionId(suggested);
    }
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("report")) {
      setShellView("project");
    }
  }, []);

  const learnFromDirection = useCallback((plan: DirectionPlan, phrase: string) => {
    setUserProfile((prev) =>
      recordDirectionSession(prev ?? loadUserDesignProfile(), {
        presetId: plan.presetId,
        phrase,
        actionCategories: plan.actionItems.map((a) => a.category),
      }),
    );
  }, []);

  const reconciliation = useMemo(
    () => reconcile(report.capture, report.fingerprint, report.findings, directionId, brandDna ?? undefined),
    [report, directionId, brandDna],
  );

  // v2: deterministic reconciliation ships instantly above; this fires the Gemini-refined
  // sheet in the background (debounced/abortable) and resets whenever direction/capture/DNA changes.
  const llmRestyle = useLlmRestyle({
    capture: report.capture,
    fingerprint: report.fingerprint,
    directionId,
    dna: brandDna ?? undefined,
    enabled: Boolean(report.capture.snapshotHtml),
  });

  const verdictOf = useCallback(
    (id: string): Verdict => report.verdicts.find((v) => v.findingId === id)?.verdict ?? "uncertain",
    [report],
  );

  const applyDirectionPlan = useCallback((plan: DirectionPlan) => {
    setDirectionPlan(plan);
    setDirectionId(resolveDirection(plan.presetId).id);
    setProposal(null);
    setDraftState("idle");
  }, []);

  const scheduleDirectionParse = useCallback(
    (text: string) => {
      if (parseTimerRef.current) clearTimeout(parseTimerRef.current);
      const trimmed = text.trim();
      if (trimmed.length < 2) {
        setDirectionPlan(null);
        setDirectionSource(null);
        return;
      }

      applyDirectionPlan(parseDirectionPlan(trimmed));
      setDirectionSource("local");

      parseTimerRef.current = setTimeout(async () => {
        setDirectionParsing(true);
        try {
          const res = await fetch("/api/voice", {
            method: "POST",
            headers: byokHeaders(),
            body: JSON.stringify({ transcript: trimmed }),
          });
          if (res.ok) {
            const payload = (await res.json()) as DirectionPlan & { source?: "gemini" | "local" };
            applyDirectionPlan(payload);
            setDirectionSource(payload.source ?? "local");
            learnFromDirection(payload, trimmed);
            setUserProfile((prev) =>
              recordToolPreference(prev ?? loadUserDesignProfile(), "voice"),
            );
          } else {
            const local = parseDirectionPlan(trimmed);
            learnFromDirection(local, trimmed);
          }
        } catch {
          const local = parseDirectionPlan(trimmed);
          learnFromDirection(local, trimmed);
        } finally {
          setDirectionParsing(false);
        }
      }, 650);
    },
    [applyDirectionPlan, learnFromDirection],
  );

  const onVoiceTranscript = useCallback(
    (text: string) => {
      scheduleDirectionParse(text);
    },
    [scheduleDirectionParse],
  );

  const voice = useVoice(onVoiceTranscript);

  const showNotice = useCallback((notice: UiNotice) => {
    setUiNotice(notice);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setUiNotice(null), notice.tone === "error" ? 12_000 : 7000);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sharedId = new URLSearchParams(window.location.search).get("report");
    if (!sharedId) return;
    fetch(`/api/reports/${sharedId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load shared report.");
        setReport(data.report);
        setSelectedId(data.report.findings[0]?.id ?? "");
        setCaptureState("done");
        setCaptureMeta({ live: false, requestedUrl: data.report.capture.url, capturedUrl: data.report.capture.url });
        const sid = newSessionId();
        const title = sessionTitleFromUrl(data.report.capture.url);
        setSessionId(sid);
        setSessionTitle(title);
        setOpenTabs((tabs) => (tabs.some((t) => t.id === sid) ? tabs : [...tabs, { id: sid, title }]));
        setShellView("project");
        showNotice({ tone: "info", title: "Shared report loaded", message: "This is a read-only handoff link." });
      })
      .catch((error) => {
        showNotice({
          tone: "error",
          title: "Shared report unavailable",
          message: error instanceof Error ? error.message : String(error),
        });
      });
  }, [showNotice]);

  const shareReport = useCallback(async () => {
    setSharingReport(true);
    try {
      const res = await fetch("/api/reports/share", {
        method: "POST",
        headers: byokHeaders(),
        body: JSON.stringify({ report }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = [data.error, data.hint, data.detail].filter(Boolean).join(" — ");
        throw new Error(detail || "Could not create share link.");
      }
      setShareUrl(data.url);
      await navigator.clipboard.writeText(data.url);
      const backendLabel =
        data.backend === "neon" ? "Neon" : data.backend === "blob" ? "Blob" : "this instance";
      showNotice({
        tone: "success",
        title: `Share link copied · ${backendLabel}`,
        message: data.expiresNote ? `${data.url}\n${data.expiresNote}` : data.url,
      });
    } catch (error) {
      showNotice({
        tone: "error",
        title: "Share failed",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSharingReport(false);
    }
  }, [report, showNotice]);

  const learnDna = useCallback(() => {
    const dna = learnBrandDNA(report.capture, report.fingerprint, siteLabel(report.capture.url));
    setBrandDna(dna);
    try {
      localStorage.setItem("dp:brand-dna", JSON.stringify(dna));
    } catch {
      /* storage unavailable — keep it in memory for this session */
    }
    setProposal(null);
    setDraftState("idle");
    showNotice({
      tone: "success",
      title: "Brand DNA saved",
      message: `Design Proof now scores against ${dna.displayFont} / ${dna.bodyFont} · ${dna.accent}. Redesigns steer toward this brand.`,
    });
  }, [report, showNotice]);

  const clearDna = useCallback(() => {
    setBrandDna(null);
    try {
      localStorage.removeItem("dp:brand-dna");
    } catch {
      /* ignore */
    }
    setProposal(null);
    setDraftState("idle");
    showNotice({ tone: "info", title: "Brand DNA cleared", message: "Back to scoring against the generic baseline." });
  }, [showNotice]);

  useEffect(() => {
    return () => {
      if (parseTimerRef.current) clearTimeout(parseTimerRef.current);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const selectedFinding = report.findings.find((f) => f.id === selectedId) ?? report.findings[0];
  const verdict = report.verdicts.find((v) => v.findingId === selectedFinding?.id);
  const s = report.score;
  const scoreLine = `${s.total} findings · ${s.generic} generic · ${s.drift} drift · ${s.intentional} intentional`;

  const dirMeta = RECONCILE_DIRECTIONS[directionId] ?? RECONCILE_DIRECTIONS.editorial!;

  const runCapture = useCallback(
    async (url: string) => {
      const rawTarget = url.trim();
      const target = normalizeCaptureUrl(rawTarget);
      if (!target) return;
      if (target !== rawTarget) setInputUrl(target);
      if (proofResult) {
        showNotice({
          tone: "error",
          title: "Resolve the visual worktree first",
          message: "Copy the verified patch or revert the temporary change before capturing another baseline.",
        });
        return;
      }
      setOfflineDemo(false);
      setCaptureState("capturing");
      setCaptureNote(`Launching headless browser for ${siteLabel(target)}…`);
      setDraftError("");
      setProposal(null);
      setSourceContext(null);
      setPages([]);
      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: byokHeaders(),
          body: JSON.stringify({ url: target }),
        });
        const payload = (await res.json()) as {
          report: DesignProofReport | null;
          meta: CaptureMeta;
        };

        if (!res.ok || !payload.meta?.live || !payload.report) {
          setCaptureNote(payload.meta?.error ?? `Capture failed for ${siteLabel(target)}.`);
          setCaptureMeta({
            live: false,
            requestedUrl: payload.meta?.requestedUrl || target,
            capturedUrl: "",
            error: payload.meta?.error ?? `Capture failed for ${target}.`,
            detail: payload.meta?.detail,
            backend: payload.meta?.backend,
          });
          setReport(emptyReport);
          setSelectedId("");
          setCaptureState("idle");
          setDraftState("idle");
          setDraftError(payload.meta?.error ?? `Design Proof could not capture ${target}.`);
          const sid = sessionId || newSessionId();
          setSessionId(sid);
          const title = sessionTitleFromUrl(target);
          setSessionTitle(title);
          setOpenTabs((tabs) => {
            const next = tabs.some((t) => t.id === sid) ? tabs : [...tabs, { id: sid, title }];
            return next.map((t) => (t.id === sid ? { ...t, title } : t));
          });
          showNotice({
            tone: "error",
            title: "Capture failed",
            message:
              payload.meta?.error ??
              `Design Proof could not reach ${siteLabel(target)}. Fix the URL or capture backend — the demo fixture was not loaded.`,
          });
          return;
        }

        const liveReport = payload.report;
        setCaptureNote(
          payload.meta.backend === "remote"
            ? "Capture complete — live diagnosis via capture backend."
            : "Capture complete.",
        );
        setReport(liveReport);
        setCaptureMeta(payload.meta);
        setSelectedId(liveReport.findings[0]?.id ?? "");
        setDraftState("idle");
        setSeam(50);
        setCaptureState("done");

        const sid = sessionId || newSessionId();
        setSessionId(sid);
        const title = sessionTitleFromUrl(liveReport.capture.url);
        setSessionTitle(title);
        setOpenTabs((tabs) => {
          const next = tabs.some((t) => t.id === sid) ? tabs : [...tabs, { id: sid, title }];
          return next.map((t) => (t.id === sid ? { ...t, title } : t));
        });
        setRecent(
          upsertRecentSession({
            id: sid,
            title,
            mode: isGitHubRepoUrl(target) ? "github" : "url",
            url: liveReport.capture.url,
            findingCount: liveReport.score.total,
            live: true,
            thumbDataUrl: svgSessionThumb({
              title,
              findingCount: liveReport.score.total,
              live: true,
              accent: liveReport.capture.surfaceTokens?.accent?.includes("rgb")
                ? "#D4714A"
                : liveReport.capture.surfaceTokens?.accent || "#D4714A",
              surface: "#221F1C",
            }),
            updatedAt: new Date().toISOString(),
          }),
        );
        void thumbFromScreenshotBase64(liveReport.capture.screenshotBase64 || "").then((thumb) => {
          if (!thumb) return;
          setRecent(
            upsertRecentSession({
              id: sid,
              title,
              mode: isGitHubRepoUrl(target) ? "github" : "url",
              url: liveReport.capture.url,
              findingCount: liveReport.score.total,
              live: true,
              thumbDataUrl: thumb,
              updatedAt: new Date().toISOString(),
            }),
          );
        });
        setPages(discoverRoutes(liveReport.capture.snapshotHtml, liveReport.capture.url));
        setDraftError("");
        showNotice({
          tone: "success",
          title: "Capture complete",
          message: `Design Proof scanned ${siteLabel(liveReport.capture.url)} and found ${liveReport.score.total} findings.`,
        });
      } catch {
        setCaptureNote(`Capture failed for ${siteLabel(target)}.`);
        setCaptureMeta({
          live: false,
          requestedUrl: target,
          capturedUrl: "",
          error: "Network error while contacting Design Proof's capture API.",
        });
        setReport(emptyReport);
        setSelectedId("");
        setCaptureState("idle");
        setDraftError("Network error while contacting Design Proof's capture API.");
        showNotice({
          tone: "error",
          title: "Capture failed",
          message: `Network error while capturing ${siteLabel(target)}. Check the capture backend and try again.`,
        });
      }
    },
    [proofResult, sessionId, showNotice],
  );

  const pollSetup = useCallback(
    (id: string) => {
      if (pollRef.current) clearTimeout(pollRef.current);
      const tick = async () => {
        try {
          const res = await fetch(`/api/setup/status?id=${encodeURIComponent(id)}`);
          const data = await res.json();
          if (res.ok && data.job) {
            const job = data.job as SetupJob;
            setSetupJob(job);
            if (job.state === "ready" && job.url && autoCapturedRef.current !== job.url) {
              autoCapturedRef.current = job.url;
              setInputUrl(job.url);
              showNotice({
                tone: "info",
                title: "Repo is running",
                message: `${job.repoLabel} is reachable at ${job.url}. Starting capture now.`,
              });
              void runCapture(job.url);
              return;
            }
            if (SETUP_ACTIVE_STATES.includes(job.state)) {
              pollRef.current = setTimeout(tick, 1200);
            } else if (job.state === "needs-manual" || job.state === "error") {
              showNotice({
                tone: "error",
                title: "Setup needs manual help",
                message: job.error ?? job.step,
              });
            }
          } else {
            pollRef.current = setTimeout(tick, 2000);
          }
        } catch {
          pollRef.current = setTimeout(tick, 2000);
        }
      };
      void tick();
    },
    [runCapture, showNotice],
  );

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  const startSetup = useCallback(
    async (repoUrl: string) => {
      if (proofResult) {
        showNotice({
          tone: "error",
          title: "Resolve the visual worktree first",
          message: "Revert the temporary change before setting up another repository.",
        });
        return;
      }
      setSetupError("");
      setSetupStarting(true);
      setSetupJob(null);
      setSourceContext(null);
      setProofResult(null);
      setProofState("idle");
      setCaptureNote(`Creating setup job for ${repoUrl.trim()}…`);
      autoCapturedRef.current = null;
      try {
        const res = await fetch("/api/setup/start", {
          method: "POST",
          headers: byokHeaders(),
          body: JSON.stringify({ repoUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSetupError(data.error ?? "Could not start setup.");
          showNotice({
            tone: "error",
            title: "Setup failed to start",
            message: data.error ?? "Could not start setup.",
          });
          return;
        }
        setSetupJob(data.job as SetupJob);
        showNotice({
          tone: "info",
          title: "Setup started",
          message: `Cloning and booting ${(data.job as SetupJob).repoLabel}. This can take a minute on first install.`,
        });
        pollSetup((data.job as SetupJob).id);
      } catch {
        setSetupError("Network error starting setup. Is the dev server running?");
        showNotice({
          tone: "error",
          title: "Setup failed to start",
          message: "Network error starting setup. Is the dev server running?",
        });
      } finally {
        setSetupStarting(false);
      }
    },
    [pollSetup, proofResult, showNotice],
  );

  const stopApp = useCallback(async () => {
    if (proofResult) {
      showNotice({
        tone: "error",
        title: "Proof patch is still applied",
        message: "Revert the visual worktree before stopping its dev server.",
      });
      return;
    }
    try {
      await fetch("/api/setup/stop", { method: "POST" });
    } catch {
      /* ignore */
    }
    setSetupJob(null);
    setSetupStarting(false);
  }, [proofResult, showNotice]);


  const openProjectTab = useCallback((id: string, title: string) => {
    setSessionId(id);
    setSessionTitle(title);
    setOpenTabs((tabs) => (tabs.some((t) => t.id === id) ? tabs : [...tabs, { id, title }]));
    setShellView("project");
    setMobilePane("canvas");
  }, []);

  const goHome = useCallback(() => {
    setShellView("home");
    setFocusCanvas(false);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setOpenTabs((tabs) => {
        const next = tabs.filter((t) => t.id !== id);
        if (id === sessionId) {
          if (next.length) {
            setSessionId(next[0]!.id);
            setSessionTitle(next[0]!.title);
            setShellView("project");
          } else {
            setShellView("home");
          }
        }
        return next;
      });
    },
    [sessionId],
  );

  const loadOfflineFixture = useCallback(() => {
    const id = newSessionId();
    const title = "Offline fixture";
    setOfflineDemo(true);
    setReport(demoReport);
    setSelectedId(demoReport.findings[0]?.id ?? "");
    setCaptureState("done");
    setCaptureMeta({
      live: false,
      requestedUrl: demoReport.capture.url,
      capturedUrl: demoReport.capture.url,
      fallback: "offline-fixture",
    });
    setProposal(null);
    setDraftState("idle");
    setSeam(50);
    openProjectTab(id, title);
    setRecent(
      upsertRecentSession({
        id,
        title,
        mode: "offline",
        url: demoReport.capture.url,
        findingCount: demoReport.score.total,
        live: false,
        thumbDataUrl: svgSessionThumb({
          title: siteLabel(demoReport.capture.url),
          findingCount: demoReport.score.total,
          live: false,
          accent: "#8B5CF6",
          surface: "#0F0F0F",
        }),
        updatedAt: new Date().toISOString(),
      }),
    );
    showNotice({
      tone: "info",
      title: "Offline demo loaded",
      message: "Committed fixture report — choose Live URL to capture a real site.",
    });
  }, [openProjectTab, showNotice]);

  const startFromComposer = useCallback(() => {
    if (composerMode === "offline") {
      loadOfflineFixture();
      return;
    }
    const text = composerValue.trim();
    if (!text) return;

    if (composerMode === "design") {
      const id = newSessionId();
      const title = sessionTitleFromBrief(text);
      setDesignBrief(text);
      voice.setTranscript(text);
      scheduleDirectionParse(text);
      setOfflineDemo(false);
      setReport(emptyReport);
      setSelectedId("");
      setCaptureMeta(null);
      setCaptureState("idle");
      openProjectTab(id, title);
      setRecent(
        upsertRecentSession({
          id,
          title,
          mode: "design",
          brief: text,
          thumbDataUrl: svgSessionThumb({
            title,
            accent: "#D4714A",
            surface: "#221F1C",
          }),
          updatedAt: new Date().toISOString(),
        }),
      );
      showNotice({
        tone: "info",
        title: "Direction primed",
        message: "Paste a live URL or GitHub repo in the project bar to ground this brief — or open Studio.",
      });
      return;
    }

    setInputUrl(text);
    const id = newSessionId();
    if (composerMode === "github" || isGitHubRepoUrl(text)) {
      openProjectTab(id, sessionTitleFromBrief(text));
      void startSetup(text);
    } else {
      openProjectTab(id, sessionTitleFromUrl(normalizeCaptureUrl(text) || text));
      void runCapture(text);
    }
  }, [
    composerMode,
    composerValue,
    loadOfflineFixture,
    openProjectTab,
    scheduleDirectionParse,
    showNotice,
    startSetup,
    runCapture,
    voice,
  ]);

  const openRecent = useCallback(
    (session: RecentSession) => {
      openProjectTab(session.id, session.title);
      if (session.mode === "offline") {
        loadOfflineFixture();
        return;
      }
      if (session.mode === "design" && session.brief) {
        setDesignBrief(session.brief);
        setComposerMode("design");
        setComposerValue(session.brief);
        voice.setTranscript(session.brief);
        scheduleDirectionParse(session.brief);
        setCaptureMeta(null);
        setCaptureState("idle");
        return;
      }
      if (session.url) {
        setInputUrl(session.url);
        setComposerValue(session.url);
        if (session.mode === "github" || isGitHubRepoUrl(session.url)) {
          void startSetup(session.url);
        } else {
          void runCapture(session.url);
        }
      }
    },
    [loadOfflineFixture, openProjectTab, runCapture, scheduleDirectionParse, startSetup, voice],
  );


  const isRepo = isGitHubRepoUrl(inputUrl);
  const normalizedInputUrl = normalizeCaptureUrl(inputUrl);
  const setupActive = setupStarting || Boolean(setupJob && SETUP_ACTIVE_STATES.includes(setupJob.state));
  const operationActive = setupActive || captureState === "capturing";
  const operationTitle = setupStarting
    ? "Starting repo setup"
    : setupJob && SETUP_ACTIVE_STATES.includes(setupJob.state)
      ? `${STATE_LABEL[setupJob.state]} ${setupJob.repoLabel}`
      : captureState === "capturing"
        ? "Capturing rendered surface"
        : "";
  const operationDetail = setupStarting
    ? captureNote
    : setupJob && SETUP_ACTIVE_STATES.includes(setupJob.state)
      ? setupJob.step
      : captureState === "capturing"
        ? captureNote
        : "";

  function onPrimary() {
    if (operationActive) return;
    if (isRepo) void startSetup(inputUrl);
    else void runCapture(inputUrl);
  }

  const liveCapture = captureMeta?.live === true && Boolean(report.capture.snapshotHtml || report.capture.screenshotBase64);
  const offlineFixtureSession =
    offlineDemo || captureMeta?.fallback === "offline-fixture" || captureMeta?.offlineFixture === true;
  /** Canvas content gate — live proof or opt-in offline fixture (not the same as a proof surface label). */
  const hasProofSurface =
    (liveCapture || offlineFixtureSession) &&
    captureState === "done" &&
    Boolean(report.capture.snapshotHtml || report.capture.screenshotBase64);
  const scannedSite = hasProofSurface
    ? siteLabel(report.capture.url)
    : captureMeta?.requestedUrl
      ? siteLabel(captureMeta.requestedUrl)
      : null;
  const canvasTitle = projectCanvasTitle({
    captureState,
    captureNote,
    scannedSite,
    hasLiveProofSurface: liveCapture && captureState === "done",
    offlineFixture: offlineFixtureSession && captureState === "done",
    captureError: captureMeta?.error,
  });
  const captureBelongsToSetup = Boolean(
    setupJob?.state === "ready" &&
    setupJob.url &&
    captureMeta?.live &&
    sameOrigin(report.capture.url, setupJob.url),
  );
  const needsRecapture = Boolean(
    captureMeta?.live && !isRepo && normalizedInputUrl && normalizedInputUrl !== captureMeta.requestedUrl,
  );

  function addPage() {
    const url = routeFromInput(pageInput, report.capture.url);
    if (!url) return;
    setPages((prev) => (prev.some((p) => p.url === url) ? prev : [...prev, { url, path: new URL(url).pathname }]));
    setPageInput("");
    void runCapture(url);
  }

  async function scanAllPages() {
    setScanningAll(true);
    for (const p of pages.slice(0, 8)) {
      // eslint-disable-next-line no-await-in-loop
      await runCapture(p.url);
    }
    setScanningAll(false);
  }

  async function scanScenarioMatrix() {
    const url = normalizeCaptureUrl(report.capture.url || inputUrl);
    if (!url) {
      showNotice({ tone: "error", title: "Need a URL", message: "Capture a live page before scanning the scenario matrix." });
      return;
    }
    setMatrixState("scanning");
    setMatrixError("");
    setMatrixProof(null);
    try {
      const discovered = pages.length
        ? [...new Set(pages.map((p) => p.path.split("?")[0] || "/"))].slice(0, 4)
        : ["/", "/pricing", "/account"];
      const { baseUrl, routes } = matrixTarget(url, discovered);
      const res = await fetch("/api/proof/matrix", {
        method: "POST",
        headers: byokHeaders(),
        body: JSON.stringify({ url: baseUrl, routes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : `Matrix scan failed (${res.status})`);
      }
      const proofCells: MatrixCellSummary[] = Array.isArray(data.proof?.cells)
        ? data.proof.cells.map((c: MatrixCellSummary) => ({
            scenarioId: c.scenarioId,
            status: c.status,
            scoreDelta: c.scoreDelta,
            focusRegressed: Boolean(c.focusRegressed),
            structureRegressed: Boolean(c.structureRegressed),
          }))
        : [];
      const matrixCells: MatrixCellSummary[] = Array.isArray(data.matrix?.cells)
        ? data.matrix.cells.map((c: { scenario?: { id?: string } }) => ({
            scenarioId: c.scenario?.id || "cell",
            status: "captured" as const,
            scoreDelta: 0,
            focusRegressed: false,
            structureRegressed: false,
          }))
        : [];
      const cells = proofCells.length ? proofCells : matrixCells;
      const proofMode = data.meta?.proofMode === "baseline-compare" ? "baseline-compare" : "capture-only";
      setMatrixProof({
        status: proofMode === "baseline-compare" ? (data.proof?.status ?? "review") : "captured",
        matchedCells: proofMode === "baseline-compare" ? (data.proof?.matchedCells ?? 0) : 0,
        skippedCells: data.proof?.skippedCells ?? data.meta?.authCellsDropped ?? 0,
        cells,
        cellCount: data.meta?.cellCount ?? cells.length,
        authStorage: Boolean(data.meta?.authStorage),
        authCellsDropped: data.meta?.authCellsDropped ?? 0,
        proofMode,
        note: data.meta?.note,
      });
      setMatrixState("done");
      const authNote =
        data.meta?.authCellsDropped > 0
          ? ` · ${data.meta.authCellsDropped} auth cell${data.meta.authCellsDropped === 1 ? "" : "s"} skipped (no storage state)`
          : "";
      showNotice({
        tone: "success",
        title: "Scenario matrix captured",
        message: `${data.meta?.cellCount ?? cells.length} live cells · ${proofMode === "capture-only" ? "capture-only" : `overall ${data.proof?.status ?? "review"}`}${authNote}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMatrixError(message);
      setMatrixState("error");
      showNotice({ tone: "error", title: "Matrix scan failed", message });
    }
  }

  async function draftFix() {
    setDraftState("drafting");
    setDraftError("");
    try {
      const res = await fetch("/api/redesign", {
        method: "POST",
        headers: byokHeaders(),
        body: JSON.stringify({
          report,
          direction: directionPlan?.summary || directionId,
          directionPlan: directionPlan ?? undefined,
          findingId: selectedFinding?.id,
          dna: brandDna ?? undefined,
          setupJobId: captureBelongsToSetup ? setupJob?.id : undefined,
        }),
      });
      if (!res.ok) throw new Error("redesign request failed");
      const payload = (await res.json()) as RedesignProposal & {
        sourceContext?: SourceContext;
        patchSource?: "cursor" | "deterministic";
      };
      setProposal({
        ...payload,
        reconciliation: payload.reconciliation ?? reconciliation,
      });
      setSourceContext(payload.sourceContext ?? null);
      setPatchSource(payload.patchSource ?? "deterministic");
      setDraftState("ready");
    } catch {
      const files = buildOverridesPatch(reconciliation, report.capture.url);
      setProposal({
        findingId: selectedFinding?.id,
        direction: {
          id: reconciliation.directionId,
          label: reconciliation.label,
          keywords: [],
          tokenOverrides: { "--dp-accent": reconciliation.accentAfter, "--dp-paper": reconciliation.surfaceAfter },
          summary: reconciliation.summary,
        },
        reconciliation,
        files,
      });
      setPatchSource("deterministic");
      setDraftState("ready");
      setDraftError("Cursor-backed draft was unavailable, so Design Proof used the deterministic patch.");
    }
  }

  async function provePatch() {
    if (!proposal || !setupJob?.id || !captureBelongsToSetup) {
      await copyPatch(true);
      return;
    }
    const patch = proposal.files.map((file) => file.unifiedDiff).join("\n\n");
    setProofError("");
    setProofResult(null);
    setProofState("applying");
    showNotice({
      tone: "info",
      title: "Visual worktree started",
      message: `Applying ${proposal.files.length} source patch${proposal.files.length === 1 ? "" : "es"} to the disposable checkout.`,
    });
    try {
      // The endpoint applies, waits for HMR, then recaptures the running product.
      setProofState("verifying");
      const res = await fetch("/api/proof/apply", {
        method: "POST",
        headers: byokHeaders(),
        body: JSON.stringify({ jobId: setupJob.id, patch, beforeReport: report }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "The visual proof run failed.");
      const result = payload as ProofResult;
      setProofResult(result);
      setProofState(result.status);
      setSeam(50);
      showNotice({
        tone: result.status === "passed" ? "success" : result.status === "failed" ? "error" : "info",
        title: result.status === "passed" ? "Verified against rendered truth" : "Human review required",
        message: result.status === "passed"
          ? `The live recapture improved by ${Math.abs(result.proof.scoreDelta)} points with no focus regression.`
          : "Design Proof kept the change isolated and surfaced the measured tradeoffs for review.",
      });
    } catch (error) {
      setProofState("error");
      setProofError(error instanceof Error ? error.message : String(error));
      showNotice({
        tone: "error",
        title: "Proof run stopped",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function revertProof() {
    if (!setupJob?.id) return;
    try {
      const res = await fetch("/api/proof/revert", {
        method: "POST",
        headers: byokHeaders(),
        body: JSON.stringify({ jobId: setupJob.id }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Could not revert the proof patch.");
      if (!payload.reverted) throw new Error("Design Proof could not find an applied proof patch to revert.");
      setProofResult(null);
      setProofState("idle");
      setProofError("");
      showNotice({
        tone: "success",
        title: "Worktree restored",
        message: "The temporary source patch was reverted. Your original repository was never touched.",
      });
    } catch (error) {
      setProofError(error instanceof Error ? error.message : String(error));
    }
  }

  function markIntentional() {
    if (!selectedFinding) return;
    setReport((current) => {
      const verdicts = current.verdicts.map((item) =>
        item.findingId === selectedFinding.id
          ? { ...item, verdict: "intentional" as const, confidence: 1, rationale: "Accepted as an intentional product decision in this review." }
          : item,
      );
      return {
        ...current,
        verdicts,
        score: {
          ...current.score,
          generic: verdicts.filter((item) => item.verdict === "generic").length,
          drift: verdicts.filter((item) => item.verdict === "drift").length,
          intentional: verdicts.filter((item) => item.verdict === "intentional").length,
          uncertain: verdicts.filter((item) => item.verdict === "uncertain").length,
        },
      };
    });
    showNotice({
      tone: "success",
      title: "Decision recorded",
      message: `${selectedFinding.detector} is now treated as intentional for this review.`,
    });
  }

  async function copyPatch(applyIntent = false) {
    if (!proposal) return;
    const patch = proposal.files.map((file) => file.unifiedDiff).join("\n\n");
    const cursorHandoff = [
      `Design Proof generated a UI fix for ${report.capture.url}.`,
      "",
      "Apply this unified diff in the matching local repository, then run the app and verify the affected route visually.",
      sourceContext?.mode === "repo"
        ? `Source context: ${sourceContext.filesLoaded}/${sourceContext.filesDiscovered} files loaded from the disposable checkout; ${sourceContext.matchedFiles} files matched rendered evidence.`
        : "Source context: generated from rendered capture only. Check paths before applying if your local repo differs.",
      "",
      "```diff",
      patch,
      "```",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(applyIntent ? cursorHandoff : patch);
      setDraftState("copied");
      setDraftError(applyIntent ? "Cursor handoff copied. Paste it into Cursor chat in the target repo and ask the Agent to apply it." : "");
      showNotice({
        tone: "success",
        title: applyIntent ? "Ready for Cursor" : "Patch copied",
        message: applyIntent
          ? "The clipboard now contains a Cursor-ready prompt plus the unified diff."
          : "The unified diff is on your clipboard.",
      });
    } catch {
      setDraftError("Clipboard access was blocked. Select and copy the patch manually.");
      setDraftState("error");
    }
  }


  const studioBriefHref = (() => {
    const q = new URLSearchParams(serializeDesignControls(designControls));
    if (designBrief) q.set("brief", designBrief);
    const qs = q.toString();
    return qs ? `/studio?${qs}` : "/studio";
  })();

  const showProofWorkflow = Boolean(proposal) || proofState !== "idle";
  const showStateProbes = selectedFinding?.detector === "StateGap";

  const findingVerdict = (id: string) => verdictOf(id);

  const statusTone: "idle" | "working" | "live" | "error" = operationActive
    ? "working"
    : captureMeta?.live
      ? "live"
      : captureMeta?.error
        ? "error"
        : "idle";
  const statusLabel = operationActive
    ? "Working"
    : captureMeta?.live
      ? "Live capture"
      : offlineDemo
        ? "Offline fixture"
        : captureMeta?.error
          ? "Capture failed"
          : designBrief
            ? "Direction primed"
            : "Ready";

  const verdictCounts = useMemo<Record<Verdict, number>>(() => {
    const counts: Record<Verdict, number> = { generic: 0, drift: 0, intentional: 0, uncertain: 0 };
    for (const finding of report.findings) counts[verdictOf(finding.id)] += 1;
    return counts;
  }, [report, verdictOf]);

  const filteredFindings = useMemo(
    () =>
      findingFilter === "all"
        ? report.findings
        : report.findings.filter((finding) => verdictOf(finding.id) === findingFilter),
    [report, findingFilter, verdictOf],
  );

  const criticPane = (
    <div className="dp-critic">
      <header className="dp-critic__head">
        <span className="dp-critic__status">
          <span className="dp-critic__status-dot" data-tone={statusTone} aria-hidden />
          <span className="dp-critic__status-label">{statusLabel}</span>
          {report.findings.length ? <span className="text-muted">· {report.score.total} findings</span> : null}
        </span>
        <div className="dp-critic__head-actions">
          {captureState === "done" && report.findings.length > 0 ? (
            <button
              type="button"
              onClick={shareReport}
              disabled={sharingReport || operationActive}
              className="dp-ghost-btn"
            >
              <Link2 className="h-3.5 w-3.5" aria-hidden />
              {sharingReport ? "Sharing…" : shareUrl ? "Copy link" : "Share"}
            </button>
          ) : null}
        </div>
      </header>

      <div className="dp-critic__tabs" role="tablist" aria-label="Review panes">
        <button
          type="button"
          role="tab"
          aria-selected={criticTab === "findings"}
          className="dp-critic__tab"
          data-active={criticTab === "findings" ? "true" : "false"}
          onClick={() => setCriticTab("findings")}
        >
          Findings
          <span className="dp-critic__tab-count">{report.findings.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={criticTab === "direction"}
          className="dp-critic__tab"
          data-active={criticTab === "direction" ? "true" : "false"}
          onClick={() => setCriticTab("direction")}
        >
          Direction
          {directionPlan ? <span className="dp-critic__tab-count">●</span> : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={criticTab === "proof"}
          className="dp-critic__tab"
          data-active={criticTab === "proof" ? "true" : "false"}
          onClick={() => setCriticTab("proof")}
        >
          Proof
          {showProofWorkflow ? <span className="dp-critic__tab-count">●</span> : null}
        </button>
      </div>

      <div className="dp-critic__panes">
        {criticTab === "findings" ? (
          <div className="dp-critic__pane dp-critic__pane--findings">
            {designBrief && !captureMeta ? (
              <p className="dp-critic__note">
                Direction is primed. Capture a rendered URL to attach named tells, or{" "}
                <a className="text-accent underline-offset-2 hover:underline" href={studioBriefHref}>
                  open it in Studio
                </a>
                .
              </p>
            ) : null}

            {report.findings.length ? (
              <div className="dp-findings">
                <div className="dp-findings__filters" role="group" aria-label="Filter findings by verdict">
                  {FINDING_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className="dp-filter"
                      data-active={findingFilter === filter.id ? "true" : "false"}
                      aria-pressed={findingFilter === filter.id}
                      onClick={() => setFindingFilter(filter.id)}
                    >
                      {filter.label}
                      {filter.id === "all" ? ` ${report.findings.length}` : ` ${verdictCounts[filter.id]}`}
                    </button>
                  ))}
                </div>
                <ul className="dp-findings__list">
                  {filteredFindings.map((finding) => (
                    <li key={finding.id}>
                      <button
                        type="button"
                        className="dp-finding"
                        data-active={selectedId === finding.id ? "true" : "false"}
                        aria-current={selectedId === finding.id ? "true" : undefined}
                        onClick={() => setSelectedId(finding.id)}
                      >
                        <span
                          className="dp-finding__dot"
                          data-verdict={findingVerdict(finding.id)}
                          aria-hidden
                        />
                        <span className="dp-finding__name">{finding.detector}</span>
                        <VerdictBadge verdict={findingVerdict(finding.id)} />
                      </button>
                    </li>
                  ))}
                  {!filteredFindings.length ? (
                    <li className="px-2 py-3 font-mono text-meta text-muted">
                      No findings in this band.
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : (
              <div className="dp-empty">
                <p>Capture a rendered page to name the tells — or load the offline fixture.</p>
              </div>
            )}

            {selectedFinding && verdict ? (
              <section className="dp-inspector" aria-label={`Selected finding: ${selectedFinding.detector}`}>
                <div className="dp-inspector__head">
                  <h2 className="dp-inspector__title">{selectedFinding.detector}</h2>
                  <VerdictBadge verdict={verdict.verdict} />
                </div>
                <div className="dp-inspector__body">
                  <ConfidenceMeter value={verdict.confidence} />
                  <p className="dp-inspector__rationale">{verdict.rationale}</p>
                  {selectedFinding.evidence.length ? (
                    <ul className="dp-evidence">
                      {selectedFinding.evidence.map((evidence) => (
                        <li key={`${evidence.label}-${evidence.value}`}>
                          <span className="dp-evidence__label">{evidence.label}</span>
                          <span>{evidence.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {showStateProbes && report.capture.stateShots.length > 0 ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer font-mono text-meta text-muted hover:text-secondary">
                        State probes
                      </summary>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {report.capture.stateShots.slice(0, 9).map((shot) => (
                          <li
                            key={`${shot.selector}-${shot.state}`}
                            className="rounded-sm border border-border px-2 py-0.5 font-mono text-meta text-secondary"
                          >
                            {shot.state}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
                {proposal ? (
                  <div className="dp-ready-strip">
                    <span>
                      Patch ready · {proposal.files.length} file{proposal.files.length === 1 ? "" : "s"}
                    </span>
                    <button type="button" onClick={() => setCriticTab("proof")}>
                      Review patch →
                    </button>
                  </div>
                ) : null}
                {draftError ? <p className="dp-inspector__error">{draftError}</p> : null}
                <div className="dp-inspector__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setCriticTab("proof");
                      void draftFix();
                    }}
                    disabled={draftState === "drafting" || operationActive}
                    className="dp-btn dp-btn--primary"
                  >
                    <Wand2 className="h-4 w-4" aria-hidden />
                    {draftState === "drafting"
                      ? "Mapping source…"
                      : setupJob?.state === "ready"
                        ? "Plan source fix"
                        : "Draft fix"}
                  </button>
                  <button type="button" onClick={markIntentional} className="dp-btn dp-btn--quiet">
                    Mark intentional
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {criticTab === "direction" ? (
          <div className="dp-critic__pane">
            <section className="dp-panel">
              <div className="dp-panel__head">
                <p className="dp-panel__title">Art direction</p>
                {directionPlan ? (
                  <span className="font-mono text-meta text-muted">
                    {resolveDirection(directionPlan.presetId).label.toLowerCase()}
                    {directionParsing ? " · thinking…" : null}
                  </span>
                ) : null}
              </div>
              <div className="dp-panel__body space-y-3">
                {designBrief ? (
                  <p className="font-mono text-meta text-secondary">
                    Brief: {designBrief}
                    {" · "}
                    <a className="text-accent underline-offset-2 hover:underline" href={studioBriefHref}>
                      Studio
                    </a>
                  </p>
                ) : null}
                <div className="dp-form-field">
                  <span className="dp-form-field__label">Say it in plain English</span>
                  <div className="dp-voice">
                    {voice.supported ? (
                      <button
                        type="button"
                        onClick={voice.listening ? voice.stop : voice.start}
                        aria-label={voice.listening ? "Stop listening" : "Start voice direction"}
                        className="dp-voice__mic"
                        data-listening={voice.listening ? "true" : "false"}
                      >
                        {voice.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                    ) : null}
                    <textarea
                      value={voice.transcript}
                      onChange={(event) => {
                        voice.setTranscript(event.target.value);
                        scheduleDirectionParse(event.target.value);
                      }}
                      rows={2}
                      placeholder={voice.listening ? "Listening…" : "Warmer, more editorial, less shadow…"}
                      className="dp-voice__input"
                      aria-label="Direction in plain English"
                    />
                  </div>
                </div>
                <div className="dp-chips" role="group" aria-label="Direction presets">
                  {PRESET_CHIPS.map((chip) => {
                    const active = directionId === chip.key;
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        className="dp-chip"
                        data-active={active ? "true" : "false"}
                        onClick={() => {
                          const preset = DIRECTION_PRESETS[chip.key as keyof typeof DIRECTION_PRESETS];
                          const text = preset?.summary ?? chip.label;
                          voice.setTranscript(text);
                          const plan = parseDirectionPlan(text);
                          applyDirectionPlan(plan);
                          learnFromDirection(plan, text);
                        }}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
                {directionPlan?.actionItems.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {directionPlan.actionItems.map((item) => (
                      <li key={item.id} className="font-mono text-meta text-muted">
                        {item.label}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>

            <details className="dp-panel">
              <summary className="dp-panel__head cursor-pointer list-none">
                <span className="dp-panel__title">More — brand DNA &amp; measured change</span>
                <span className="font-mono text-meta text-muted">expand</span>
              </summary>
              <div className="dp-panel__body space-y-3">
                <BrandDnaBar dna={brandDna} onLearn={learnDna} onClear={clearDna} live={liveCapture} />
                {!proofResult ? <Scorecard reconciliation={reconciliation} live={liveCapture} /> : null}
                {!proofResult ? (
                  <WhatChangedList
                    notes={
                      llmRestyle.mode === "ai" && llmRestyle.sheet?.notes.length
                        ? llmRestyle.sheet.notes
                        : reconciliation?.directionNotes ?? []
                    }
                  />
                ) : null}
                {!proofResult ? (
                  <ReconciliationTable reconciliation={reconciliation} live={liveCapture} />
                ) : null}
              </div>
            </details>
          </div>
        ) : null}

        {criticTab === "proof" ? (
          <div className="dp-critic__pane">
            <WorkflowRail
              captured={liveCapture}
              sourceMapped={sourceContext?.mode === "repo" && sourceContext.filesLoaded > 0}
              patchReady={Boolean(proposal)}
              proofState={proofState}
            />

            {proposal ? (
              <DiffViewer
                proposal={proposal}
                draftState={draftState}
                sourceContext={sourceContext}
                patchSource={patchSource}
                proofState={proofState}
                proofError={proofError}
                canProve={captureBelongsToSetup}
                onCopy={() => copyPatch()}
                onApply={provePatch}
              />
            ) : (
              <div className="dp-empty">
                <p>
                  Nothing drafted yet. Pick a finding, then <strong className="text-text">Draft fix</strong> to
                  see the patch and its measured changes here.
                </p>
              </div>
            )}

            <ConnectAgent />
          </div>
        ) : null}
      </div>
    </div>
  );

  const canvasPane = (
    <div className="dp-canvas">
      <div className="dp-canvas__bar">
        <label className="dp-canvas__target">
          {isRepo ? (
            <Github className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          ) : (
            <span className="dp-canvas__target-icon" aria-hidden>
              URL
            </span>
          )}
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !operationActive) onPrimary();
            }}
            disabled={operationActive}
            spellCheck={false}
            data-testid="capture-url"
            aria-label="URL to capture or GitHub repo to run"
            className="dp-canvas__input"
            placeholder="https://your-app.com  ·  or  github.com/owner/repo"
          />
        </label>
        <button
          type="button"
          onClick={onPrimary}
          disabled={operationActive}
          data-testid="capture-submit"
          className="dp-btn dp-btn--primary"
        >
          {setupActive ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Setting up…
            </>
          ) : captureState === "capturing" ? (
            "Capturing…"
          ) : isRepo ? (
            <>
              <Github className="h-4 w-4" aria-hidden /> Set up &amp; run
            </>
          ) : (
            "Capture"
          )}
        </button>
        <div className="dp-canvas__meta">
          <span className="dp-badge" data-tone="accent">
            direction: {dirMeta.id}
          </span>
          {hasProofSurface ? <span>{report.score.total} findings</span> : null}
        </div>
      </div>

      {designBrief && !liveCapture ? (
        <div className="dp-critic__note">
          Paste a live URL or GitHub repo above to ground this direction
          {" · "}
          <a className="text-accent underline-offset-2 hover:underline" href={studioBriefHref}>
            Open in Studio
          </a>
        </div>
      ) : null}

      {isRepo && !setupJob ? (
        <p className="flex items-center gap-2 font-mono text-meta text-secondary">
          <Github className="h-3.5 w-3.5 text-accent" aria-hidden />
          Design Proof clones this repo, reads its README to find the run command, starts it, and captures the
          localhost URL for you.
        </p>
      ) : null}

      {setupError ? (
        <div className="rounded-card border border-drift/40 bg-drift/10 px-4 py-3 text-sm text-drift">
          {setupError}
        </div>
      ) : null}

      {setupJob ? (
        <SetupPanel
          job={setupJob}
          onRetry={() => startSetup(setupJob.repoUrl)}
          onStop={stopApp}
          onCaptureManual={(u) => {
            setInputUrl(u);
            void runCapture(u);
          }}
        />
      ) : null}

      {needsRecapture ? (
        <div className="rounded-card border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-secondary">
          URL changed to <span className="font-mono text-text">{inputUrl.trim()}</span> — click{" "}
          <strong className="text-text">Capture</strong> to rescan.
        </div>
      ) : null}

      {liveCapture ? (
        <PagesStrip
          pages={pages}
          activeUrl={report.capture.url}
          capturing={captureState === "capturing"}
          scanningAll={scanningAll}
          pageInput={pageInput}
          setPageInput={setPageInput}
          onSelect={(u) => runCapture(u)}
          onAdd={addPage}
          onScanAll={scanAllPages}
        />
      ) : null}

      <section className="dp-stage">
        <div className="dp-stage__head">
          <h2 className="dp-stage__title" aria-live="polite">
            {canvasTitle}
          </h2>
          {hasProofSurface ? <span className="dp-canvas__meta">{scoreLine}</span> : null}
        </div>
        <div className={hasProofSurface ? "dp-stage__body--flush" : "dp-stage__body"}>
          {operationActive ? (
            <div className="p-4">
              <OperationPlaceholder title={operationTitle} detail={operationDetail} />
            </div>
          ) : !hasProofSurface ? (
            <div className="p-4">
              <div className="dp-empty" style={{ minHeight: "16rem" }}>
                <div>
                  <p className="font-display text-2xl text-text">
                    {captureMeta?.error ? "Capture did not land" : designBrief ? "Ground the brief" : "No capture yet"}
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
                    {captureMeta?.error
                      ? captureMeta.error
                      : designBrief
                        ? "Paste a live URL or GitHub repo to attach findings and the before/after seam — Design Proof will not invent the demo site."
                        : "Paste a live URL and capture. The offline fixture loads only from Offline mode."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setComposerMode("offline");
                        loadOfflineFixture();
                      }}
                      className="dp-btn dp-btn--quiet"
                    >
                      <FileCode2 className="h-4 w-4" aria-hidden /> Load offline fixture
                    </button>
                    <a className="dp-btn dp-btn--quiet" href={studioBriefHref}>
                      <Sparkles className="h-4 w-4" aria-hidden /> Open Studio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <BeforeAfterSeam
              seam={seam}
              setSeam={setSeam}
              findings={report.findings}
              reconciliation={reconciliation}
              selectedId={selectedId}
              onSelectFinding={(id) => {
                setSelectedId(id);
                setCriticTab("findings");
              }}
              snapshotHtml={report.capture.snapshotHtml || undefined}
              screenshotBase64={report.capture.screenshotBase64 || undefined}
              llmStatus={llmRestyle.status}
              llmSheet={llmRestyle.sheet}
              llmMode={llmRestyle.mode}
              onLlmModeChange={llmRestyle.setMode}
            />
          )}
        </div>
      </section>

      {liveCapture ? (
        <ScenarioMatrixPanel
          state={matrixState}
          proof={matrixProof}
          error={matrixError}
          disabled={operationActive || matrixState === "scanning"}
          onScan={() => {
            void scanScenarioMatrix();
          }}
        />
      ) : null}

      {proofResult ? (
        <VerifiedProofPanel
          baseline={report}
          result={proofResult}
          seam={seam}
          setSeam={setSeam}
          onRevert={revertProof}
          onCopy={() => {
            void copyPatch();
          }}
        />
      ) : null}
    </div>
  );


  return (
    <>
      <AppShell
        rail={
          <ProductSidebar
            active="home"
            onHome={goHome}
            onSettings={() => setSettingsOpen(true)}
            sessions={openTabs}
            activeSessionId={shellView === "project" ? sessionId : undefined}
            onSelectSession={(id) => {
              const tab = openTabs.find((t) => t.id === id);
              if (!tab) return;
              setSessionId(tab.id);
              setSessionTitle(tab.title);
              setShellView("project");
            }}
            onCloseSession={closeTab}
            focusCanvas={focusCanvas}
            onToggleFocus={shellView === "project" ? () => setFocusCanvas((v) => !v) : undefined}
          />
        }
      >
        {shellView === "home" ? (
          <EntryHome
            mode={composerMode}
            onModeChange={(m) => {
              setComposerMode(m);
              if (m === "url" && !composerValue) setComposerValue("");
              if (m === "offline") setComposerValue("");
            }}
            value={composerValue}
            onChange={setComposerValue}
            onSubmit={startFromComposer}
            submitting={operationActive}
            recent={recent}
            onOpenRecent={openRecent}
            showAllRecent={showAllRecent}
            onToggleShowAll={() => setShowAllRecent((v) => !v)}
            designControls={designControls}
            onDesignControlsChange={setDesignControls}
          />
        ) : (
          <ProjectWorkspace
            critic={criticPane}
            canvas={canvasPane}
            focusCanvas={focusCanvas}
            mobilePane={mobilePane}
            onMobilePane={setMobilePane}
          />
        )}
      </AppShell>
      {operationActive ? <OperationCurtain title={operationTitle} detail={operationDetail} /> : null}
      {uiNotice ? <ToastNotice notice={uiNotice} onClose={() => setUiNotice(null)} /> : null}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
