import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-secret-change-me-before-deploying",
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("rr_session")?.value;
  if (token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/browse/:path*",
    "/search/:path*",
    "/watchlist/:path*",
    "/watch/:path*",
    "/title/:path*",
    "/profiles/:path*",
    "/dashboard/:path*",
  ],
};
