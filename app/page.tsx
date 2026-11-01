import { cookies } from "next/headers";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import StatRow from "@/components/landing/StatRow";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ClosingCta from "@/components/landing/ClosingCta";
import Footer from "@/components/landing/Footer";

export default async function LandingPage() {
  const isAuthed = (await cookies()).get("vs_auth")?.value === "1";
  const primaryHref  = isAuthed ? "/dashboard" : "/login";
  const primaryLabel = isAuthed ? "Go to dashboard" : "Start free scan";

  return (
    <div style={{ background: "var(--lp-bg)" }} className="min-h-screen">
      <Nav isAuthed={isAuthed} primaryHref={primaryHref} />
      <Hero primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <StatRow />
      <Features />
      <HowItWorks />
      <ClosingCta primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <Footer />
    </div>
  );
}
