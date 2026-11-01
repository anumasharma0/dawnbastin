"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Monitor, Copy, Loader2, Activity, Globe, MousePointerClick } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { formatBytes } from "@/lib/utils";

type Verdict = { label: string; tone: "ok" | "warn" | "neutral" };
type SysmonEvent = { num: string; id: string; name: string; fields: Record<string, string> };
type Detail = {
  id: number;
  filename: string;
  dispatchedFilename: string;
  status: string;
  submittedAt: string;
  vm: string | null;
  size: number;
  md5: string;
  sha256: string;
  error: string | null;
  verdict: Verdict;
  tags: string[];
  events: SysmonEvent[];
  exeFound: string | null;
  report: string | null;
};

const BANNER: Record<Verdict["tone"], string> = {
  ok: "var(--ar-cyan)",
  warn: "#f97316",
  neutral: "var(--ar-card-2)",
};

const SHOWN_FIELDS = ["Image", "CommandLine", "ParentImage", "ParentCommandLine", "User", "TargetFilename", "DestinationIp", "DestinationPort"];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function CopyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px] font-mono">
      <span className="w-12 flex-shrink-0 pt-0.5" style={{ color: "var(--ar-muted)" }}>{label}</span>
      <span className="text-white break-all flex-1">{value}</span>
      <button onClick={() => navigator.clipboard?.writeText(value)} className="flex-shrink-0 opacity-60 hover:opacity-100" aria-label={`Copy ${label}`}>
        <Copy size={11} />
      </button>
    </div>
  );
}

function EmptyTab({ icon: Icon, title }: { icon: typeof Globe; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center" style={{ color: "var(--ar-muted)" }}>
      <Icon size={24} />
      <p className="text-sm">{title}</p>
      <p className="text-xs" style={{ color: "var(--ar-muted-2)" }}>This sandbox pipeline does not capture this data yet.</p>
    </div>
  );
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData]       = useState<Detail | null>(null);
  const [error, setError]     = useState("");
  const [tab, setTab]         = useState<"processes" | "browser" | "actions">("processes");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/submissions/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Failed to load submission");
        if (!cancelled) setData(body);
      })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--ar-bg)" }}>
      <Sidebar />

      <main className="flex-1 flex min-w-0 relative">
        <div className="absolute inset-0 world-map-bg pointer-events-none" />

        {!data && !error && (
          <div className="relative m-auto flex items-center gap-2 text-sm" style={{ color: "var(--ar-muted)" }}>
            <Loader2 size={16} className="animate-spin" /> Loading report…
          </div>
        )}
        {error && (
          <div className="relative m-auto text-sm" style={{ color: "#ef4444" }}>{error}</div>
        )}

        {data && (
          <>
            <section className="relative flex-1 min-w-0 flex flex-col overflow-y-auto">
              <div className="px-4 py-2.5 text-center text-sm font-semibold text-white"
                style={{ background: BANNER[data.verdict.tone] }}>
                {data.verdict.label}
              </div>

              <div className="px-8 pt-8 pb-6">
                <h1 className="text-3xl font-normal tracking-tight break-all" style={{ color: "var(--ar-accent)" }}>{data.filename}</h1>
                <p className="text-sm mt-1" style={{ color: "var(--ar-muted)" }}>
                  {formatBytes(data.size)} · Submitted {formatWhen(data.submittedAt)}
                </p>

                <div className="flex gap-1 mt-6" style={{ borderBottom: "1px solid var(--ar-border)" }}>
                  {([
                    { key: "processes", label: `Processes ${data.events.length}`, Icon: Activity, beta: false },
                    { key: "browser",   label: "Browser data", Icon: Globe, beta: true },
                    { key: "actions",   label: "Actions", Icon: MousePointerClick, beta: true },
                  ] as const).map(({ key, label, Icon, beta }) => (
                    <button key={key} onClick={() => setTab(key)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors"
                      style={{
                        borderColor: tab === key ? "var(--ar-accent)" : "transparent",
                        color: tab === key ? "#fff" : "var(--ar-muted)",
                      }}>
                      <Icon size={14} /> {label}
                      {beta && <span className="text-[9px] px-1 rounded font-bold" style={{ background: "var(--ar-warn)", color: "var(--ar-bg-deep)" }}>beta</span>}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  {tab === "processes" && (
                    data.events.length === 0 ? (
                      <p className="text-sm py-10 text-center" style={{ color: "var(--ar-muted)" }}>
                        {data.status === "done" || data.report ? "No Sysmon events were recorded for this run." : "Report not received yet."}
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {data.events.map((ev) => (
                          <li key={ev.num} className="rounded-lg p-4" style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border)" }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--ar-card-2)", color: "var(--ar-muted)" }}>#{ev.num}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "var(--ar-card-2)", color: "var(--ar-accent)", border: "1px solid var(--ar-border)" }}>{ev.name}</span>
                              <span className="text-[10px] font-mono" style={{ color: "var(--ar-muted-2)" }}>ID {ev.id}</span>
                            </div>
                            <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-1 text-[11px] font-mono">
                              {SHOWN_FIELDS.filter((k) => ev.fields[k] && ev.fields[k] !== "-").map((k) => (
                                <div key={k} className="contents">
                                  <dt style={{ color: "var(--ar-muted)" }}>{k}</dt>
                                  <dd className="text-white break-all">{ev.fields[k]}</dd>
                                </div>
                              ))}
                            </dl>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                  {tab === "browser" && <EmptyTab icon={Globe} title="No browser data captured" />}
                  {tab === "actions" && <EmptyTab icon={MousePointerClick} title="No actions recorded" />}
                </div>

                {data.report && (
                  <details className="mt-8 rounded-lg" style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border)" }}>
                    <summary className="cursor-pointer px-4 py-3 text-sm text-white">Raw report</summary>
                    <pre className="px-4 pb-4 text-[11px] font-mono whitespace-pre-wrap break-all max-h-[420px] overflow-auto" style={{ color: "var(--ar-muted)" }}>{data.report}</pre>
                  </details>
                )}
              </div>
            </section>

            <aside className="relative w-[340px] flex-shrink-0 overflow-y-auto px-5 py-6 flex flex-col gap-5"
              style={{ background: "var(--ar-sidebar)", borderLeft: "1px solid var(--ar-border)" }}>
              <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border)" }}>
                <Monitor size={28} style={{ color: "var(--ar-accent)" }} />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium">Windows 10 64 bit</p>
                  <p className="text-xs font-mono" style={{ color: "var(--ar-muted)" }}>VM {data.vm ?? "—"}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between"><span style={{ color: "var(--ar-muted)" }}>Status</span><span className="text-white capitalize">{data.status}</span></div>
                <div className="flex justify-between"><span style={{ color: "var(--ar-muted)" }}>Submitted</span><span className="text-white">{formatWhen(data.submittedAt)}</span></div>
                <div className="flex justify-between"><span style={{ color: "var(--ar-muted)" }}>Executable</span><span className="text-white font-mono truncate max-w-[180px]" title={data.exeFound ?? ""}>{data.exeFound ?? "—"}</span></div>
              </div>

              {data.tags.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--ar-muted-2)" }}>Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.tags.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--ar-card-2)", color: "var(--ar-accent)", border: "1px solid var(--ar-border)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--ar-muted-2)" }}>Sample</p>
                <div className="flex flex-col gap-2">
                  <CopyValue label="MD5" value={data.md5} />
                  <CopyValue label="SHA256" value={data.sha256} />
                </div>
              </div>

              {data.error && (
                <div className="text-xs rounded-md p-3" style={{ background: "var(--ar-card-2)", color: "#ef4444" }}>{data.error}</div>
              )}
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
