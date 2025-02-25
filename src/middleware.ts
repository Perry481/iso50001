import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Just log and pass through - no redirects
  console.log("Middleware accessed with path:", pathname);

  // Set company header if path contains company
  if (pathname.includes("/ebc/iso50001")) {
    const response = NextResponse.next();
    response.headers.set("x-company", "ebc");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/iso50001/:path*", "/ebc/iso50001/:path*"],
};
