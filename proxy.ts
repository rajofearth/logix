import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PAGES = new Set(["/auth/sign-in", "/auth/sign-up"]);

function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = getSessionCookie(request, { cookiePrefix: "admin-auth" });
  const isAuthenticated = Boolean(sessionCookie);

  if (!isAuthenticated && isDashboardPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && AUTH_PAGES.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/sign-in", "/auth/sign-up"],
};


