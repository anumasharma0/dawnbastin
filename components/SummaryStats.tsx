"use client";

import { ScanSummary } from "@/lib/types";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryStatsProps {
  summary: ScanSummary;
  fileName: string;
  scannedAt: string;
}

const SEVERITY_CONFIG = [
  { key: "critical" as const, label: "Critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { key: "high" as const, label: "High", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { key: "medium" as const, label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { key: "low" as const, label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { key: "info" as const, label: "Info", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
];

export function SummaryStats({ summary, fileName, scannedAt }: SummaryStatsProps) {
  const riskScore =
    summary.critical * 30 +
    summary.high * 15 +
    summary.medium * 7 +
    summary.low * 2 +
    summary.info * 0.5;

  const riskLevel =
    summary.critical > 0
      ? { label: "Critical Risk", color: "text-red-400", glow: "glow-red" }
      : summary.high > 0
      ? { label: "High Risk", color: "text-orange-400", glow: "glow-orange" }
      : summary.medium > 0
      ? { label: "Medium Risk", color: "text-yellow-400", glow: "" }
      : { label: "Low Risk", color: "text-emerald-400", glow: "glow-green" };

  const maxVal = Math.max(...SEVERITY_CONFIG.map((s) => summary[s.key]), 1);

  return (
    <div className="space-y-4 animate-fade-in-up stagger-children">
      {/* Risk header */}
      <div
        className={cn(
          "rounded-xl border p-5 flex items-center gap-4",
          summary.critical > 0
            ? "border-red-500/30 bg-red-500/5"
            : "border-emerald-500/30 bg-emerald-500/5",
          riskLevel.glow
        )}
      >
        {summary.critical > 0 ? (
          <ShieldAlert size={32} className="text-red-400 flex-shrink-0" />
        ) : (
          <ShieldCheck size={32} className="text-emerald-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={cn("font-display font-bold text-xl", riskLevel.color)}>
            {riskLevel.label}
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            {summary.total} issue{summary.total !== 1 ? "s" : ""} found in{" "}
            <span className="text-foreground">{fileName}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-bold text-foreground tabular-nums">
            {summary.total}
          </p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      </div>

      {/* Severity breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {SEVERITY_CONFIG.map((cfg) => {
          const count = summary[cfg.key];
          const widthPct = (count / maxVal) * 100;
          return (
            <div
              key={cfg.key}
              className={cn(
                "rounded-lg border p-3 flex flex-col gap-2",
                cfg.bg,
                cfg.border,
                "animate-fade-in-up"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  {cfg.label}
                </span>
              </div>
              <p className={cn("text-2xl font-mono font-bold tabular-nums", cfg.color)}>
                {count}
              </p>
              {/* Mini bar */}
              <div className="h-1 rounded-full bg-black/20">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", cfg.color.replace("text-", "bg-"))}
                  style={{ width: count > 0 ? `${widthPct}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
