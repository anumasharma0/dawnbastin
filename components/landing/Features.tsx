"use client";

import { motion, type Variants } from "framer-motion";
import { MonitorSmartphone, Activity, Boxes, Search, Rss, Lock } from "lucide-react";

const FEATURES = [
  {
    Icon: MonitorSmartphone,
    title: "Real OS, real detonation",
    body: "Samples run inside actual Windows, Linux, macOS, and Android VMs — not an emulator guessing at behavior.",
  },
  {
    Icon: Activity,
    title: "Sysmon-grade telemetry",
    body: "Every process, registry write, and network call is captured straight from the kernel, not inferred after the fact.",
  },
  {
    Icon: Boxes,
    title: "Every artifact, kept",
    body: "Dropped files, memory dumps, and screenshots stream out live into your report — nothing is lost when the VM resets.",
  },
  {
    Icon: Search,
    title: "VirusTotal cross-check",
    body: "Every hash is checked against VirusTotal automatically, so you get community consensus alongside our own findings.",
  },
  {
    Icon: Rss,
    title: "Live TI feeds",
    body: "Actionable IOC streams feed straight into your SIEM, SOAR, and TIP — no manual exporting.",
  },
  {
    Icon: Lock,
    title: "Isolated by design",
    body: "Each run gets a clean VM snapshot that's reverted the moment analysis ends. Your infrastructure never touches the sample.",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const card: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--lp-ink-faint)" }}>
          Core Features
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--lp-ink)" }}>
          Behavioral evidence, not best guesses
        </h2>
      </div>

      <div className="lp-signal-bar w-full mb-10" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
        style={{ background: "var(--lp-border)" }}
      >
        {FEATURES.map(({ Icon, title, body }) => (
          <motion.div key={title} variants={card}
            className="p-6"
            style={{ background: "var(--lp-bg)" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ border: "1px solid var(--lp-border)" }}>
              <Icon size={18} style={{ color: "var(--lp-accent)" }} />
            </div>
            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--lp-ink)" }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>{body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
