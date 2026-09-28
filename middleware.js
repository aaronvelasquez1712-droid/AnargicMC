import { NextResponse } from 'next/server';

export function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  
  const { pathname } = request.nextUrl;

  // Si es movil y no esta ya en /movilpage, redirigimos
  if (isMobile && !pathname.startsWith('/movilpage') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i)) {
    // Evitamos bucles y redirigimos rutas como /tienda a /movilpage/tienda
    const newPath = pathname === '/' ? '/movilpage' : `/movilpage${pathname}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Si es PC y está intentando acceder a /movilpage, lo mandamos a la versión normal
  if (!isMobile && pathname.startsWith('/movilpage')) {
    let newPath = pathname.replace('/movilpage', '');
    if (newPath === '') newPath = '/';
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
