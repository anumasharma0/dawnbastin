"use client";

import { useState } from "react";
import { ScanResult, Severity } from "@/lib/types";
import { SummaryStats } from "./SummaryStats";
import { VulnerabilityCard } from "./VulnerabilityCard";
import { formatDate } from "@/lib/utils";
import { Filter, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

const FILTER_LABELS: Record<"all" | Severity, string> = {
  all: "All",
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

interface ResultsPanelProps {
  result: ScanResult;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [filter, setFilter] = useState<"all" | Severity>("all");

  const filtered =
    filter === "all"
      ? result.vulnerabilities
      : result.vulnerabilities.filter((v) => v.severity === filter);

  const sorted = [...filtered].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return (
    <div className="space-y-5">
      {/* Summary */}
      <SummaryStats
        summary={result.summary}
        fileName={result.fileName}
        scannedAt={result.scannedAt}
      />

      {/* Scan meta */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Clock size={12} />
        <span>Scanned {formatDate(result.scannedAt)}</span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted-foreground flex-shrink-0" />
        {(["all", ...SEVERITY_ORDER] as const).map((sev) => {
          const count =
            sev === "all"
              ? result.vulnerabilities.length
              : result.summary[sev];
          return (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-mono transition-all duration-150",
                filter === sev
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              {FILTER_LABELS[sev]}{" "}
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Vulnerability list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No{filter !== "all" ? ` ${filter}` : ""} vulnerabilities found.
            </p>
          </div>
        ) : (
          sorted.map((vuln, i) => (
            <VulnerabilityCard key={vuln.id} vuln={vuln} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
