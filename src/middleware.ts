import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user = null;

  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-url')) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    try {
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<any>((resolve) =>
        setTimeout(() => resolve({ data: { user: null } }), 500)
      );
      const res = await Promise.race([userPromise, timeoutPromise]);
      user = res?.data?.user || null;
    } catch (err) {
      user = null;
    }
  }

  // Cek cookie session demo/lokal jika login via fallback
  const hasDemoSession = request.cookies.get('demo_session')?.value === 'true';

  const isAuthenticated = !!user || hasDemoSession;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname.startsWith('/inventaris') || 
                          request.nextUrl.pathname.startsWith('/buku-kas') || 
                          request.nextUrl.pathname.startsWith('/laporan');

  if (!isAuthenticated && isDashboardPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

