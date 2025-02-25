import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files and API routes
  if (pathname.includes("/_next/") || pathname.includes("/api/")) {
    return NextResponse.next();
  }

  // Handle company paths
  const companyMatch = pathname.match(/^\/([^/]+)\/iso50001\/?(.*)$/);
  if (companyMatch) {
    const company = companyMatch[1];
    // Set company in headers for backend processing
    const response = NextResponse.next();
    response.headers.set("x-company", company);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/).*)"],
};
