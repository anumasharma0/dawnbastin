import { NextRequest, NextResponse } from "next/server";

// "/" is the public marketing page — no auth required. Everything else
// behind this middleware (the app, reports, settings, etc.) still needs
// a session, same as before.
const PUBLIC_PATHS = new Set(["/", "/login"]);

export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.get("vs_auth")?.value === "1";
  const { pathname } = request.nextUrl;

  if (!isAuthed && !PUBLIC_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthed && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|world-map-bg.svg).*)"],
};
