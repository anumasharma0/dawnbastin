"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

export default function Nav({ isAuthed, primaryHref }: { isAuthed: boolean; primaryHref: string }) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-30 backdrop-blur-md"
      style={{ background: "var(--lp-nav-bg)", borderBottom: "1px solid var(--lp-border)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--lp-accent)" }}>
            <Play size={14} className="text-[var(--lp-bg)] fill-[var(--lp-bg)] ml-0.5" />
          </div>
          <span className="font-display text-[var(--lp-ink)] font-bold text-base tracking-tight">Dawbastion</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: "var(--lp-ink-dim)" }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-4">
          {!isAuthed && (
            <Link href="/login" className="text-sm font-medium hidden sm:inline-block hover:text-white transition-colors"
              style={{ color: "var(--lp-ink-dim)" }}>
              Sign in
            </Link>
          )}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href={primaryHref}
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors hover:brightness-95"
              style={{ background: "var(--lp-cta-bg)", color: "var(--lp-cta-ink)" }}>
              {isAuthed ? "Dashboard" : "Schedule a Demo"}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
