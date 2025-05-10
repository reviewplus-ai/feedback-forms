import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no-code', requestUrl.origin))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      console.error('Error exchanging code for session:', authError)
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
    }

    if (!session) {
      console.error('No session after code exchange')
      return NextResponse.redirect(new URL('/login?error=no-session', requestUrl.origin))
    }

    // Get the redirectedFrom parameter if it exists
    const redirectedFrom = requestUrl.searchParams.get('redirectedFrom') || '/dashboard'
    
    // Create a response that we'll use to set cookies
    const response = NextResponse.redirect(new URL(redirectedFrom, requestUrl.origin))

    // Call the setup endpoint to ensure user has a company
    const setupResponse = await fetch(`${requestUrl.origin}/api/auth/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStore.toString()
      },
      credentials: 'include',
    })

    if (!setupResponse.ok) {
      const errorText = await setupResponse.text()
      console.error('Error in user setup:', errorText)
      // Don't redirect to login on setup error, just log it and continue
      console.error('Setup error occurred but continuing with login')
    }

    // Get the setup response data
    const setupData = await setupResponse.json()
    
    if (setupData.error) {
      console.error('Setup error:', setupData.error)
      // Don't redirect to login on setup error, just log it and continue
      console.error('Setup error occurred but continuing with login')
    }
    
    return response
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/login?error=callback', requestUrl.origin))
  }
} 