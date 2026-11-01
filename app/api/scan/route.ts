import { NextRequest, NextResponse } from "next/server";
import type { ScanResult, Vulnerability } from "@/lib/types";

const SANDBOX_API_URL = process.env.SANDBOX_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json({ error: "No fileName provided" }, { status: 400 });
    }

    const sandboxRes = await fetch(
      `${SANDBOX_API_URL}/api/samples/${encodeURIComponent(fileName)}`
    );
    const data = await sandboxRes.json();

    if (!sandboxRes.ok) {
      return NextResponse.json(
        { error: data.error || "Sandbox lookup failed" },
        { status: sandboxRes.status }
      );
    }

    if (data.status !== "done") {
      // Still queued or running — caller keeps polling. "error" is
      // terminal too (the sandbox's worker failed to dispatch the job) —
      // carry its message through so the UI has something to show instead
      // of polling until its own client-side timeout.
      return NextResponse.json({
        success: true,
        status: data.status,
        error: data.status === "error" ? data.error : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      status: "done",
      ...toScanResult(fileName, data),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || `Could not reach sandbox at ${SANDBOX_API_URL}` },
      { status: 502 }
    );
  }
}

// The sandbox reports real Sysmon behavioral events, not static-analysis
// vulnerabilities — there's no severity scoring for them, so every event is
// surfaced at "info" level and left for a human to judge.
function toScanResult(fileName: string, data: any): ScanResult {
  const events: any[] = data.result?.events ?? [];

  const vulnerabilities: Vulnerability[] = events.map((ev, i) => {
    const fields = ev.fields ?? {};
    return {
      id: `EVT-${ev.num ?? i + 1}`,
      severity: "info",
      title: `Sysmon event ${ev.id}: ${ev.name}`,
      description:
        Object.entries(fields)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ") || "No fields reported for this event.",
      file: fileName,
      line: Number(ev.num) || i + 1,
      cwe: `SYSMON-${ev.id}`,
      recommendation: "Review this behavior in the full sandbox report.",
      snippet: Object.entries(fields)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n"),
    };
  });

  return {
    fileName,
    scannedAt: data.submitted_at ?? new Date().toISOString(),
    summary: {
      total: vulnerabilities.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: vulnerabilities.length,
    },
    vulnerabilities,
    rawReport: data.report ?? null,
  };
}
