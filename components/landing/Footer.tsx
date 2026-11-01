import Link from "next/link";
import { Play } from "lucide-react";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Reports", href: "/reports" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Threat Intel", href: "/ti" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contacts", href: "/contacts" },
      { label: "Sign in", href: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: "var(--lp-bg)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="lp-signal-bar w-full mb-14" />

        <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--lp-accent)" }}>
                <Play size={14} className="fill-[var(--lp-bg)] ml-0.5" style={{ color: "var(--lp-bg)" }} />
              </div>
              <span className="font-display font-bold text-base tracking-tight" style={{ color: "var(--lp-ink)" }}>Dawbastion</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--lp-ink-dim)" }}>
              Full-execution malware sandboxing for teams who need real behavioral
              evidence, not emulated guesses.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--lp-ink-faint)" }}>
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: "var(--lp-ink-dim)" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 text-xs" style={{ borderTop: "1px solid var(--lp-border)", color: "var(--lp-ink-faint)" }}>
          © 2026 Dawbastion. All rights reserved.
        </div>
      </div>

      {/* Giant low-opacity wordmark, cropped at the viewport edge — decorative only */}
      <p aria-hidden="true" className="font-display font-extrabold select-none pointer-events-none text-center"
        style={{
          color: "var(--lp-ink)",
          opacity: 0.06,
          fontSize: "min(22vw, 240px)",
          lineHeight: 0.75,
          letterSpacing: "-0.03em",
          marginBottom: "-0.12em",
        }}>
        Dawbastion
      </p>
    </footer>
  );
}
