"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  formId: string
  welcomeMessage?: string
  thankYouMessage?: string
  enableComments?: boolean
  primaryColor?: string
  logoUrl?: string
}

export function ReviewForm({
  formId,
  welcomeMessage = "How would you rate your experience?",
  thankYouMessage = "Thank you for your feedback!",
  enableComments = true,
  primaryColor = "#4f46e5",
  logoUrl,
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  })

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          rating: data.rating,
          comment: data.comment,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      setShowThankYou(true)
      toast.success(thankYouMessage)
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showThankYou) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
        <p className="text-gray-600">{thankYouMessage}</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {logoUrl && (
        <div className="mb-6 flex justify-center">
          <img src={logoUrl} alt="Company Logo" className="h-12" />
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-center mb-6">{welcomeMessage}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center space-x-4">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label
              key={rating}
              className="cursor-pointer"
              style={{ color: primaryColor }}
            >
              <input
                type="radio"
                value={rating}
                {...register("rating")}
                className="hidden"
              />
              <span className="text-4xl hover:scale-110 transition-transform">
                {rating <= (watch("rating") || 0) ? "★" : "☆"}
              </span>
            </label>
          ))}
        </div>

        {errors.rating && (
          <p className="text-red-500 text-sm text-center">
            Please select a rating
          </p>
        )}

        {enableComments && (
          <div>
            <Textarea
              placeholder="Tell us more about your experience (optional)"
              {...register("comment")}
              className="min-h-[100px]"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  )
} 