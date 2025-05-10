import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Simple in-memory cache
const cache = new Map<string, any>()

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check cache first
    const cacheKey = `recent-${user.id}`
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey))
    }

    // Get recent reviews with form details in a single query
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        created_at,
        rating,
        comment,
        feedback_categories,
        contact_name,
        contact_email,
        contact_phone,
        contact_status,
        is_positive,
        form_id,
        review_forms!inner (
          id,
          name
        )
      `)
      .eq('review_forms.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (reviewsError) {
      console.error("Error fetching recent reviews:", reviewsError)
      return NextResponse.json(
        { error: "Failed to fetch recent reviews" },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      feedback_categories: review.feedback_categories,
      contact_name: review.contact_name,
      contact_email: review.contact_email,
      contact_phone: review.contact_phone,
      contact_status: review.contact_status,
      is_positive: review.is_positive,
      createdAt: review.created_at,
      form: {
        id: review.review_forms.id,
        name: review.review_forms.name
      }
    }))

    // Cache the results
    cache.set(cacheKey, transformedReviews)

    return NextResponse.json(transformedReviews)
  } catch (error) {
    console.error("Error fetching recent reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent reviews" },
      { status: 500 }
    )
  }
} 