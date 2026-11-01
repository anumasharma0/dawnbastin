import { NextRequest, NextResponse } from "next/server";

const SANDBOX_API_URL = process.env.SANDBOX_API_URL || "http://127.0.0.1:8000";

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("fileName");
  if (!fileName) {
    return NextResponse.json({ error: "fileName query param required" }, { status: 400 });
  }

  try {
    const sandboxRes = await fetch(
      `${SANDBOX_API_URL}/api/samples/${encodeURIComponent(fileName)}/tail`,
      { cache: "no-store" }
    );
    const data = await sandboxRes.json();

    if (!sandboxRes.ok) {
      return NextResponse.json(
        { error: data.error || "Tail lookup failed" },
        { status: sandboxRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || `Could not reach sandbox at ${SANDBOX_API_URL}` },
      { status: 502 }
    );
  }
}
