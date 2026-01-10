import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const AUTH_PAGES = new Set(["/auth/sign-in", "/auth/sign-up"]);

function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Perform full session validation with database check
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = Boolean(session?.user);

  // Redirect unauthenticated users trying to access dashboard
  if (!isAuthenticated && isDashboardPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
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
