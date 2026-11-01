"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Play, ArrowRight } from "lucide-react";
import SandboxPlanCard from "@/components/SandboxPlanCard";
import ReportReadyCard from "@/components/ReportReadyCard";

// A small tiled SVG of scattered "0"/"1" glyphs — the hero's binary-rain
// texture from the Liberty reference, recreated rather than copied (see
// components/landing/DESIGN.md). Loose, deterministic positions, not an
// actual random generator, so the markup stays static across renders.
const BINARY_TILE = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
  <text x="6"  y="18"  font-family="monospace" font-size="11" fill="#ffffff" opacity="0.07">1</text>
  <text x="34" y="30"  font-family="monospace" font-size="11" fill="#ffffff" opacity="0.05">0</text>
  <text x="70" y="14"  font-family="monospace" font-size="11" fill="#ffffff" opacity="0.06">0</text>
  <text x="104" y="26" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.08">1</text>
  <text x="18" y="58"  font-family="monospace" font-size="11" fill="#ffffff" opacity="0.06">0</text>
  <text x="52" y="70"  font-family="monospace" font-size="11" fill="#ffffff" opacity="0.07">1</text>
  <text x="88" y="62"  font-family="monospace" font-size="11" fill="#ffffff" opacity="0.05">1</text>
  <text x="120" y="78" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.06">0</text>
  <text x="8"  y="102" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.05">0</text>
  <text x="44" y="112" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.08">1</text>
  <text x="78" y="100" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.06">0</text>
  <text x="112" y="118" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.07">1</text>
  <text x="26" y="136" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.05">1</text>
  <text x="96" y="140" font-family="monospace" font-size="11" fill="#ffffff" opacity="0.06">0</text>
</svg>`);

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const DEMO_FILE = "invoice_update_q3.exe";

export default function Hero({ primaryHref, primaryLabel }: { primaryHref: string; primaryLabel: string }) {
  const [showReport, setShowReport] = useState(false);

  return (
    <section className="relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, var(--lp-hero-grad-start) 0%, var(--lp-hero-grad-end) 70%)` }}>
      {/* binary-rain texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,${BINARY_TILE}")`, backgroundRepeat: "repeat" }} />
      {/* diagonal light streak */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(115deg, transparent 40%, rgba(56,214,232,0.18) 48%, rgba(255,255,255,0.12) 50%, transparent 58%)",
      }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 0%, var(--lp-bg) 96%)" }} />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-6xl mx-auto px-6 pt-20 pb-20 flex flex-col lg:flex-row lg:items-center gap-14"
      >
        <div className="max-w-2xl flex-1">
          <motion.div variants={item} className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ border: "1px solid var(--lp-border)", color: "var(--lp-ink-dim)" }}>
            <ShieldCheck size={13} style={{ color: "var(--lp-accent)" }} /> Full-execution malware sandboxing
          </motion.div>

          <motion.h1 variants={item} className="font-display text-[var(--lp-ink)] text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
            Detonate the threat.<br />Not your production systems.
          </motion.h1>

          <motion.p variants={item} className="text-base sm:text-lg leading-relaxed mb-9" style={{ color: "var(--lp-ink-dim)" }}>
            Interact with cyber threats inside real Windows, Linux, macOS, and Android VMs to trigger
            full attack execution — then get back the IOCs, dropped files, and behavior timeline, automatically.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-start gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link href={primaryHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-full transition-all hover:brightness-95"
                style={{ background: "var(--lp-cta-bg)", color: "var(--lp-cta-ink)" }}>
                {primaryLabel} <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 font-semibold text-sm px-6 py-3.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ border: "1px solid var(--lp-border)", color: "var(--lp-ink)" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "1px solid var(--lp-border)" }}>
                <Play size={9} className="fill-current ml-0.5" />
              </span>
              How it works
            </motion.a>
          </motion.div>
        </div>

        {/* Live product preview — a real screenshot of the plan-review UI from
            the authenticated app, scripted to play itself for a visitor who
            hasn't signed in yet. Reuses the testimonial panel's "accent glow
            behind an elevated surface" device rather than inventing a new one. */}
        <motion.div variants={item} className="relative flex-1 w-full flex justify-center lg:justify-end">
          <div className="absolute w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--lp-accent) 0%, transparent 72%)", opacity: 0.28, filter: "blur(10px)" }} />
          <div className="relative flex flex-col items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-center" style={{ color: "var(--lp-ink-faint)" }}>
              Live plan review
            </p>
            <SandboxPlanCard
              fileName={DEMO_FILE}
              autoPlay
              onCycleComplete={() => {
                setShowReport(true);
                setTimeout(() => setShowReport(false), 2000);
              }}
            />
            <AnimatePresence>
              {showReport && <ReportReadyCard key="report" fileName={DEMO_FILE} />}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
