import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: forms, error } = await supabase
      .from('review_forms')
      .select(`
        *,
        companies (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching forms:', error)
      return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
    }

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error in GET /api/forms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.json()
    const { name, slug, welcome_message, thank_you_message, rating_threshold, positive_redirect_url, negative_redirect_url, enable_comments } = formData

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug can only contain lowercase letters, numbers, and hyphens' }, { status: 400 })
    }

    // Check if form with same slug already exists
    const { data: existingForm, error: checkError } = await supabase
      .from('review_forms')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking for existing form:', checkError)
      return NextResponse.json({ error: 'Failed to check for existing form' }, { status: 500 })
    }

    if (existingForm) {
      return NextResponse.json({ 
        error: 'DUPLICATE_SLUG',
        message: 'A form with this URL already exists. Please choose a different URL.'
      }, { status: 400 })
    }

    // Create or get user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('company_id')
      .single()

    if (userError) {
      console.error('Error creating/fetching user:', userError)
      return NextResponse.json({ error: 'Failed to create/fetch user' }, { status: 500 })
    }

    let companyId = userRecord?.company_id

    if (!companyId) {
      // Create a new company for the user
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: user.email?.split('@')[0] || 'My Company',
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (companyError) {
        console.error('Error creating company:', companyError)
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
      }

      companyId = newCompany.id

      // Update user with company_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: companyId })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      }
    }

    // Create the form
    const { data: form, error: formError } = await supabase
      .from('review_forms')
      .insert([
        {
          name,
          slug,
          welcome_message: welcome_message || "How would you rate your experience?",
          thank_you_message: thank_you_message || "Thank you for your feedback!",
          rating_threshold: rating_threshold || 4,
          positive_redirect_url: positive_redirect_url || null,
          negative_redirect_url: negative_redirect_url || null,
          enable_comments: enable_comments !== false,
          user_id: user.id,
          company_id: companyId
        }
      ])
      .select()
      .single()

    if (formError) {
      console.error('Error creating form:', formError)
      return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error in POST /api/forms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 