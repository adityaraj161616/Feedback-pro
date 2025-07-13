import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For now, let's remove the complex middleware and let the pages handle their own auth
  // This will prevent the redirect loop

  const { pathname } = request.nextUrl

  console.log("Simple middleware - Path:", pathname)

  // Only handle very basic redirects if needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
