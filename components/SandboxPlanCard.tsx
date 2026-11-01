"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Search, Cpu, Activity, Send, Check, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Decision = "approved" | "skipped" | "planned";

interface PlanStep {
  key: string;
  title: string;
  desc: string;
  tag: string;
  Icon: typeof Clock;
  skippable: boolean;
}

// Real stages of a submission, in the order they actually happen — VT runs
// off the hash as soon as it's known, in parallel with detonation, so it
// sits right after upload rather than at the end.
const STEPS: PlanStep[] = [
  {
    key: "upload", title: "Upload & queue sample", tag: "host/app.py",
    Icon: Clock, skippable: false,
    desc: "Save a copy to host/uploads/ and drop it into the VM's Malware_Upload folder for the watcher to pick up.",
  },
  {
    key: "vt", title: "VirusTotal cross-check", tag: "VT_API_KEY",
    Icon: Search, skippable: true,
    desc: "Check the sample's hash against VirusTotal for community consensus, alongside our own dynamic findings.",
  },
  {
    key: "execute", title: "Execute in isolated VM", tag: "exe.py",
    Icon: Cpu, skippable: false,
    desc: "Run the real binary inside a disposable VM while Sysmon records every process, registry write, and network call.",
  },
  {
    key: "analyze", title: "Correlate telemetry", tag: "maliciouspattern.py",
    Icon: Activity, skippable: false,
    desc: "Match the sample's own PID against the Sysmon event stream to isolate what it actually did.",
  },
  {
    key: "report", title: "Deliver report", tag: "host/reports/",
    Icon: Send, skippable: false,
    desc: "Generate analysis_output.txt and POST it back to the host as a permanent, timestamped report.",
  },
];

const PILL: Record<Decision, { bg: string; fg: string; label: string }> = {
  approved: { bg: "#DCFCE7", fg: "#15803D", label: "Approved" },
  skipped:  { bg: "#EEF2F6", fg: "#64748B", label: "Skipped" },
  planned:  { bg: "#F1F1EF", fg: "#6B7280", label: "Planned" },
};

const INITIAL_DECISIONS: Record<string, Decision> = {
  upload: "approved",
  vt: "planned", execute: "planned", analyze: "planned", report: "planned",
};

export default function SandboxPlanCard({ fileName, onRun, onCancel, autoPlay = false, onCycleComplete }: {
  fileName: string; onRun?: () => void; onCancel?: () => void; autoPlay?: boolean; onCycleComplete?: () => void;
}) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => ({ ...INITIAL_DECISIONS }));
  const firstUndecided = STEPS.find((s) => decisions[s.key] === "planned")?.key ?? null;
  const [openKey, setOpenKey] = useState<string | null>(firstUndecided);

  // Landing-page demo mode: scripts its own approve/skip sequence on a loop
  // so visitors see the real interaction without a file or a backend behind it.
  useEffect(() => {
    if (!autoPlay) return;
    let cancelled = false;
    const order = STEPS.map((s) => s.key);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      while (!cancelled) {
        setDecisions({ ...INITIAL_DECISIONS });
        setOpenKey(order[1]);
        await wait(900);
        for (let i = 1; i < order.length && !cancelled; i++) {
          const key = order[i];
          const decision: Decision = key === "vt" ? "skipped" : "approved";
          setDecisions((prev) => ({ ...prev, [key]: decision }));
          setOpenKey(i + 1 < order.length ? order[i + 1] : null);
          await wait(1500);
        }
        if (cancelled) return;
        onCycleComplete?.();
        await wait(2200);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  const decide = (key: string, decision: Decision) => {
    if (autoPlay) return;
    setDecisions((prev) => ({ ...prev, [key]: decision }));
    const nextIdx = STEPS.findIndex((s) => s.key === key) + 1;
    const next = STEPS.slice(nextIdx).find((s) => decisions[s.key] === "planned");
    setOpenKey(next?.key ?? null);
  };

  const approveAll = () => {
    if (autoPlay) return;
    setDecisions((prev) => {
      const next = { ...prev };
      for (const s of STEPS) if (next[s.key] === "planned") next[s.key] = "approved";
      return next;
    });
    setOpenKey(null);
  };

  const decidedCount = STEPS.filter((s) => decisions[s.key] !== "planned").length;
  const approvedCount = STEPS.filter((s) => decisions[s.key] === "approved").length;
  const allDecided = decidedCount === STEPS.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-[460px] rounded-[22px] overflow-hidden"
      style={{ background: "#FFFFFF", boxShadow: "0 20px 60px rgba(15,15,15,0.18), 0 2px 8px rgba(15,15,15,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-5" style={{ background: "#F3F3F1" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <p className="font-bold text-[17px] truncate" style={{ color: "#15171A" }}>Sandbox plan</p>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: "#E7E7E4", color: "#6B7280" }}>
            {STEPS.length} steps
          </span>
        </div>
        <span className="text-[13px] flex-shrink-0" style={{ color: "#9CA0A6" }}>
          {decidedCount} of {STEPS.length} decided
        </span>
      </div>

      {/* File strip */}
      <div className="px-6 py-2.5 text-[11px] font-mono truncate" style={{ borderBottom: "1px dashed #E5E5E2", color: "#9CA0A6", background: "#FFFFFF" }}>
        {fileName}
      </div>

      {/* Rows — fixed height so the card never resizes as a row expands;
          overflow-y is a safety fallback, not the normal case. */}
      <div className="px-2 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ height: 480, scrollbarWidth: "none" }}>
        {STEPS.map((step, i) => {
          const decision = decisions[step.key];
          const isOpen = openKey === step.key;
          const pill = PILL[decision];
          return (
            <motion.div layout key={step.key}
              style={{ borderBottom: i < STEPS.length - 1 ? "1px dashed #E5E5E2" : undefined }}
            >
              <button
                onClick={autoPlay ? undefined : () => setOpenKey(isOpen ? null : step.key)}
                className={cn("w-full flex items-center gap-3.5 px-4 py-4 text-left rounded-xl transition-colors", autoPlay && "cursor-default")}
                onMouseEnter={(e) => { if (!autoPlay) e.currentTarget.style.background = "#FAFAF9"; }}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <step.Icon size={18} strokeWidth={1.75} style={{ color: "#15171A", flexShrink: 0 }} />
                <span className="flex-1 min-w-0 font-semibold text-[15px] truncate" style={{ color: "#15171A" }}>
                  {step.title}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={decision}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18 }}
                    className="text-[12px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: pill.bg, color: pill.fg }}
                  >
                    {pill.label}
                  </motion.span>
                </AnimatePresence>
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
                    <div className="px-4 pb-4 pl-[46px]">
                      <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#9CA0A6" }}>
                        {step.desc}
                      </p>
                      <div className="relative inline-block mb-4">
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-md inline-block"
                          style={{ background: "#FAFAF9", border: "1px solid #E5E5E2", color: "#6B7280" }}>
                          {step.tag}
                        </span>
                        <span className="absolute -top-1 -right-1 w-0 h-0"
                          style={{ borderLeft: "6px solid transparent", borderTop: "6px solid #15171A" }} />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                          onClick={() => decide(step.key, "approved")}
                          className="flex items-center gap-1.5 text-[13px] font-semibold text-white px-4 py-2 rounded-full"
                          style={{ background: "#16A34A" }}
                        >
                          <Check size={14} /> Approve
                        </motion.button>
                        {step.skippable && (
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                            onClick={() => decide(step.key, "skipped")}
                            className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-full"
                            style={{ border: "1px solid #E5E5E2", color: "#4B5563" }}
                          >
                            <X size={14} /> Skip
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4" style={{ background: "#F3F3F1" }}>
        <span className="text-[13px]" style={{ color: "#6B7280" }}>{approvedCount} approved</span>
        <button
          onClick={approveAll}
          disabled={allDecided}
          className="text-[13px] font-medium transition-opacity disabled:opacity-40"
          style={{ color: "#15171A" }}
        >
          Approve all
        </button>
        <motion.button
          whileHover={allDecided && !autoPlay ? { scale: 1.03 } : {}}
          whileTap={allDecided && !autoPlay ? { scale: 0.96 } : {}}
          onClick={autoPlay ? undefined : onRun}
          disabled={!allDecided}
          className={cn("flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-full transition-opacity", !allDecided && "opacity-40")}
          style={{ background: "#111214", color: "#FFFFFF" }}
        >
          <Play size={13} className="fill-white" /> Run plan
        </motion.button>
      </div>
    </motion.div>
  );
}
