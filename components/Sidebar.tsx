"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield, Plus, FileText, Users, Clock, Bell, User, CreditCard,
  Mail, HelpCircle, LogOut, Folder, FolderOpen, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNewScan?: () => void;
  dirName?: string;
  onPickFolder?: () => void;
}

const MAIN_NAV = [
  { href: "/reports",  Icon: FileText, label: "Reports" },
  { href: "/teamwork", Icon: Users,    label: "Teamwork" },
  { href: "/history",  Icon: Clock,    label: "History" },
  { href: "/ti",       Icon: Shield,   label: "TI" },
];

const FOOTER_NAV = [
  { href: "/notifications", Icon: Bell,       label: "Alerts" },
  { href: "/profile",       Icon: User,       label: "Profile" },
  { href: "/pricing",       Icon: CreditCard, label: "Pricing" },
  { href: "/contacts",      Icon: Mail,       label: "Contacts" },
  { href: "/faq",           Icon: HelpCircle, label: "FAQ" },
];

export default function Sidebar({ onNewScan, dirName, onPickFolder }: SidebarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const logout = () => {
    document.cookie = "vs_auth=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  };

  const newAnalysis = () => {
    if (pathname === "/dashboard" && onNewScan) onNewScan();
    else router.push("/dashboard?new=1");
  };

  const railItem = (href: string, Icon: typeof Shield, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "w-full flex flex-col items-center gap-1 py-2.5 rounded-md text-[11px] transition-colors duration-150",
          isActive ? "text-white" : "hover:text-white",
        )}
        style={{ background: isActive ? "var(--ar-active)" : undefined, color: isActive ? "#fff" : "var(--ar-muted)" }}
      >
        <Icon size={18} strokeWidth={1.75} />
        <span className="leading-none">{label}</span>
      </Link>
    );
  };

  return (
    <aside
      className="w-[72px] flex-shrink-0 flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--ar-sidebar)", borderRight: "1px solid var(--ar-border)" }}
    >
      <Link href="/dashboard" className="flex items-center justify-center h-[68px] flex-shrink-0">
        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "var(--ar-primary)" }}>
          <Play size={16} className="text-white fill-white ml-0.5" />
        </div>
      </Link>

      <div className="px-2 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--ar-border)" }}>
        <button
          onClick={newAnalysis}
          className="w-full flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-md text-white text-[11px] font-semibold leading-tight transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{ background: "var(--ar-primary)" }}
        >
          <Plus size={18} strokeWidth={2.25} />
          <span>New</span>
          <span>analysis</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1 min-h-0">
        {MAIN_NAV.map(({ href, Icon, label }) => railItem(href, Icon, label))}
      </nav>

      <div className="px-2 pb-2 flex flex-col gap-1 flex-shrink-0" style={{ borderTop: "1px solid var(--ar-border)", paddingTop: 8 }}>
        <button
          onClick={onPickFolder}
          title={dirName ? `Save destination: ${dirName}` : "Pick a save folder"}
          aria-label="Save destination"
          className="w-full flex flex-col items-center gap-1 py-2 rounded-md text-[11px] hover:text-white"
          style={{ color: "var(--ar-muted)" }}
        >
          {dirName ? <Folder size={18} strokeWidth={1.75} /> : <FolderOpen size={18} strokeWidth={1.75} />}
          <span className="leading-none truncate max-w-full">{dirName ? "Folder" : "Pick folder"}</span>
        </button>
        {FOOTER_NAV.map(({ href, Icon, label }) => railItem(href, Icon, label))}
        <button
          onClick={logout}
          className="w-full flex flex-col items-center gap-1 py-2.5 rounded-md text-[11px] hover:text-red-300"
          style={{ color: "var(--ar-muted)" }}
        >
          <LogOut size={18} strokeWidth={1.75} />
          <span className="leading-none">Log out</span>
        </button>
      </div>
    </aside>
  );
}
