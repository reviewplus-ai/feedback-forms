import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300

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

    // Check cache
    const cacheKey = `stats-${user.id}`
    const cachedData = cache.get(cacheKey)
    const now = Date.now()

    // Get the latest review timestamp
    const { data: latestReview } = await supabase
      .from('reviews')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If we have cached data and it's not expired
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION * 1000) {
      // If there's a new review since last cache
      if (latestReview && (!cachedData.lastReviewTimestamp || 
          new Date(latestReview.created_at) > new Date(cachedData.lastReviewTimestamp))) {
        // Cache is stale, continue to fetch new data
      } else {
        // Cache is still valid
        return NextResponse.json(cachedData.data)
      }
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

    // Get the last 7 days of review data
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    const stats = await Promise.all(
      days.map(async (day) => {
        const startOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate())
        const endOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)

        // Get total reviews for the day
        const { count: total, error: totalError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .in('form_id', formIds)
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())

        if (totalError) {
          console.error(`Error counting reviews for ${day.toLocaleDateString()}:`, totalError)
          return {
            name: day.toLocaleDateString('default', { weekday: 'short' }),
            total: 0,
            positive: 0,
            negative: 0
          }
        }

        // Get positive reviews (4 or 5 stars) for the day
        const { count: positive, error: positiveError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .in('form_id', formIds)
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
          .gte('rating', 4)

        if (positiveError) {
          console.error(`Error counting positive reviews for ${day.toLocaleDateString()}:`, positiveError)
          return {
            name: day.toLocaleDateString('default', { weekday: 'short' }),
            total: total || 0,
            positive: 0,
            negative: total || 0
          }
        }

        return {
          name: day.toLocaleDateString('default', { weekday: 'short' }),
          total: total || 0,
          positive: positive || 0,
          negative: (total || 0) - (positive || 0)
        }
      })
    )

    // Update cache with latest review timestamp
    cache.set(cacheKey, {
      data: stats,
      timestamp: now,
      lastReviewTimestamp: latestReview?.created_at || null
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching review stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch review statistics" },
      { status: 500 }
    )
  }
} 