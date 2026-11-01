import { Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<Severity, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};

export function SeverityBadge({
  severity,
  size = "sm",
}: {
  severity: Severity;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-semibold rounded tracking-wide",
        `severity-${severity}`,
        size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      )}
    >
      {LABELS[severity]}
    </span>
  );
}
