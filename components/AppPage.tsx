import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppPage({ title, description, children }: {
  title: string; description: string; children?: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--ar-bg)" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 world-map-bg pointer-events-none" />
        <div className="relative px-10 py-10 max-w-[1100px]">
          <h1 className="text-4xl font-normal tracking-tight mb-2" style={{ color: "var(--ar-accent)" }}>{title}</h1>
          <p className="text-sm mb-8" style={{ color: "var(--ar-muted)" }}>{description}</p>
          {children ?? (
            <div className="rounded-2xl px-6 py-10 text-center text-sm"
              style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border-strong)", color: "var(--ar-muted)" }}>
              Nothing here yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
