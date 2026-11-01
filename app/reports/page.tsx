"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Loader2, FileCode, Copy, Monitor,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { formatBytes } from "@/lib/utils";

type Verdict = { label: string; tone: "ok" | "warn" | "neutral" };
type Submission = {
  id: number;
  filename: string;
  dispatchedFilename: string;
  status: string;
  submittedAt: string;
  vm: string | null;
  size: number;
  md5: string;
  sha256: string;
  verdict: Verdict;
  eventCount: number;
  tags: string[];
};

const PAGE_SIZE = 50;
const FETCH_LIMIT = 200;
const POLL_MS = 5000;

const VERDICT_FILTERS = ["All reports", "Suspicious activity", "No threats detected", "In progress", "Failed to run"];

const TONE_STYLE: Record<Verdict["tone"], { background: string; color: string }> = {
  ok:      { background: "var(--ar-cyan)", color: "#fff" },
  warn:    { background: "#f97316", color: "#fff" },
  neutral: { background: "var(--ar-card-2)", color: "var(--ar-muted)" },
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono leading-tight">
      <span className="w-9 flex-shrink-0" style={{ color: "var(--ar-muted)" }}>{label}</span>
      <span className="text-white truncate">{value || "—"}</span>
      {value && (
        <button
          onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(value); }}
          className="flex-shrink-0 opacity-60 hover:opacity-100"
          aria-label={`Copy ${label}`}
        >
          <Copy size={11} />
        </button>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [items, setItems]       = useState<Submission[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [query, setQuery]       = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [verdictFilter, setVerdictFilter]   = useState(VERDICT_FILTERS[0]);
  const [page, setPage]         = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/submissions?limit=${FETCH_LIMIT}&q=${encodeURIComponent(debouncedQuery)}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Failed to load submissions");
        setItems(data.items);
        setError("");
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [debouncedQuery]);

  useEffect(() => { setPage(1); }, [debouncedQuery, verdictFilter]);

  const filtered = useMemo(
    () => verdictFilter === VERDICT_FILTERS[0] ? items : items.filter((i) => i.verdict.label === verdictFilter),
    [items, verdictFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--ar-bg)" }}>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 world-map-bg pointer-events-none" />

        <div className="relative flex-1 flex flex-col min-h-0 px-8 pt-10 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h1 className="text-4xl font-normal tracking-tight" style={{ color: "var(--ar-accent)" }}>Reports</h1>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:w-[420px] px-3 py-2 rounded-md"
                style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border-strong)" }}>
                <Search size={15} style={{ color: "var(--ar-muted)" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type hash or file name to search"
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[var(--ar-muted-2)]"
                />
              </div>
              <div className="relative">
                <select
                  value={verdictFilter}
                  onChange={(e) => setVerdictFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-md text-sm text-white outline-none"
                  style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border-strong)" }}
                >
                  {VERDICT_FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ar-muted)" }} />
              </div>
              <button className="p-2 rounded-md" aria-label="Filters"
                style={{ background: "var(--ar-primary)" }}>
                <SlidersHorizontal size={15} className="text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden"
            style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border)" }}>
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading && items.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: "var(--ar-muted)" }}>
                  <Loader2 size={16} className="animate-spin" /> Loading submissions…
                </div>
              )}
              {error && (
                <div className="px-6 py-4 text-sm" style={{ color: "#ef4444" }}>{error}</div>
              )}
              {!loading && !error && visible.length === 0 && (
                <div className="py-16 text-center text-sm" style={{ color: "var(--ar-muted)" }}>
                  No submissions match this view.
                </div>
              )}

              {visible.map((s, i) => (
                <div key={s.id} role="link" tabIndex={0}
                  onClick={() => window.open(`/reports/${s.id}`, "_blank", "noopener")}
                  onKeyDown={(e) => { if (e.key === "Enter") window.open(`/reports/${s.id}`, "_blank", "noopener"); }}
                  className="grid grid-cols-[170px_28px_minmax(0,1fr)_minmax(260px,400px)] items-center gap-4 px-5 py-3 cursor-pointer hover:brightness-125 transition-[filter] duration-150"
                  style={{
                    background: i % 2 === 0 ? "rgba(79,195,255,0.10)" : "rgba(79,195,255,0.04)",
                    borderBottom: "1px solid var(--ar-border)",
                  }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <Monitor size={20} style={{ color: "var(--ar-muted)" }} className="flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{s.vm ? "Windows 10 64 bit" : "Sandbox"}</p>
                      <p className="text-xs" style={{ color: "var(--ar-muted)" }}>{formatWhen(s.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center" title={s.status}>
                    {s.status === "done" || s.verdict.tone !== "neutral"
                      ? <CheckCircle2 size={16} style={{ color: "var(--ar-muted)" }} />
                      : <Loader2 size={16} className="animate-spin" style={{ color: "var(--ar-muted)" }} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
                        style={TONE_STYLE[s.verdict.tone]}>{s.verdict.label}</span>
                      <FileCode size={13} className="flex-shrink-0" style={{ color: "var(--ar-muted)" }} />
                      <p className="text-sm font-semibold text-white truncate" title={s.filename}>{s.filename}</p>
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--ar-muted)" }}>
                      {formatBytes(s.size)} · {s.eventCount} Sysmon event{s.eventCount === 1 ? "" : "s"}
                    </p>
                    {s.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {s.tags.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{ background: "var(--ar-card-2)", color: "var(--ar-accent)", border: "1px solid var(--ar-border)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <HashRow label="MD5" value={s.md5} />
                    <HashRow label="SHA256" value={s.sha256} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 py-3" style={{ borderTop: "1px solid var(--ar-border)", background: "var(--ar-card-2)" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded disabled:opacity-40"
                style={{ background: "var(--ar-card)", color: "var(--ar-accent)" }}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-1 rounded text-sm font-mono text-white" style={{ background: "var(--ar-card)" }}>
                {page} OF {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="p-1.5 rounded disabled:opacity-40"
                style={{ background: "var(--ar-card)", color: "var(--ar-accent)" }}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
