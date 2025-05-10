import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    // Test the connection by fetching the current session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Supabase API Error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'No session found',
        details: null
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true,
      session: session,
      message: 'API connection successful'
    })
  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
} 