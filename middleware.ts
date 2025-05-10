import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/auth/callback', '/test', '/review', '/legal', '/about', '/contact', '/thank-you']

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired
  await supabase.auth.getSession()

  // Get the pathname of the request
  const path = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''

  // Handle review form subdomains for both localhost and deployed domain
  const isLocalhost = hostname.includes('localhost:3000')
  const isDeployedDomain = hostname.includes('review-forms2.onrender.com')
  
  if ((isLocalhost || isDeployedDomain) && !hostname.startsWith('www.')) {
    const slug = hostname.split('.')[0]

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if the slug exists in the database
    const { data: form } = await supabase
      .from('review_forms')
      .select('id')
      .eq('slug', slug)
      .single()

    if (form) {
      // If the path is /thank-you, rewrite to the thank you page
      if (path === '/thank-you') {
        return NextResponse.rewrite(new URL('/thank-you', request.url))
      }
      // Otherwise, rewrite to the review page
      return NextResponse.rewrite(new URL(`/review/${slug}`, request.url))
    }
  }

  // Check if the path is a public route
  if (publicRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    return res
  }

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access a protected route
  if (!session && !publicRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    // Redirect to login with the current path as the redirect destination
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is trying to access the login page
  if (session && path === '/login') {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|robots.txt|manifest.json|sitemap.xml|.*\.png|.*\.jpg|.*\.jpeg|.*\.svg|.*\.webp|.*\.ico|.*\.txt|.*\.xml|.*\.json).*)',
  ],
} 