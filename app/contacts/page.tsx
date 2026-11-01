import AppPage from "@/components/AppPage";
import { Mail } from "lucide-react";

export default function ContactsPage() {
  return (
    <AppPage title="Contact us" description="Reach the support team.">
      <div className="rounded-2xl p-6 flex items-center gap-4 max-w-[420px]"
        style={{ background: "var(--ar-card)", border: "1px solid var(--ar-border-strong)" }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(23,162,232,0.15)", border: "1px solid rgba(23,162,232,0.25)" }}>
          <Mail size={16} style={{ color: "var(--ar-accent)" }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--ar-muted)" }}>Email</p>
          <a href="mailto:support@dawbastion.local" className="text-sm font-mono truncate block hover:underline" style={{ color: "var(--ar-cyan)" }}>
            support@dawbastion.local
          </a>
        </div>
      </div>
      <p className="text-[11px] mt-4" style={{ color: "var(--ar-muted-2)" }}>
        Placeholder address — swap this for a real contact email when you have one.
      </p>
    </AppPage>
  );
}
