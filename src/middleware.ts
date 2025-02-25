import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (pathname.includes("/_next") || pathname.includes("/api/")) {
    return NextResponse.next();
  }

  // Extract company from URL if present and set header
  const companyMatch = pathname.match(/^\/([^/]+)\/iso50001/);
  if (companyMatch) {
    const company = companyMatch[1];
    const response = NextResponse.next();

    // Store company info in headers for backend access
    response.headers.set("x-company", company);

    // Important: Make sure we don't redirect or modify the URL here
    return response;
  }

  // If we're at /iso50001/ without company, redirect to default
  if (pathname === "/iso50001" || pathname === "/iso50001/") {
    return NextResponse.redirect(new URL("/ebc/iso50001", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths under /iso50001 and /{company}/iso50001
    "/iso50001/:path*",
    "/:company/iso50001/:path*",
  ],
};
