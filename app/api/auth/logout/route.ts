import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error during logout:', error)
      return NextResponse.json(
        { error: 'Error during logout' },
        { status: 500 }
      )
    }

    // Create a response that will clear all cookies
    const response = NextResponse.json({ message: 'Logged out successfully' })
    
    // Clear all Supabase-related cookies
    const cookieNames = [
      'sb-auth-token',
      'sb-refresh-token',
      'sb-access-token',
      'sb-provider-token',
      'sb-ypzppletbobwpbkojmll-auth-token',
      'sb-ypzppletbobwpbkojmll-auth-token.0',
      'sb-ypzppletbobwpbkojmll-auth-token-code-verifier',
      'sb-ypzppletbobwpbkojmll-auth-token-code-verifier.0'
    ]

    cookieNames.forEach(name => {
      response.cookies.delete(name)
    })

    return response
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { error: 'Error during logout' },
      { status: 500 }
    )
  }
} 