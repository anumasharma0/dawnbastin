"use client";

import { useState, useEffect, useRef } from "react";
import {
  RefreshCw, Download, Share2, Info, Shield,
  Activity, X, Loader2, AlertOctagon, ChevronDown,
} from "lucide-react";
import { ScanResult, Severity } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import SandboxPipelineCard from "./SandboxPipelineCard";
import { cn } from "@/lib/utils";

interface ScanResultsViewProps {
  file: File;
  onNewScan?: () => void;
}

type BottomTab  = "Vulnerabilities" | "Behaviors" | "Network Threats" | "Files Modified" | "Reputation";
type SevFilter  = "all" | Severity;
type Phase = "uploading" | "queued" | "running" | "done" | "error";

interface VTContact {
  domain?: string;
  ip?: string;
  detections: number;
  total_vendors: number;
  created?: string | null;
  asn?: number | null;
  country?: string | null;
}

interface VTResult {
  found: boolean;
  sha256?: string;
  md5?: string;
  meaningful_name?: string | null;
  size?: number;
  tags?: string[];
  last_analysis_date?: number | null;
  stats?: {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
    timeout: number;
    total: number;
  };
  contacted_domains?: VTContact[];
  contacted_ips?: VTContact[];
}

const BOTTOM_TABS: BottomTab[] = ["Vulnerabilities", "Behaviors", "Network Threats", "Files Modified", "Reputation"];

const SEV_COLORS: Record<Severity, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#34d399",
  info:     "var(--ar-cyan)",
};

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 120_000;

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// One persistent page for the whole scan lifecycle: uploads the file, polls
// the sandbox for status + a live log tail, and — without ever navigating
// away — swaps the main pane from "live log" to "vulnerabilities table" and
// fills in the right-hand results panel the moment the sandbox reports done.
export default function ScanResultsView({ file, onNewScan }: ScanResultsViewProps) {
  const [phase, setPhase]         = useState<Phase>("uploading");
  const [uploadInfo, setUploadInfo] = useState<{ fileName: string; md5: string; sha256: string } | null>(null);
  const [result, setResult]       = useState<ScanResult | null>(null);
  const [tailText, setTailText]   = useState("");
  const [errorMsg, setErrorMsg]   = useState("");
  const [elapsed, setElapsed]     = useState(0);

  const [bottomTab,  setBottomTab]  = useState<BottomTab>("Vulnerabilities");
  const [sevFilter,  setSevFilter]  = useState<SevFilter>("all");
  const [filterText, setFilterText] = useState("");
  const [onlyImportant, setOnlyImportant] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [vtStatus, setVtStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [vtData, setVtData]     = useState<VTResult | null>(null);
  const [vtError, setVtError]   = useState("");

  const logBoxRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    // React 18 Strict Mode (on by default in Next.js dev) mounts every
    // component twice to surface exactly this class of bug: without a real
    // AbortController, the throwaway first mount's fetch still completes in
    // the background, submitting the file a second time for real. Every
    // fetch below is tied to this controller so cleanup actually cancels it
    // instead of just ignoring its result.
    const controller = new AbortController();
    const startedAt = Date.now();
    const tick = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
      1000
    );

    const run = async () => {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd, signal: controller.signal });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        if (cancelledRef.current) return;

        setUploadInfo({
          fileName: uploadData.fileName,
          md5: uploadData.md5,
          sha256: uploadData.sha256,
        });
        setPhase("queued");

        const fileName = uploadData.fileName as string;
        const deadline = Date.now() + POLL_TIMEOUT_MS;

        while (Date.now() < deadline) {
          if (cancelledRef.current) return;

          const [scanRes, tailRes] = await Promise.all([
            fetch("/api/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName }),
              signal: controller.signal,
            }),
            fetch(`/api/tail?fileName=${encodeURIComponent(fileName)}`, { cache: "no-store", signal: controller.signal }),
          ]);

          const scanData = await scanRes.json();
          if (!scanRes.ok) throw new Error(scanData.error || "Scan failed");

          if (tailRes.ok) {
            const tailData = await tailRes.json();
            const combined = [tailData.execution_log, tailData.analysis_output]
              .filter(Boolean)
              .join("\n\n");
            if (combined) setTailText(combined);
          }

          if (cancelledRef.current) return;

          if (scanData.status === "running") setPhase("running");

          if (scanData.status === "error") {
            // Terminal: the sandbox's worker failed to dispatch this job
            // (agent unreachable, no VM, transfer failed) — surface it now
            // instead of polling until the client-side timeout below.
            throw new Error(scanData.error || "Sandbox could not dispatch this sample.");
          }

          if (scanData.status === "done") {
            setResult(scanData as ScanResult);
            setPhase("done");
            clearInterval(tick);
            return;
          }
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }

        throw new Error("Sandbox analysis timed out after 2 minutes.");
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        if (!cancelledRef.current) {
          setPhase("error");
          setErrorMsg(err.message ?? "Scan failed");
        }
      }
    };

    run();

    return () => {
      cancelledRef.current = true;
      controller.abort();
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    if (phase === "done") return;
    logBoxRef.current?.scrollTo({ top: logBoxRef.current.scrollHeight });
  }, [tailText, phase]);

  // VirusTotal reputation lookup — runs as soon as the hash is known,
  // independent of the sandbox's own dynamic-analysis lifecycle.
  useEffect(() => {
    if (!uploadInfo?.sha256) return;
    const controller = new AbortController();

    setVtStatus("loading");
    fetch(`/api/vt?hash=${encodeURIComponent(uploadInfo.sha256)}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "VirusTotal lookup failed");
        setVtData(data);
        setVtStatus("done");
      })
      .catch((err: any) => {
        if (err?.name === "AbortError") return;
        setVtError(err.message ?? "VirusTotal lookup failed");
        setVtStatus("error");
      });

    return () => controller.abort();
  }, [uploadInfo?.sha256]);

  const done = phase === "done" && result !== null;
  const displayName = uploadInfo?.fileName ?? file.name;
  const md5 = uploadInfo?.md5 ?? "pending...";

  const visibleVulns = (result?.vulnerabilities ?? []).filter((v) => {
    if (sevFilter !== "all" && v.severity !== sevFilter) return false;
    if (onlyImportant && v.severity !== "critical" && v.severity !== "high") return false;
    if (filterText && !v.title.toLowerCase().includes(filterText.toLowerCase()) && !v.id.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  // Condensed progress trail — just the "STEP n" markers from the sandbox's
  // own log/report, not the full verbose dump.
  const stepLines = tailText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /STEP\s*\d+/i.test(l))
    .filter((l, i, arr) => arr.indexOf(l) === i);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--ar-bg)" }}>

      {/* ── Top status bar ── */}
      <div
        className="flex items-center gap-4 px-5 py-2 flex-shrink-0 text-xs"
        style={{ background: "var(--ar-sidebar)", borderBottom: "1px solid var(--ar-border)" }}
      >
        {done ? (
          <span
            className="font-semibold"
            style={{ color: result!.summary.critical > 0 ? "#ef4444" : result!.summary.high > 0 ? "#f97316" : "#34d399" }}
          >
            {result!.summary.critical > 0
              ? `${result!.summary.critical} critical threat${result!.summary.critical > 1 ? "s" : ""} detected`
              : result!.summary.total > 0
              ? `${result!.summary.total} issue${result!.summary.total > 1 ? "s" : ""} detected`
              : "No threats detected"}
          </span>
        ) : (
          <span
            className="flex items-center gap-2 font-semibold"
            style={{ color: phase === "error" ? "#ef4444" : "var(--ar-cyan)" }}
          >
            {phase !== "error" && <Loader2 size={13} className="animate-spin" />}
            {phase === "uploading" && "Uploading file..."}
            {phase === "queued" && "Queued for sandbox analysis..."}
            {phase === "running" && "Running in sandbox — executing and correlating Sysmon events..."}
            {phase === "error" && (errorMsg || "Scan failed")}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1 mr-1" style={{ color: "var(--ar-muted)" }}>
            <Activity size={11} style={{ color: "#34d399" }} />
            {fmtTime(elapsed)}
          </span>
          <button
            onClick={onNewScan}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors"
            style={{ color: "var(--ar-muted)", border: "1px solid var(--ar-border)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "var(--ar-card-2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ar-muted)"; e.currentTarget.style.background = ""; }}
          >
            {done ? <RefreshCw size={12} /> : <X size={12} />}
            {done ? "New analysis" : "Cancel"}
          </button>
          {done && (
            <>
              <button
                className="p-1.5 rounded transition-colors"
                style={{ color: "var(--ar-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "var(--ar-card-2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ar-muted)"; e.currentTarget.style.background = ""; }}
              >
                <Download size={14} />
              </button>
              <button
                className="p-1.5 rounded transition-colors"
                style={{ color: "var(--ar-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "var(--ar-card-2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ar-muted)"; e.currentTarget.style.background = ""; }}
              >
                <Share2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Main split ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ══ Left: live pipeline — every row driven by the real log tail,
              not a fixed-duration animation. Detailed results still live in
              the right panel and the expandable bottom tab. ══ */}
        <div
          className="flex-1 scan-empty-bg flex items-start justify-center overflow-y-auto p-6"
          style={{ borderRight: "1px solid var(--ar-border)" }}
        >
          <SandboxPipelineCard
            fileName={displayName}
            phase={phase}
            tailText={tailText}
            elapsed={elapsed}
            totalFindings={done ? result!.summary.total : undefined}
            errorMsg={errorMsg}
            onCancel={onNewScan}
          />
        </div>

        {/* ══ Right: file info + live log / vuln list ══ */}
        <div className="w-[340px] flex-shrink-0 flex flex-col overflow-hidden">

          {/* File info */}
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--ar-border)" }}>
            <div className="flex items-start gap-3">
              {/* Windows icon */}
              <div
                className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(23,162,232,0.15)", border: "1px solid rgba(23,162,232,0.3)" }}
              >
                <svg width="20" height="20" viewBox="0 0 88 88">
                  <rect x="0"  y="0"  width="40" height="40" fill="var(--ar-cyan)"/>
                  <rect x="48" y="0"  width="40" height="40" fill="var(--ar-cyan)"/>
                  <rect x="0"  y="48" width="40" height="40" fill="var(--ar-cyan)"/>
                  <rect x="48" y="48" width="40" height="40" fill="var(--ar-cyan)"/>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium truncate" style={{ color: "var(--ar-cyan)" }}>
                  {displayName}
                </p>
                <p className="text-[10px] font-mono mt-1 truncate" style={{ color: "var(--ar-muted)" }}>
                  MD5: {md5}
                </p>
                <p className="text-[10px] font-mono" style={{ color: "var(--ar-muted)" }}>
                  Total time: {fmtTime(elapsed)} s
                </p>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button className="p-1 transition-colors" style={{ color: "var(--ar-muted)" }}>
                  <Info size={14} />
                </button>
                <button className="p-1 transition-colors" style={{ color: "var(--ar-muted)" }}>
                  <Share2 size={14} />
                </button>
                <button className="p-1 transition-colors" style={{ color: "var(--ar-muted)" }}>
                  <Download size={14} />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: done ? "#34d399" : phase === "error" ? "#ef4444" : "var(--ar-cyan)" }}>
              {!done && phase !== "error" && <Loader2 size={10} className="animate-spin" />}
              {phase === "uploading" && "Uploading file..."}
              {phase === "queued" && "Queued for sandbox analysis..."}
              {phase === "running" && "Running in sandbox..."}
              {phase === "done" && "Analysis complete"}
              {phase === "error" && (errorMsg || "Scan failed")}
            </div>
          </div>

          {/* Section header */}
          <div
            className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--ar-border)" }}
          >
            <span className="text-white text-xs font-semibold">Dynamic Analysis</span>
            <span
              className="text-[10px] px-1.5 rounded font-mono"
              style={{ background: "rgba(30,136,229,0.2)", color: "var(--ar-accent)" }}
            >
              {done ? result!.summary.total : "…"}
            </span>
            <div className="flex-1" />
            <input
              type="text"
              placeholder="Filter by ID or name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              disabled={!done}
              className="text-[10px] rounded px-2 py-1 outline-none transition w-32 disabled:opacity-40"
              style={{
                background: "var(--ar-bg)",
                border: "1px solid var(--ar-border)",
                color: "#fff",
              }}
            />
          </div>

          {/* Only important toggle */}
          <div
            className="flex items-center justify-end gap-2 px-3 py-1 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--ar-border)" }}
          >
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px]" style={{ color: "var(--ar-muted)" }}>
              <input
                type="checkbox"
                checked={onlyImportant}
                onChange={(e) => setOnlyImportant(e.target.checked)}
                disabled={!done}
                className="w-3 h-3"
                style={{ accentColor: "var(--ar-cyan)" }}
              />
              Only important
            </label>
          </div>

          {/* Live log while running — swaps to the vuln list the moment the sandbox finishes */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {!done ? (
              <div
                ref={logBoxRef}
                className="h-full overflow-y-auto font-mono text-[11px] p-3 space-y-1.5"
                style={{ color: "var(--ar-muted)" }}
              >
                {stepLines.length === 0 ? (
                  <span className="cursor-blink" style={{ color: "var(--ar-muted-2)" }}>
                    Waiting for sandbox to start...
                  </span>
                ) : (
                  stepLines.map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span style={{ color: "#34d399" }}>✓</span>
                      <span>{line.replace(/^\[?INFO\]?\s*/i, "")}</span>
                    </div>
                  ))
                )}
              </div>
            ) : visibleVulns.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs" style={{ color: "var(--ar-muted-2)" }}>
                No matching vulnerabilities
              </div>
            ) : (
              visibleVulns.map((vuln) => {
                const isOpen = expandedIds.has(vuln.id);
                return (
                  <div key={vuln.id} style={{ borderBottom: "1px solid rgba(26,48,80,0.5)" }}>
                    <div
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpandedIds((prev) => {
                          const next = new Set(prev);
                          next.has(vuln.id) ? next.delete(vuln.id) : next.add(vuln.id);
                          return next;
                        })
                      }
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ar-card)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: `${SEV_COLORS[vuln.severity]}20` }}
                      >
                        <Shield size={11} style={{ color: SEV_COLORS[vuln.severity] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono truncate" style={{ color: "var(--ar-muted)" }}>
                          {vuln.id} — {vuln.title}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--ar-muted-2)" }}>
                          {vuln.file}:{vuln.line}
                        </p>
                      </div>
                      <ChevronDown
                        size={12}
                        style={{ color: "var(--ar-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}
                      />
                      <SeverityBadge severity={vuln.severity} size="xs" />
                    </div>

                    {isOpen && (
                      <div
                        className="px-3 pb-3 pt-1 font-mono text-[10px] space-y-0.5 break-all"
                        style={{ background: "#0A1F33" }}
                      >
                        {vuln.snippet
                          ? vuln.snippet.split("\n").map((line, i) => (
                              <div key={i} style={{ color: "var(--ar-muted)" }}>{line}</div>
                            ))
                          : <div style={{ color: "var(--ar-muted-2)" }}>No fields reported for this event.</div>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ══ Bottom tabs ══ */}
      <div
        className="flex-shrink-0 flex flex-col"
        style={{ height: "190px", borderTop: "1px solid var(--ar-border)" }}
      >
        {/* Tab header */}
        <div
          className="flex items-center overflow-x-auto flex-shrink-0"
          style={{ borderBottom: "1px solid var(--ar-border)", background: "var(--ar-sidebar)" }}
        >
          {BOTTOM_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setBottomTab(t)}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2 text-xs font-semibold flex-shrink-0 transition-colors whitespace-nowrap",
                bottomTab === t ? "text-white" : "hover:text-white"
              )}
              style={{ color: bottomTab === t ? "#fff" : "var(--ar-muted)" }}
            >
              {t}
              {t === "Vulnerabilities" && (
                <span
                  className="text-[9px] px-1.5 rounded-full"
                  style={{ background: "var(--ar-primary-soft)", color: "var(--ar-accent)" }}
                >
                  {done ? result!.summary.total : "…"}
                </span>
              )}
              {t === "Reputation" && vtStatus === "done" && vtData?.found && (
                <span
                  className="text-[9px] px-1.5 rounded-full"
                  style={{
                    background: vtData.stats && vtData.stats.malicious > 0 ? "rgba(239,68,68,0.2)" : "rgba(52,211,153,0.2)",
                    color: vtData.stats && vtData.stats.malicious > 0 ? "#ef4444" : "#34d399",
                  }}
                >
                  {vtData.stats?.malicious ?? 0}/{vtData.stats?.total ?? 0}
                </span>
              )}
              {bottomTab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--ar-cyan)" }} />
              )}
            </button>
          ))}
          <div className="ml-auto px-2 flex-shrink-0">
            <button className="p-1" style={{ color: "var(--ar-muted-2)" }}>
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Table */}
        {bottomTab === "Vulnerabilities" ? (
          // Intentionally empty — the right-hand panel is the single source
          // of truth for results. This space is reserved for custom JSON
          // content to be wired in later.
          <div className="flex-1" />
        ) : bottomTab === "Reputation" ? (
          <div className="flex-1 overflow-y-auto min-h-0 p-4">
            {vtStatus === "idle" || vtStatus === "loading" ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-xs" style={{ color: "var(--ar-muted-2)" }}>
                <Loader2 size={20} className="animate-spin" style={{ color: "var(--ar-cyan)" }} />
                Checking VirusTotal...
              </div>
            ) : vtStatus === "error" ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-xs text-center" style={{ color: "#ef4444" }}>
                <AlertOctagon size={20} />
                {vtError}
              </div>
            ) : !vtData?.found ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-xs" style={{ color: "var(--ar-muted-2)" }}>
                <Shield size={24} className="opacity-40" />
                This hash has no existing VirusTotal report — VT only knows what's already been submitted by someone, somewhere.
              </div>
            ) : (
              <div className="flex gap-6">
                {/* Score circle */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2 w-32">
                  <div
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                    style={{
                      border: `3px solid ${(vtData.stats?.malicious ?? 0) > 0 ? "#ef4444" : "#34d399"}`,
                      color: (vtData.stats?.malicious ?? 0) > 0 ? "#ef4444" : "#34d399",
                    }}
                  >
                    <span className="text-2xl font-bold">{vtData.stats?.malicious ?? 0}</span>
                    <span className="text-[10px]" style={{ color: "var(--ar-muted)" }}>/ {vtData.stats?.total ?? 0}</span>
                  </div>
                  <span className="text-[10px] text-center" style={{ color: "var(--ar-muted)" }}>
                    security vendors flagged this
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <p className="font-mono text-xs truncate" style={{ color: "var(--ar-muted)" }}>{vtData.sha256}</p>
                    <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--ar-muted)" }}>
                      {vtData.meaningful_name ?? displayName}
                    </p>
                  </div>

                  {vtData.tags && vtData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {vtData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(23,162,232,0.15)", color: "var(--ar-accent)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-6 text-[11px]" style={{ color: "var(--ar-muted)" }}>
                    <span>Size: {vtData.size ? `${(vtData.size / 1024 / 1024).toFixed(2)} MB` : "—"}</span>
                    <span>
                      Last analysis: {vtData.last_analysis_date
                        ? new Date(vtData.last_analysis_date * 1000).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>

                  {vtData.contacted_domains && vtData.contacted_domains.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-white mb-1.5">
                        Contacted Domains ({vtData.contacted_domains.length})
                      </p>
                      <div className="rounded overflow-hidden" style={{ border: "1px solid var(--ar-border)" }}>
                        {vtData.contacted_domains.map((d) => (
                          <div
                            key={d.domain}
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-mono"
                            style={{ borderBottom: "1px solid rgba(26,48,80,0.4)", color: "var(--ar-muted)" }}
                          >
                            <span className="flex-1 truncate">{d.domain}</span>
                            <span style={{ color: d.detections > 0 ? "#ef4444" : "#34d399" }}>
                              {d.detections}/{d.total_vendors}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {vtData.contacted_ips && vtData.contacted_ips.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-white mb-1.5">
                        Contacted IP Addresses ({vtData.contacted_ips.length})
                      </p>
                      <div className="rounded overflow-hidden" style={{ border: "1px solid var(--ar-border)" }}>
                        {vtData.contacted_ips.map((ip) => (
                          <div
                            key={ip.ip}
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-mono"
                            style={{ borderBottom: "1px solid rgba(26,48,80,0.4)", color: "var(--ar-muted)" }}
                          >
                            <span className="flex-1 truncate">{ip.ip}</span>
                            <span className="mr-3" style={{ color: "var(--ar-muted)" }}>{ip.country ?? "—"}</span>
                            <span style={{ color: ip.detections > 0 ? "#ef4444" : "#34d399" }}>
                              {ip.detections}/{ip.total_vendors}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex-1 flex items-center justify-center text-xs"
            style={{ color: "var(--ar-muted-2)" }}
          >
            No {bottomTab.toLowerCase()} data available
          </div>
        )}
      </div>
    </div>
  );
}
