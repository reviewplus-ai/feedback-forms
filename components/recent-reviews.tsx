"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"

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

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchRecentReviews() {
      try {
        const response = await fetch("/api/reviews/recent")
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push("/login")
          return
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch recent reviews")
        }
        
        const data = await response.json()
        // Limit to only 3 reviews
        setReviews(data.slice(0, 3))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentReviews()
  }, [router])

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading recent reviews...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="p-4">
        <p>No recent reviews found.</p>
      </div>
    )
  }

  return (
    <div className="h-[400px] overflow-y-auto pr-2">
      <div className="space-y-3 pb-4">
        {reviews.map((review) => (
          <Link 
            key={review.id} 
            href={`/dashboard/forms/${review.form.id}`}
            className="block"
          >
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{review.form.name}</p>
              {review.comment && (
                <p className="text-sm text-gray-700 break-words whitespace-pre-wrap line-clamp-2">
                  {truncateText(review.comment, 120)}
                </p>
              )}
              {review.feedback_categories && review.feedback_categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {review.feedback_categories.map((category, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 