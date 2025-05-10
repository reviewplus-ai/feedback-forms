import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get session and user in parallel
    const [sessionResponse, userResponse] = await Promise.all([
      supabase.auth.getSession(),
      supabase.auth.getUser()
    ])

    const { data: { session } } = sessionResponse
    const { data: { user } } = userResponse

    if (!session) {
      console.error('No session found in setup route')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user) {
      console.error('No user found in setup route')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Check if it's a Google Workspace account
    const isGoogleWorkspace = user?.app_metadata?.provider === 'google' && 
                             user?.app_metadata?.hd // hd = hosted domain for Google Workspace

    // Extract user details - only include fields that exist in the schema
    const userDetails = {
      id: session.user.id,
      email: session.user.email,
      is_google_workspace: isGoogleWorkspace,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create or update user record
    const { error: userError } = await supabase
      .from('users')
      .upsert(userDetails)

    if (userError) {
      console.error('Error updating user:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Check if user already has a company
    const { data: existingUser } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', session.user.id)
      .single()

    if (existingUser?.company_id) {
      return NextResponse.json({ 
        message: 'User setup completed successfully',
        user: userDetails,
        is_google_workspace: isGoogleWorkspace,
        has_company: true
      })
    }

    // Create a new company if user doesn't have one
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: isGoogleWorkspace 
            ? `${user?.app_metadata?.hd?.toUpperCase()}'s Company`
            : `${user?.email?.split('@')[0]}'s Company`,
          domain: isGoogleWorkspace ? user?.app_metadata?.hd : null,
          is_google_workspace: isGoogleWorkspace,
          user_id: session.user.id
        }
      ])
      .select()
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      return NextResponse.json({ error: companyError.message }, { status: 500 })
    }

    // Update user with company_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ company_id: company.id })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Error updating user with company:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'User setup completed successfully',
      user: {
        ...userDetails,
        company_id: company.id
      },
      is_google_workspace: isGoogleWorkspace,
      has_company: true
    })
  } catch (error) {
    console.error('Error in user setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 