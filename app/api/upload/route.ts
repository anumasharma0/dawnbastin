import { NextRequest, NextResponse } from "next/server";

const SANDBOX_API_URL = process.env.SANDBOX_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // The sandbox watcher only reacts to a file being newly created in its
    // watch folder — re-using a filename it has already seen is silently
    // ignored (an overwrite, not a create), so status hangs at "running"
    // forever. Force uniqueness here so every submission is always fresh.
    const dot = file.name.lastIndexOf(".");
    const uniqueName =
      dot > 0
        ? `${file.name.slice(0, dot)}_${Date.now()}${file.name.slice(dot)}`
        : `${file.name}_${Date.now()}`;

    // Forward the file straight to the sandbox host's ingestion API —
    // it does its own extension check, hashing, and scheduling.
    const forward = new FormData();
    forward.append("file", file, uniqueName);

    const sandboxRes = await fetch(`${SANDBOX_API_URL}/api/samples`, {
      method: "POST",
      body: forward,
    });
    const data = await sandboxRes.json();

    if (!sandboxRes.ok) {
      return NextResponse.json(
        { error: data.error || "Sandbox rejected the file" },
        { status: sandboxRes.status }
      );
    }

    console.log(`[Dawbastion] Submitted to sandbox: ${data.file}`);

    return NextResponse.json({
      success: true,
      fileName: data.file,
      originalName: file.name,
      size: data.size_bytes,
      md5: data.md5,
      sha256: data.sha256,
      submittedAt: data.timestamp,
    });
  } catch (err: any) {
    console.error("[Dawbastion] Upload error:", err);
    return NextResponse.json(
      { error: err.message || `Could not reach sandbox at ${SANDBOX_API_URL}` },
      { status: 502 }
    );
  }
}
