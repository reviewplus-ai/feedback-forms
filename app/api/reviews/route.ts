import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Get filter parameters
    const filterBy = searchParams.get('filterBy') || 'all'
    const sortBy = searchParams.get('sortBy') || 'newest'
    const searchQuery = searchParams.get('searchQuery') || ''
    const formName = searchParams.get('formId') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, get all forms for the user
    const { data: forms } = await supabase
      .from('review_forms')
      .select('id, name')
      .eq('user_id', session.user.id)

    let query = supabase
      .from('reviews')
      .select(`
        *,
        review_forms!inner (
          id,
          name,
          user_id
        )
      `, { count: 'exact' })
      .eq('review_forms.user_id', session.user.id)

    // Apply filters
    if (filterBy === 'positive') {
      query = query.eq('is_positive', true)
    } else if (filterBy === 'negative') {
      query = query.eq('is_positive', false)
    }

    if (formName !== 'all') {
      query = query.eq('review_forms.name', formName)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    if (searchQuery) {
      query = query.or(`comment.ilike.%${searchQuery}%,review_forms.name.ilike.%${searchQuery}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'highest':
        query = query.order('rating', { ascending: false })
        break
      case 'lowest':
        query = query.order('rating', { ascending: true })
        break
    }

    // Apply pagination
    const { data: reviews, error: reviewsError, count } = await query
      .range(offset, offset + limit - 1)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedReviews = reviews.map(review => ({
      ...review,
      form: review.review_forms || { id: '', name: 'Unknown Form' }
    }))

    return NextResponse.json({
      reviews: transformedReviews,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      forms: forms || [] // Include all forms in the response
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ ...body }])  // Removed form_user_id since it's not needed
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
} 