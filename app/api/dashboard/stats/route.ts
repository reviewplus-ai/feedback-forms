import { NextResponse } from "next/server"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Refresh the session if needed
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all review forms for the current user
    const { data: userForms, error: formsError } = await supabase
      .from('review_forms')
      .select('id')
      .eq('user_id', user.id)

    if (formsError) {
      console.error("Error fetching user forms:", formsError)
      return NextResponse.json(
        { error: "Failed to fetch user forms" },
        { status: 500 }
      )
    }

    const formIds = userForms.map(form => form.id)

    // Get total reviews count for user's forms
    const { count: totalReviews, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .in('form_id', formIds)

    if (countError) {
      console.error("Error counting reviews:", countError)
      return NextResponse.json(
        { error: "Failed to count reviews" },
        { status: 500 }
      )
    }

    // Get average rating
    const { data: avgRatingData, error: avgRatingError } = await supabase
      .from('reviews')
      .select('rating')
      .in('form_id', formIds)

    if (avgRatingError) {
      console.error("Error fetching ratings:", avgRatingError)
      return NextResponse.json(
        { error: "Failed to fetch ratings" },
        { status: 500 }
      )
    }

    const averageRating = avgRatingData.length > 0
      ? avgRatingData.reduce((sum, review) => sum + review.rating, 0) / avgRatingData.length
      : 0

    // Get positive reviews (4 or 5 stars)
    const { count: positiveReviews, error: positiveError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .in('form_id', formIds)
      .gte('rating', 4)

    if (positiveError) {
      console.error("Error counting positive reviews:", positiveError)
      return NextResponse.json(
        { error: "Failed to count positive reviews" },
        { status: 500 }
      )
    }

    // Get reviews with negative feedback
    const { count: negativeReviews, error: negativeError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .in('form_id', formIds)
      .lt('rating', 4)
      
    if (negativeError) {
      console.error("Error counting negative reviews:", negativeError)
      return NextResponse.json(
        { error: "Failed to count negative reviews" },
        { status: 500 }
      )
    }

    // Get last month's stats for growth calculation
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const { count: lastMonthReviews, error: lastMonthCountError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .in('form_id', formIds)
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', new Date().toISOString())

    if (lastMonthCountError) {
      console.error("Error counting last month reviews:", lastMonthCountError)
      return NextResponse.json(
        { error: "Failed to count last month reviews" },
        { status: 500 }
      )
    }

    const { data: lastMonthRatings, error: lastMonthRatingsError } = await supabase
      .from('reviews')
      .select('rating')
      .in('form_id', formIds)
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', new Date().toISOString())

    if (lastMonthRatingsError) {
      console.error("Error fetching last month ratings:", lastMonthRatingsError)
      return NextResponse.json(
        { error: "Failed to fetch last month ratings" },
        { status: 500 }
      )
    }

    const lastMonthAvgRating = lastMonthRatings.length > 0
      ? lastMonthRatings.reduce((sum, review) => sum + review.rating, 0) / lastMonthRatings.length
      : 0

    // Calculate growth percentages
    const reviewGrowth = lastMonthReviews && lastMonthReviews > 0
      ? Math.round(((totalReviews || 0) - lastMonthReviews) / lastMonthReviews * 100)
      : 0

    const ratingGrowth = lastMonthAvgRating > 0
      ? Number((averageRating - lastMonthAvgRating).toFixed(1))
      : 0

    return NextResponse.json({
      totalReviews,
      averageRating,
      positiveReviews,
      negativeReviews,
      reviewGrowth,
      ratingGrowth,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
} 