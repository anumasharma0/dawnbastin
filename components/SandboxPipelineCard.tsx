"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HardDriveUpload, ArrowRightCircle, Play, Activity, Send,
  Loader2, CheckCircle2, AlertTriangle, ChevronDown, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "uploading" | "queued" | "running" | "done" | "error";
type StepStatus = "done" | "running" | "pending" | "error";

interface Step {
  key: string;
  title: string;
  desc: string;
  tag: string;
  Icon: typeof HardDriveUpload;
  // Substring to look for in the raw log tail — null means "driven by phase, not the log"
  marker: string | null;
}

// Mirrors the actual markers sandbox_runner.py prints for a real run (see
// RUNBOOK.md §2.5) — one row per log line the watcher really emits, not an
// invented progress bar.
const STEPS: Step[] = [
  {
    key: "upload", title: "Upload sample", tag: "host/app.py",
    Icon: HardDriveUpload,
    desc: "Save a copy to host/uploads/ and drop it into the VM's Malware_Upload folder for the watcher to pick up.",
    marker: null,
  },
  {
    key: "handoff", title: "Hand off to sandbox", tag: "sandbox_runner.py",
    Icon: ArrowRightCircle,
    desc: "The folder watcher detects the new .exe and passes it to the execution package.",
    marker: "[HANDOFF]",
  },
  {
    key: "execute", title: "Execute in VM", tag: "exe.py",
    Icon: Play,
    desc: "The real binary runs inside the sandbox VM while Sysmon records every process, registry write, and network call.",
    marker: "exe.py completed",
  },
  {
    key: "analyze", title: "Correlate telemetry", tag: "maliciouspattern.py",
    Icon: Activity,
    desc: "Sysmon's event log is matched against the sample's own PID to isolate what it actually did.",
    marker: "[ANALYSIS]",
  },
  {
    key: "report", title: "Deliver report", tag: "host/reports/",
    Icon: Send,
    desc: "analysis_output.txt is generated and POSTed back to the host, landing as a permanent, timestamped report.",
    marker: "[REPORT]",
  },
];

const STATUS_STYLE: Record<StepStatus, { bg: string; fg: string; label: string }> = {
  done:    { bg: "rgba(52,211,153,0.15)", fg: "#34d399", label: "Done" },
  running: { bg: "rgba(23,162,232,0.15)", fg: "var(--ar-accent)", label: "Running" },
  pending: { bg: "rgba(255,255,255,0.06)", fg: "var(--ar-muted)", label: "Pending" },
  error:   { bg: "rgba(239,68,68,0.15)", fg: "#ef4444", label: "Failed" },
};

function StatusPill({ status }: { status: StepStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
      style={{ background: s.bg, color: s.fg }}
    >
      {status === "running" && <Loader2 size={11} className="animate-spin" />}
      {status === "done" && <CheckCircle2 size={11} />}
      {status === "error" && <AlertTriangle size={11} />}
      {s.label}
    </span>
  );
}

interface SandboxPipelineCardProps {
  fileName: string;
  phase: Phase;
  tailText: string;
  elapsed: number;
  totalFindings?: number;
  errorMsg?: string;
  onCancel?: () => void;
}

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function SandboxPipelineCard({
  fileName, phase, tailText, elapsed, totalFindings, errorMsg, onCancel,
}: SandboxPipelineCardProps) {
  // Frontier = how far the real pipeline has actually gotten, derived from
  // the client-side phase (step 0) plus whichever markers have shown up in
  // the live log tail (steps 1-4).
  const reached = STEPS.map((step, i) => {
    if (step.marker === null) return phase !== "uploading";
    return tailText.includes(step.marker);
  });
  if (phase === "done") reached.fill(true);

  let frontier = reached.lastIndexOf(true) + 1;
  if (frontier > STEPS.length - 1) frontier = STEPS.length - 1;

  const statusOf = (i: number): StepStatus => {
    if (reached[i]) return "done";
    if (i === frontier) return phase === "error" ? "error" : "running";
    return "pending";
  };

  const doneCount = reached.filter(Boolean).length;
  const frontierKey = STEPS[frontier]?.key;
  const [openKey, setOpenKey] = useState(frontierKey);

  // Auto-advance which row is expanded as the pipeline progresses — the
  // reader doesn't have to keep clicking to follow along.
  useEffect(() => { setOpenKey(frontierKey); }, [frontierKey]);

  return (
    <div className="w-full max-w-[460px] rounded-2xl overflow-hidden shadow-xl"
      style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ background: "var(--ar-card-2)" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <p className="text-white font-bold text-sm truncate">Sandbox plan</p>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.08)", color: "var(--ar-muted)" }}>
            {STEPS.length} steps
          </span>
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: "var(--ar-muted)" }}>
          {doneCount} of {STEPS.length} complete
        </span>
      </div>

      {/* File strip */}
      <div className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono truncate"
        style={{ borderBottom: "1px solid var(--ar-border)", color: "var(--ar-cyan)" }}>
        {fileName}
      </div>

      {/* Accordion rows */}
      <div>
        {STEPS.map((step, i) => {
          const status = statusOf(i);
          const isOpen = openKey === step.key;
          return (
            <div key={step.key} style={{ borderBottom: i < STEPS.length - 1 ? "1px solid var(--ar-border)" : undefined }}>
              <button
                onClick={() => setOpenKey(isOpen ? "" : step.key)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: STATUS_STYLE[status].bg }}>
                  <step.Icon size={14} style={{ color: STATUS_STYLE[status].fg }} />
                </div>
                <span className={cn("flex-1 min-w-0 text-sm font-semibold truncate", status === "pending" ? "" : "text-white")}
                  style={status === "pending" ? { color: "var(--ar-muted)" } : undefined}>
                  {step.title}
                </span>
                <StatusPill status={status} />
                <ChevronDown size={14} style={{ color: "var(--ar-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 pl-[52px]">
                      <p className="text-xs leading-relaxed mb-2.5" style={{ color: "var(--ar-muted)" }}>
                        {step.desc}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded"
                        style={{ background: "var(--ar-bg)", border: "1px solid var(--ar-border)", color: "var(--ar-muted-2)" }}>
                        {step.tag}
                      </span>
                      {status === "error" && errorMsg && (
                        <p className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color: "#ef4444" }}>
                          <AlertTriangle size={12} className="flex-shrink-0" /> {errorMsg}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "var(--ar-card-2)" }}>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ar-muted)" }}>
          <Clock size={12} /> {fmtTime(elapsed)}
        </span>
        {phase === "done" ? (
          <span className="text-xs font-semibold" style={{ color: (totalFindings ?? 0) > 0 ? "#f97316" : "#34d399" }}>
            {totalFindings ?? 0} finding{totalFindings === 1 ? "" : "s"}
          </span>
        ) : (
          <button
            onClick={onCancel}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
            style={{ border: "1px solid var(--ar-border)", color: "var(--ar-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "var(--ar-bg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ar-muted)"; e.currentTarget.style.background = ""; }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
