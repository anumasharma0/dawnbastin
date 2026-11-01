"use client";

import { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { gsap } from "gsap";

const STATS = [
  { value: 90, suffix: "%", label: "Detection Rate" },
  { value: 94, suffix: "%", label: "Scan Accuracy" },
  { value: 95, suffix: "%", label: "Customer Satisfaction" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// GSAP drives the numeric count-up — a plain tween with onUpdate.
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const numRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const counter = { n: 0 };
    const tween = gsap.to(counter, {
      n: value,
      duration: 1.4,
      delay: 0.3,
      ease: "power2.out",
      onUpdate: () => { el.textContent = Math.round(counter.n) + suffix; },
    });
    return () => { tween.kill(); };
  }, [value, suffix]);

  return (
    <div className="text-center px-6">
      <p ref={numRef} className="font-display text-2xl sm:text-4xl font-extrabold leading-none"
        style={{ color: "var(--lp-ink)", fontVariantNumeric: "tabular-nums" }}>
        0{suffix}
      </p>
      <p className="text-xs mt-2.5 uppercase tracking-[0.1em]" style={{ color: "var(--lp-ink-faint)" }}>{label}</p>
    </div>
  );
}

export default function StatRow() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16" style={{ background: "var(--lp-bg)" }}>
      <div className="text-center mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--lp-ink-faint)" }}>
          Enterprise Security
        </p>
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "var(--lp-ink)" }}>
          Built on real execution, not guesses
        </h2>
      </div>

      <div className="lp-signal-bar w-full mb-10" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="flex items-start justify-center"
      >
        {STATS.map((s, i) => (
          <motion.div key={s.label} variants={item} style={i > 0 ? { borderLeft: "1px solid var(--lp-border)" } : undefined}>
            <StatCounter {...s} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
