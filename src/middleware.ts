import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files and API routes
  if (pathname.includes("/_next/") || pathname.includes("/api/")) {
    return NextResponse.next();
  }

  // Extract company from URL path
  const companyMatch = pathname.match(/^\/([^/]+)\/iso50001\/?(.*)$/);
  if (companyMatch) {
    const company = companyMatch[1];

    // Store company in headers but DON'T redirect
    const response = NextResponse.next();
    response.headers.set("x-company", company);
    return response;
  }

  // If accessing root /iso50001 path, redirect to company path
  if (pathname === "/iso50001" || pathname === "/iso50001/") {
    return NextResponse.redirect(new URL("/ebc/iso50001", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/iso50001/:path*", "/:company/iso50001/:path*"],
};
