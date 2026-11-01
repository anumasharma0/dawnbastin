"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, Eye, Globe, Users, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewScanModalProps {
  onClose: () => void;
  onStart: (file: File) => void;
}

const OS_OPTIONS = [
  "Windows 10 (64 bit)",
  "Windows 11 (64 bit)",
  "Windows 7 (64 bit)",
  "Linux (Ubuntu 22.04)",
];

export default function NewScanModal({ onClose, onStart }: NewScanModalProps) {
  const [tab, setTab]       = useState<"deep" | "safe">("deep");
  const [mode, setMode]     = useState<"simple" | "pro">("simple");
  const [os, setOs]         = useState(OS_OPTIONS[0]);
  const [showOsDrop, setShowOsDrop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile]     = useState<File | null>(null);
  const [url, setUrl]       = useState("");
  const [formError, setFormError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [dontShow, setDontShow]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  // Actual upload + poll happens in ScanProcessingView (a full-page view,
  // not this modal) — this just hands off the file and closes.
  const startScan = () => {
    if (!file) {
      setFormError(
        "The sandbox only analyzes uploaded .exe files right now — URL submission isn't wired up yet."
      );
      return;
    }
    setShowWarning(false);
    onStart(file);
  };

  const onClickRun = () => {
    if (!dontShow) setShowWarning(true);
    else startScan();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(4, 14, 26, 0.75)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[640px] rounded-xl overflow-hidden shadow-2xl animate-fade-in-up"
        style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border)" }}
      >
        {/* ── Tab row ── */}
        <div className="flex items-center" style={{ borderBottom: "1px solid var(--ar-border)" }}>
          {(["deep", "safe"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors",
                tab === t ? "text-white" : "hover:text-white"
              )}
              style={{ color: tab === t ? "#fff" : "var(--ar-muted)" }}
            >
              {t === "deep" ? <Eye size={15} /> : <Globe size={15} />}
              {t === "deep" ? "Deep analysis" : "Safebrowsing"}
              {t === "safe" && (
                <span
                  className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-bold"
                  style={{ background: "rgba(245,158,11,0.15)", color: "var(--ar-warn)" }}
                >
                  beta
                </span>
              )}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--ar-cyan)" }} />
              )}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-4 px-5">
            <span className="text-xs" style={{ color: "var(--ar-muted)" }}>
              Analyses: <span className="text-white">Public</span>
            </span>
            <button
              onClick={onClose}
              className="p-1 transition-colors hover:text-white"
              style={{ color: "var(--ar-muted)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Step 1 ── */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">
              1. Type URL or upload a file
            </p>

            {/* Simple / Pro mode toggle */}
            <div className="flex items-center gap-2 mb-4">
              {(["simple", "pro"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize"
                  style={
                    mode === m
                      ? { background: "var(--ar-border)", color: "#fff", border: "1px solid #2A4878" }
                      : { color: "var(--ar-muted)", border: "1px solid transparent" }
                  }
                >
                  {m === "simple" ? "Simple mode" : "Pro mode"}
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden",
                isDragging ? "drop-zone-active" : ""
              )}
              style={
                isDragging
                  ? {}
                  : file
                  ? { borderColor: "#00897B", background: "rgba(0,137,123,0.05)" }
                  : { borderColor: "var(--ar-border)", background: "rgba(7,27,45,0.5)" }
              }
            >
              <div className="flex items-stretch" style={{ minHeight: "120px" }}>
                {/* URL side */}
                <div
                  className="flex-1 flex flex-col items-center justify-center py-8 px-6 gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* www icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "#0B1F30", border: "1px solid var(--ar-border)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ar-accent)" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                    </svg>
                  </div>
                  {url ? (
                    <p className="text-xs font-mono text-center break-all max-w-[120px] truncate" style={{ color: "var(--ar-accent)" }}>
                      {url}
                    </p>
                  ) : (
                    <>
                      <p className="text-xs" style={{ color: "var(--ar-muted)" }}>type or copy URL</p>
                      <input
                        type="text"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full text-xs px-2 py-1 rounded outline-none transition"
                        style={{
                          background: "var(--ar-bg)",
                          border: "1px solid var(--ar-border)",
                          color: "#fff",
                          maxWidth: "150px",
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Divider */}
                <div
                  className="flex items-center justify-center px-2"
                  style={{ borderLeft: "1px solid var(--ar-border)", borderRight: "1px solid var(--ar-border)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: "var(--ar-bg)", border: "1px solid var(--ar-border)", color: "var(--ar-muted)" }}
                  >
                    or
                  </div>
                </div>

                {/* Upload side */}
                <div className="flex-1 flex flex-col items-center justify-center py-8 px-6 gap-2">
                  <Upload
                    size={28}
                    style={{ color: file ? "#00D97E" : "var(--ar-accent)" }}
                  />
                  <p
                    className="text-sm font-bold text-center"
                    style={{ color: file ? "#00D97E" : "#fff" }}
                  >
                    {file ? file.name : "Upload"}
                  </p>
                  {!file && (
                    <p className="text-xs text-center" style={{ color: "var(--ar-muted)" }}>
                      drag and drop a file here
                    </p>
                  )}
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
              />
            </div>

            {!file && (
              <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--ar-muted-2)" }}>
                The uploaded file should contain an extension or otherwise use the{" "}
                <span className="underline cursor-pointer" style={{ color: "var(--ar-cyan)" }}>
                  "Change extension to valid"
                </span>{" "}
                option in Pro mode.
              </p>
            )}
          </div>

          {/* ── Step 2 ── */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">
              2. Choose an operating system
            </p>

            <div className="relative">
              <button
                onClick={() => setShowOsDrop(!showOsDrop)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm text-white transition-all hover:brightness-110"
                style={{ background: "var(--ar-primary-soft)" }}
              >
                <div className="flex items-center gap-3">
                  {/* Windows flag icon */}
                  <svg width="18" height="18" viewBox="0 0 88 88">
                    <rect x="0"  y="0"  width="40" height="40" fill="var(--ar-cyan)"/>
                    <rect x="48" y="0"  width="40" height="40" fill="var(--ar-cyan)"/>
                    <rect x="0"  y="48" width="40" height="40" fill="var(--ar-cyan)"/>
                    <rect x="48" y="48" width="40" height="40" fill="var(--ar-cyan)"/>
                  </svg>
                  {os}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showOsDrop && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-10 shadow-xl"
                  style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border)" }}
                >
                  {OS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => { setOs(option); setShowOsDrop(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={
                        os === option
                          ? { background: "var(--ar-primary-soft)", color: "#fff" }
                          : { color: "var(--ar-muted)" }
                      }
                      onMouseEnter={(e) => { if (os !== option) e.currentTarget.style.background = "var(--ar-card-2)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { if (os !== option) { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--ar-muted)"; } }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formError && (
            <div
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
            >
              <AlertTriangle size={13} className="flex-shrink-0" />
              {formError}
            </div>
          )}
        </div>

        {/* ── CTA footer ── */}
        <div className="flex items-stretch" style={{ borderTop: "1px solid var(--ar-border)" }}>
          <button
            onClick={onClickRun}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 text-white font-bold text-sm transition-all hover:brightness-110"
            style={{ background: "#00897B" }}
          >
            <Users size={17} />
            Run a public analysis
          </button>
          <div style={{ width: "1px", background: "#00695C" }} />
          <button
            className="flex items-center gap-1.5 px-5 text-sm font-medium transition-colors hover:bg-white/5"
            style={{ color: "#7FDFD5" }}
          >
            <Zap size={14} />
            Auto
          </button>
        </div>
      </div>

      {/* ── Public analysis warning modal ── */}
      {showWarning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <div
            className="relative w-full max-w-[420px] rounded-xl overflow-hidden shadow-2xl animate-fade-in-up"
            style={{ background: "#102840", border: "1px solid var(--ar-border)" }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.15)" }}
                >
                  <AlertTriangle size={18} style={{ color: "var(--ar-warn)" }} />
                </div>
                <h3 className="text-white font-bold text-lg">Public analysis</h3>
              </div>

              <p className="text-sm leading-relaxed mb-1" style={{ color: "var(--ar-muted)" }}>
                All data will be in the public access, in the{" "}
                <span className="text-white font-semibold">"Public reports"</span> section.
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ar-muted)" }}>
                If you want to run private analyses and use the service for commercial
                purposes, check out our{" "}
                <span className="underline cursor-pointer" style={{ color: "var(--ar-cyan)" }}>
                  Paid plans.
                </span>
              </p>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-medium transition-colors"
                  style={{ border: "1px solid #2A4060" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ar-border)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  Close
                </button>
                <button
                  onClick={startScan}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-bold transition-all hover:brightness-110"
                  style={{ background: "#00897B" }}
                >
                  I Agree
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                  style={{ accentColor: "var(--ar-cyan)" }}
                />
                <span className="text-xs" style={{ color: "var(--ar-muted)" }}>
                  Don't show on this week
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
