"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Play, Shield } from "lucide-react";

const AWARDS = [
  { period: "SUMMER 2026", title: "Momentum\nLeader" },
  { period: "SUMMER 2026", title: "Leader" },
  { period: "SPRING 2026", title: "Best\nRelationship" },
];

const STATS = [
  ["90%", "Detection Rate"],
  ["94%", "Scan Accuracy"],
  ["95%", "Customer Satisfaction"],
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    document.cookie = `vs_auth=1; path=/; max-age=${60 * 60 * 24 * 7}`;
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ar-bg)" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex w-[44%] flex-col justify-between p-12 relative overflow-hidden flex-shrink-0"
        style={{ background: "linear-gradient(160deg, var(--ar-sidebar) 0%, var(--ar-bg) 60%, var(--ar-bg-deep) 100%)" }}
      >
        {/* Subtle dot grid overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(96,165,250,0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--ar-primary)" }}
          >
            <Play size={14} className="text-white fill-white ml-0.5" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">Dawbastion</p>
            <p className="text-[9px] uppercase tracking-[0.2em] leading-none mt-0.5" style={{ color: "var(--ar-muted-2)" }}>
              Vulnerability Scanner
            </p>
          </div>
        </div>

        {/* Hero text + badges */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-white font-bold text-[28px] leading-snug mb-3">
              Get instant access to<br />Dawbastion solutions
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ar-muted-2)" }}>
              Upgrade your security with AI-powered vulnerability<br />
              detection, trusted by 15K+ security teams worldwide.
            </p>
          </div>

          {/* G2-style award badges */}
          <div className="flex gap-3">
            {AWARDS.map((award, i) => (
              <div
                key={i}
                className="w-[88px] bg-white rounded-xl p-2.5 flex flex-col gap-1.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                    {award.period}
                  </p>
                  <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">G2</span>
                  </div>
                </div>
                <p className="text-gray-900 font-black text-[11px] leading-tight whitespace-pre-line">
                  {award.title}
                </p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            {STATS.map(([pct, label]) => (
              <div key={label} className="text-center">
                <p className="text-white font-bold text-2xl leading-none">{pct}</p>
                <p className="text-xs mt-1" style={{ color: "var(--ar-muted-2)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: "var(--ar-muted-2)" }}>
          © 2026 Dawbastion. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (white form) ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--ar-primary)" }}>
              <Play size={12} className="text-white fill-white ml-0.5" />
            </div>
            <span className="text-gray-900 font-bold text-base">Dawbastion</span>
          </div>

          <h2 className="text-gray-900 font-bold text-2xl mb-1">Welcome to Dawbastion!</h2>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{" "}
            <a href="#" className="text-blue-500 hover:underline">Sign up</a>
          </p>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center hover:border-gray-400 transition"
              >
                ?
              </button>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
              style={{ background: "var(--ar-accent)" }}
            >
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* SSO divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button className="w-full py-3 rounded-lg border border-gray-200 text-sm text-gray-700 font-medium hover:bg-gray-50 transition">
            Sign in with SSO
          </button>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Using SSO before the update?{" "}
              <a href="#" className="text-blue-400 hover:underline">
                Sign in with the previous SSO version
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
