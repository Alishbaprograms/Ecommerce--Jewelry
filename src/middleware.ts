import { NextRequest, NextResponse } from "next/server";

const adminPaths = ["/admin"];
const authPaths = ["/account", "/checkout", "/order-confirmation"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  if (!isAdminPath && !isAuthPath) return NextResponse.next();

  // Check for a session cookie — full validation happens in server components
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*", "/order-confirmation/:path*"],
};
