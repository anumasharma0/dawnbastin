"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

export default function ClosingCta({ primaryHref, primaryLabel }: { primaryHref: string; primaryLabel: string }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--lp-ink-faint)" }}>
        Secure Your Business
      </p>

      <div className="lp-signal-bar w-32 mx-auto mb-7" />

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-3"
        style={{ color: "var(--lp-ink)" }}
      >
        Ready to see what&apos;s really inside that file?
      </motion.h2>
      <p className="text-sm sm:text-base mb-8 max-w-lg mx-auto" style={{ color: "var(--lp-ink-dim)" }}>
        No install on your side. Submit a sample and watch the full attack chain play out, safely.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-7">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href={primaryHref}
            className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-full transition-all hover:brightness-95"
            style={{ background: "var(--lp-cta-bg)", color: "var(--lp-cta-ink)" }}>
            {primaryLabel} <ArrowRight size={16} />
          </Link>
        </motion.div>
        <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} href="#how-it-works"
          className="inline-flex items-center justify-center gap-2.5 font-semibold text-sm px-6 py-3.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ border: "1px solid var(--lp-border)", color: "var(--lp-ink)" }}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "1px solid var(--lp-border)" }}>
            <Play size={9} className="fill-current ml-0.5" />
          </span>
          How it works
        </motion.a>
      </div>

      <div className="flex items-center justify-center gap-5 text-xs" style={{ color: "var(--lp-ink-faint)" }}>
        <span className="flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: "var(--lp-accent)" }} /> No credit card</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: "var(--lp-accent)" }} /> Full execution, not emulation</span>
      </div>
    </section>
  );
}
