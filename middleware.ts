import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const cookie = request.cookies.get('arambh_user')

  const publicPaths = ['/login', '/register', '/forgot-password']
  const isHomePage = pathname === '/'
  const isPublicPath = publicPaths.some((p) => pathname === p)

  if (isHomePage) {
    return NextResponse.next()
  }

  if (isPublicPath) {
    if (cookie) {
      let redirectTo = '/dashboard'
      try {
        const parsed = JSON.parse(cookie.value)
        if (parsed.role === 'EMPLOYEE' || parsed.role === 'VIEWER') {
          redirectTo = '/learn'
        }
      } catch {
        // ignore
      }
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    return NextResponse.next()
  }

  if (!cookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|demo-placeholder\\.html|demo-script\\.md|demo-video\\.mp4).*)',
  ],
}
