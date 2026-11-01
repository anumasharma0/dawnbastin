export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  file: string;
  line: number;
  cwe: string;
  recommendation: string;
  snippet?: string;
}

export interface ScanSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface ScanResult {
  fileName: string;
  scannedAt: string;
  summary: ScanSummary;
  vulnerabilities: Vulnerability[];
  savedPath?: string;
  rawReport?: string | null;
}

export type ScanStatus =
  | "idle"
  | "uploading"
  | "uploaded"
  | "scanning"
  | "done"
  | "error";
