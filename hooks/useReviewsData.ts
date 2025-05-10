import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  comment: string | null
  feedback_categories: string[] | null
  createdAt: string
  form: {
    id: string
    name: string
  }
}

interface ReviewStats {
  name: string
  total: number
}

const RECENT_CACHE_KEY = 'recent-reviews'
const STATS_CACHE_KEY = 'review-stats'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

export function useReviewsData() {
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const getCachedData = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = new Date().getTime()

      // Check if cache is expired
      if (now - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(key)
        return null
      }

      return data
    } catch (error) {
      console.error('Error reading cache:', error)
      return null
    }
  }, [])

  const setCachedData = useCallback((key: string, data: any) => {
    try {
      const cache = {
        data,
        timestamp: new Date().getTime()
      }
      localStorage.setItem(key, JSON.stringify(cache))
    } catch (error) {
      console.error('Error writing to cache:', error)
    }
  }, [])

  const fetchReviewsData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedRecent = getCachedData(RECENT_CACHE_KEY)
        const cachedStats = getCachedData(STATS_CACHE_KEY)
        
        if (cachedRecent && cachedStats) {
          setRecentReviews(cachedRecent)
          setReviewStats(cachedStats)
          setError(null)
          setLastUpdated(new Date())
          setLoading(false)
          return
        }
      }

      // Fetch both endpoints in parallel
      const [recentResponse, statsResponse] = await Promise.all([
        fetch("/api/reviews/recent", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
        fetch("/api/reviews/stats", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      ])

      if (!recentResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch reviews data")
      }

      const [recentData, statsData] = await Promise.all([
        recentResponse.json(),
        statsResponse.json()
      ])

      setRecentReviews(recentData)
      setReviewStats(statsData)
      setError(null)
      setLastUpdated(new Date())
      
      // Update cache
      setCachedData(RECENT_CACHE_KEY, recentData)
      setCachedData(STATS_CACHE_KEY, statsData)
      
      toast.success("Reviews data refreshed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast.error("Failed to refresh reviews data")
    } finally {
      setLoading(false)
    }
  }, [getCachedData, setCachedData])

  useEffect(() => {
    // Initial fetch
    fetchReviewsData()

    // Set up automatic refresh every 5 minutes
    const intervalId = setInterval(() => fetchReviewsData(true), CACHE_EXPIRY)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchReviewsData])

  return {
    recentReviews,
    reviewStats,
    loading,
    error,
    lastUpdated,
    refresh: () => fetchReviewsData(true)
  }
} 