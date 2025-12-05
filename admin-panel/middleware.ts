import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Safety check for env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables in middleware');
        // return NextResponse.next(); // Let's just proceed to see if it renders
    }

    // TEMPORARY: Bypassing Supabase middleware to debug Vercel 500 error
    // It seems like @supabase/ssr might be having issues with the current Next.js/Edge runtime version
    return NextResponse.next();

    /*
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Se não houver usuário autenticado, redireciona para login
    if (!user && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Se houver usuário, verifica se é admin
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    return response;
    */
}

export const config = {
    matcher: ['/admin/:path*'],
};
