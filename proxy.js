import { NextResponse } from "next/server";
import { verifyAuthToken } from "./lib/auth";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let payload;

  try {
    payload = verifyAuthToken(token);
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/server/:path*", "/channel/:path*", "/admin/:path*"],
};
