"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileUp, Play, FileText } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  { Icon: FileUp, title: "Submit", body: "Drop a file, email, or URL. No install, no agent on your side." },
  { Icon: Play, title: "Detonate", body: "We launch it inside an isolated VM and let it run — full execution, not a static guess." },
  { Icon: FileText, title: "Report", body: "Get back the IOCs, artifacts, and timeline, correlated and ready to act on." },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP + ScrollTrigger drives a scroll-linked sequence: the step circles
  // pop in one at a time while the connector line between them draws itself,
  // keyed to scroll position rather than a fixed delay.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const circles = section.querySelectorAll<HTMLElement>("[data-step-circle]");
    const connectors = section.querySelectorAll<HTMLElement>("[data-connector]");

    const ctx = gsap.context(() => {
      gsap.set(connectors, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(circles, { scale: 0.6, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });

      circles.forEach((circle, i) => {
        tl.to(circle, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" }, i * 0.35);
        if (connectors[i]) {
          tl.to(connectors[i], { scaleX: 1, duration: 0.35, ease: "power1.inOut" }, i * 0.35 + 0.25);
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--lp-ink-faint)" }}>
          The Pipeline
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--lp-ink)" }}>
          From sample to report in three steps
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 gap-x-8 relative">
        {/* Connector bars — sit between circle 1↔2 and 2↔3, hidden below sm since the grid stacks */}
        <div data-connector className="hidden sm:block absolute top-8 h-[2px]"
          style={{ left: "calc(16.6% + 32px)", width: "calc(33.3% - 64px)", background: "var(--lp-accent)" }} />
        <div data-connector className="hidden sm:block absolute top-8 h-[2px]"
          style={{ left: "calc(50% + 32px)", width: "calc(33.3% - 64px)", background: "var(--lp-accent)" }} />

        {STEPS.map(({ Icon, title, body }, i) => (
          <div key={title} className="relative text-center">
            <div data-step-circle className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center relative"
              style={{ background: "var(--lp-bg-alt)", border: "1px solid var(--lp-border)" }}>
              <Icon size={26} style={{ color: "var(--lp-accent)" }} />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: "var(--lp-accent)", color: "var(--lp-bg)" }}>
                {i + 1}
              </span>
            </div>
            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--lp-ink)" }}>{title}</h3>
            <p className="text-sm leading-relaxed max-w-[240px] mx-auto" style={{ color: "var(--lp-ink-dim)" }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
