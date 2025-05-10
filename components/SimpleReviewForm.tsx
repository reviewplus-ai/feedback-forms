"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface SimpleReviewFormProps {
  welcomeMessage?: string
  thankYouMessage?: string
  primaryColor?: string
  logoUrl?: string
  enableComments?: boolean
}

export function SimpleReviewForm({
  welcomeMessage = "How would you rate your experience?",
  thankYouMessage = "Thank you for your feedback!",
  primaryColor = "#4f46e5",
  logoUrl,
  enableComments = true,
}: SimpleReviewFormProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return

    // Here you would typically send the data to your API
    console.log("Review submitted:", { rating, comment })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">{thankYouMessage}</h2>
        <p className="text-gray-600">Your rating: {rating} stars</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      {logoUrl && (
        <div className="mb-6 text-center">
          <img src={logoUrl} alt="Company Logo" className="h-12 mx-auto" />
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-center mb-6">{welcomeMessage}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-2 rounded-full transition-colors ${
                rating && star <= rating
                  ? "text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              <Star className="w-8 h-8" fill="currentColor" />
            </button>
          ))}
        </div>

        {enableComments && (
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience (optional)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!rating}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
            rating
              ? `bg-[${primaryColor}] hover:opacity-90`
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Submit Review
        </button>
      </form>
    </div>
  )
} 