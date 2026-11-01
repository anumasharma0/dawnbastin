import { NextRequest, NextResponse } from "next/server";

const SANDBOX_API_URL = process.env.SANDBOX_API_URL || "http://127.0.0.1:8000";

export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ["q", "limit", "offset"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }

  try {
    const res = await fetch(`${SANDBOX_API_URL}/api/submissions?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Sandbox host unreachable" }, { status: 502 });
  }
}
