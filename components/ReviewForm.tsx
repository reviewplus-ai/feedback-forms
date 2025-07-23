"use client"

import { useState } from "react"
import { submitReview } from "@/app/actions"
import { motion } from "framer-motion"

interface ReviewFormProps {
  formId: string
  welcomeMessage: string
  thankYouMessage: string
  ratingThreshold: number
  positiveRedirectUrl: string
  negativeRedirectUrl: string
  negativeRedirectType: "internal" | "external"
  negativeFeedbackQuestions: string[]
  enableComments: boolean
  primaryColor: string
  companyName: string
  neutralRedirectType?: "internal" | "external"
  neutralRedirectUrl?: string
  neutralFeedbackQuestions?: string[]
  socialReviewLinks?: { name: string; url: string }[]
}

interface ReviewResponse {
  success: boolean
  data?: {
    review: any
    ratingThreshold: number
    negativeRedirectType: string
    negativeRedirectUrl: string
    companyName: string
    positiveRedirectUrl?: string
  }
  error?: string
}

export function ReviewForm({
  formId,
  welcomeMessage,
  ratingThreshold,
  positiveRedirectUrl,
  negativeRedirectUrl,
  negativeRedirectType,
  negativeFeedbackQuestions,
  primaryColor = "#B4D335",
  companyName,
  neutralRedirectType,
  neutralRedirectUrl,
  neutralFeedbackQuestions,
  socialReviewLinks
}: ReviewFormProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNegativeFeedback, setShowNegativeFeedback] = useState(false)
  const [negativeResponses, setNegativeResponses] = useState<string[]>([])
  const [contactDetails, setContactDetails] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showNeutralFeedback, setShowNeutralFeedback] = useState(false)
  const [neutralFeedback, setNeutralFeedback] = useState("")
  const [neutralResponses, setNeutralResponses] = useState<string[]>([])
  const [showSocialLinks, setShowSocialLinks] = useState(false)
  const [selectedSocialLink, setSelectedSocialLink] = useState<string | null>(null)

  const getRatingEmoji = (value: number) => {
    switch (value) {
      case 1: return "😞"
      case 2: return "😕"
      case 3: return "😊"
      case 4: return "😃"
      case 5: return "😍"
      default: return ""
    }
  }

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1: return "Poor"
      case 2: return "Fair"
      case 3: return "Good"
      case 4: return "Very Good"
      case 5: return "Excellent"
      default: return value.toString()
    }
  }

  const handleNegativeFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('formId', formId)
      if (rating !== null) {
        formData.append('rating', rating.toString())
      }

      // Add selected feedback categories
      const feedbackCategories = negativeResponses.filter(response => response !== "Other")
      formData.append('feedbackCategories', JSON.stringify(feedbackCategories))
      
      // Add other feedback if provided
      if (feedback) {
        formData.append('otherFeedback', feedback)
      }
      
      // Add contact details if provided
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
      const name = nameInput?.value?.trim()
      if (name) {
        formData.append('name', name)
      }
      if (contactDetails.trim()) {
        formData.append('contact', contactDetails.trim())
      }

      const result = await submitReview(formData)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review')
      }

      // Send Telegram notification
      if (result.data?.review) {
        await fetch('/api/telegram/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId,
            review: {
              rating: result.data.review.rating,
              comment: result.data.review.comment,
              name: name,
              contact_details: contactDetails.trim(),
              negative_responses: feedbackCategories,
              other_feedback: feedback
            },
          }),
        });
      }

      // Redirect to the thank you page
      window.location.href = '/thank-you'
    } catch (err) {
      console.error("Submit error:", err)
      // Extract the specific error message from the error object
      let errorMessage = "An error occurred while submitting your review"
      
      if (err instanceof Error) {
        // Check for specific error messages
        if (err.message.includes("row-level security policy")) {
          errorMessage = "Permission error: You don't have permission to submit this review. Please try again."
        } else if (err.message.includes("Failed to create review")) {
          errorMessage = "Database error: Unable to save your review. Please try again."
        } else if (err.message.includes("Failed to get form details")) {
          errorMessage = "Form error: The review form could not be found. Please check the form ID."
        } else if (err.message.includes("Invalid form data")) {
          errorMessage = "Validation error: Please provide a valid rating."
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  const handlePositiveReviewSubmit = async (value: number) => {
    const formData = new FormData()
    formData.append('formId', formId)
    formData.append('rating', value.toString())
    
    // Add contact details if provided
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    const name = nameInput?.value?.trim()
    if (name) {
      formData.append('name', name)
    }
    if (contactDetails.trim()) {
      formData.append('contact', contactDetails.trim())
    }
    
    try {
      setIsSubmitting(true)
      const result = await submitReview(formData)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review')
      }
      
      // If social links are provided, show them instead of redirecting immediately
      if (Array.isArray(socialReviewLinks) && socialReviewLinks.length > 0 && socialReviewLinks[0]?.url) {
        setShowSocialLinks(true)
        setIsSubmitting(false)
        return
      }
      
      // Redirect to the positive review URL
      if (positiveRedirectUrl) {
        window.location.href = positiveRedirectUrl
      } else {
        // Fallback to thank you page if no redirect URL is set
        window.location.href = '/thank-you'
      }
    } catch (err) {
      console.error("Submit error:", err)
      // Extract the specific error message from the error object
      let errorMessage = "An error occurred while submitting your review"
      
      if (err instanceof Error) {
        // Check for specific error messages
        if (err.message.includes("row-level security policy")) {
          errorMessage = "Permission error: You don't have permission to submit this review. Please try again."
        } else if (err.message.includes("Failed to create review")) {
          errorMessage = "Database error: Unable to save your review. Please try again."
        } else if (err.message.includes("Failed to get form details")) {
          errorMessage = "Form error: The review form could not be found. Please check the form ID."
        } else if (err.message.includes("Invalid form data")) {
          errorMessage = "Validation error: Please provide a valid rating."
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  const handleNeutralFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    if (neutralRedirectType === 'external' && neutralRedirectUrl) {
      // Submit and redirect
      const formData = new FormData()
      formData.append('formId', formId)
      if (rating !== null) {
        formData.append('rating', rating.toString())
      }
      // Add selected feedback categories
      const feedbackCategories = neutralResponses.filter(response => response !== "Other")
      formData.append('neutralFeedbackCategories', JSON.stringify(feedbackCategories))
      // Add other feedback if provided
      if (neutralFeedback) {
        formData.append('neutralOtherFeedback', neutralFeedback)
      }
      // Add contact details if provided
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
      const name = nameInput?.value?.trim()
      if (name) {
        formData.append('name', name)
      }
      if (contactDetails.trim()) {
        formData.append('contact', contactDetails.trim())
      }
      const result = await submitReview(formData)
      if (!result.success) {
        setError(result.error || 'Failed to submit review')
        setIsSubmitting(false)
        return
      }
      window.location.href = neutralRedirectUrl
      return
    }
    try {
      const formData = new FormData()
      formData.append('formId', formId)
      if (rating !== null) {
        formData.append('rating', rating.toString())
      }
      // Add selected feedback categories
      const feedbackCategories = neutralResponses.filter(response => response !== "Other")
      formData.append('neutralFeedbackCategories', JSON.stringify(feedbackCategories))
      // Add other feedback if provided
      if (neutralFeedback) {
        formData.append('neutralOtherFeedback', neutralFeedback)
      }
      // Add contact details if provided
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
      const name = nameInput?.value?.trim()
      if (name) {
        formData.append('name', name)
      }
      if (contactDetails.trim()) {
        formData.append('contact', contactDetails.trim())
      }
      const result = await submitReview(formData)
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review')
      }
      // Send Telegram notification
      if (result.data?.review) {
        await fetch('/api/telegram/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId,
            review: {
              rating: result.data.review.rating,
              comment: result.data.review.comment,
              name: name,
              contact_details: contactDetails.trim(),
              neutral_feedback_categories: feedbackCategories,
              neutral_other_feedback: neutralFeedback
            },
          }),
        });
      }
      window.location.href = '/thank-you'
    } catch (err) {
      console.error("Submit error:", err)
      let errorMessage = "An error occurred while submitting your review"
      if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  const handleRatingSelect = async (value: number) => {
    setRating(value)
    setError("")

    if (value >= ratingThreshold) {
      // If social links are provided, show them before submitting
      if (Array.isArray(socialReviewLinks) && socialReviewLinks.length > 0) {
        setShowSocialLinks(true)
        return
      }
      // For positive reviews, submit immediately
      await handlePositiveReviewSubmit(value)
    } else if (value === 3) {
      if (neutralRedirectType === 'external' && neutralRedirectUrl) {
        // For external redirect, submit and redirect
        const formData = new FormData()
        formData.append('formId', formId)
        formData.append('rating', value.toString())
        // Add contact details if provided
        const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
        const name = nameInput?.value?.trim()
        if (name) {
          formData.append('name', name)
        }
        if (contactDetails.trim()) {
          formData.append('contact', contactDetails.trim())
        }
        try {
          setIsSubmitting(true)
          const result = await submitReview(formData)
          if (!result.success) {
            throw new Error(result.error || 'Failed to submit review')
          }
          window.location.href = neutralRedirectUrl
          return
        } catch (err) {
          let errorMessage = "An error occurred while submitting your review"
          if (err instanceof Error) errorMessage = err.message
          setError(errorMessage)
          setIsSubmitting(false)
          return
        }
      } else {
        // For internal, show feedback form
        setShowNeutralFeedback(true)
      }
    } else {
      // For negative reviews, handle based on redirect type
      if (negativeRedirectType === 'external') {
        // For external redirect, submit and redirect
        const formData = new FormData()
        formData.append('formId', formId)
        formData.append('rating', value.toString())
        
        try {
          setIsSubmitting(true)
          const result = await submitReview(formData)
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to submit review')
          }
          
          // Send Telegram notification
          if (result.data?.review) {
            await fetch('/api/telegram/notify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                formId,
                review: {
                  rating: result.data.review.rating,
                  comment: result.data.review.comment,
                  name: name,
                  contact_details: contactDetails.trim(),
                },
              }),
            });
          }
          
          // Redirect to the negative review URL
          if (negativeRedirectUrl) {
            window.location.href = negativeRedirectUrl
          } else {
            // Fallback to thank you page if no redirect URL is set
            window.location.href = '/thank-you'
          }
        } catch (err) {
          console.error("Submit error:", err)
          // Extract the specific error message from the error object
          let errorMessage = "An error occurred while submitting your review"
          
          if (err instanceof Error) {
            // Check for specific error messages
            if (err.message.includes("row-level security policy")) {
              errorMessage = "Permission error: You don't have permission to submit this review. Please try again."
            } else if (err.message.includes("Failed to create review")) {
              errorMessage = "Database error: Unable to save your review. Please try again."
            } else if (err.message.includes("Failed to get form details")) {
              errorMessage = "Form error: The review form could not be found. Please check the form ID."
            } else if (err.message.includes("Invalid form data")) {
              errorMessage = "Validation error: Please provide a valid rating."
            } else {
              errorMessage = err.message
            }
          }
          
          setError(errorMessage)
          setIsSubmitting(false)
        }
      } else {
        // For internal redirect, show feedback form
        setShowNegativeFeedback(true)
      }
    }
  }

  if (showNegativeFeedback) {
    return (
      <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-[#1C1F37]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] mx-4 bg-white rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#B4D335]" />
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1C1F37] mb-2">
                What went wrong?
              </h2>
              <p className="text-gray-600 text-sm">
                Select all that apply. Your feedback helps us improve.
              </p>
            </div>

            <div className="space-y-4">
              {/* Quick Selection Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {negativeFeedbackQuestions
                  .filter(option => option !== "Other")
                  .concat(["Other"])
                  .map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (option === "Other") {
                          if (negativeResponses.includes("Other")) {
                            setNegativeResponses(prev => prev.filter(r => r !== "Other"))
                          } else {
                            setNegativeResponses(prev => [...prev, "Other"])
                          }
                        } else {
                          setNegativeResponses(prev => 
                            prev.includes(option) 
                              ? prev.filter(r => r !== option)
                              : [...prev, option]
                          )
                        }
                      }}
                      className={`
                        py-3 px-4 rounded-lg text-sm font-medium
                        border transition-all duration-200
                        ${negativeResponses.includes(option) 
                          ? 'bg-[#B4D335] border-[#B4D335] text-white' 
                          : 'bg-white border-[#B4D335] text-[#1C1F37] hover:bg-gray-50'
                        }
                      `}
                    >
                      {option}
                    </motion.button>
                  ))}
              </div>

              {/* Other Feedback Text Area */}
              {negativeResponses.includes("Other") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <textarea
                    placeholder="Please tell us more..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-[#B4D335] rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#B4D335] focus:border-transparent transition-all duration-200 text-sm min-h-[80px] resize-none"
                  />
                </motion.div>
              )}

              {/* Contact Option */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-[#1C1F37] mb-2">
                  Would you like us to contact you about this?
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name (optional)"
                    className="w-full p-3 bg-gray-50 border border-[#B4D335] rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#B4D335] focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <input
                    type="text"
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    placeholder="Your email or phone number (optional)"
                    className="w-full p-3 bg-gray-50 border border-[#B4D335] rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#B4D335] focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-xs text-center p-2.5 bg-red-50 rounded-lg border border-red-200"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNegativeFeedbackSubmit}
                disabled={isSubmitting || negativeResponses.length === 0}
                className="w-full py-3 px-4 bg-[#B4D335] text-white rounded-lg hover:bg-[#9BB82B] disabled:opacity-50 transition-all duration-200 font-medium text-sm mt-4"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : "Submit Feedback"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (showNeutralFeedback) {
    return (
      <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-[#1C1F37]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] mx-4 bg-white rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#B4D335]" />
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1C1F37] mb-2">
                What improvements should be done?
              </h2>
              <p className="text-gray-600 text-sm">
                Please let us know how we can improve your experience.
              </p>
            </div>
            <form onSubmit={handleNeutralFeedbackSubmit} className="space-y-4">
              {/* Quick Selection Buttons for Neutral Categories */}
              <div className="grid grid-cols-2 gap-2">
                {(neutralFeedbackQuestions || []).filter(option => option !== "Other").concat(["Other"]).map((option) => (
                  <motion.button
                    key={option}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      if (option === "Other") {
                        if (neutralResponses.includes("Other")) {
                          setNeutralResponses(prev => prev.filter(r => r !== "Other"))
                        } else {
                          setNeutralResponses(prev => [...prev, "Other"])
                        }
                      } else {
                        setNeutralResponses(prev =>
                          prev.includes(option)
                            ? prev.filter(r => r !== option)
                            : [...prev, option]
                        )
                      }
                    }}
                    className={`
                      py-3 px-4 rounded-lg text-sm font-medium
                      border transition-all duration-200
                      ${neutralResponses.includes(option)
                        ? 'bg-[#B4D335] border-[#B4D335] text-white'
                        : 'bg-white border-[#B4D335] text-[#1C1F37] hover:bg-gray-50'
                      }
                    `}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
              {/* Other Feedback Text Area */}
              {neutralResponses.includes("Other") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <textarea
                    placeholder="Please tell us more..."
                    value={neutralFeedback}
                    onChange={(e) => setNeutralFeedback(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-[#B4D335] rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#B4D335] focus:border-transparent transition-all duration-200 text-sm min-h-[80px] resize-none"
                  />
                </motion.div>
              )}
              <input
                type="text"
                name="name"
                placeholder="Your name (optional)"
                className="w-full p-3 bg-gray-50 border border-[#B4D335] rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#B4D335] focus:border-transparent transition-all duration-200 text-sm"
              />
              <input
                type="text"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                placeholder="Your email or phone number (optional)"
                className="w-full p-3 bg-gray-50 border border-[#B4D335] rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#B4D335] focus:border-transparent transition-all duration-200 text-sm"
              />
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-xs text-center p-2.5 bg-red-50 rounded-lg border border-red-200"
                >
                  {error}
                </motion.div>
              )}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || (neutralResponses.length === 0)}
                className="w-full py-3 px-4 bg-[#B4D335] text-white rounded-lg hover:bg-[#9BB82B] disabled:opacity-50 transition-all duration-200 font-medium text-sm mt-4"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : "Submit Feedback"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  if (showSocialLinks && Array.isArray(socialReviewLinks) && socialReviewLinks.length > 0) {
    return (
      <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-[#1C1F37]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] mx-4 bg-white rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#B4D335]" />
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1C1F37] mb-2">
                Share Your Review Publicly
              </h2>
              <p className="text-gray-600 text-sm">
                Please choose a platform to leave your public review:
              </p>
            </div>
            <div className="space-y-3">
              {socialReviewLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={async () => {
                    window.open(link.url, '_blank')
                    // Now submit the review and redirect to positiveRedirectUrl
                    await handlePositiveReviewSubmit(rating || ratingThreshold)
                    if (positiveRedirectUrl) {
                      window.location.href = positiveRedirectUrl
                    } else {
                      window.location.href = '/thank-you'
                    }
                  }}
                  className="w-full py-3 px-4 bg-[#B4D335] text-white rounded-lg hover:bg-[#9BB82B] transition-all duration-200 font-medium text-sm"
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={async () => {
                  // Optionally allow skipping
                  await handlePositiveReviewSubmit(rating || ratingThreshold)
                  if (positiveRedirectUrl) {
                    window.location.href = positiveRedirectUrl
                  } else {
                    window.location.href = '/thank-you'
                  }
                }}
                className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium text-sm mt-2"
              >
                Skip & Continue
              </button>
            </div>
            <div className="text-center mt-8">
              <a 
                href="https://reviewplus.co.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1C1F37] text-xs hover:text-[#B4D335] transition-colors duration-200"
              >
                Powered by
                <span className="font-medium text-[#B4D335]">ReviewPlus</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-[#1C1F37]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] mx-4 bg-white rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#B4D335]" />
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-3 text-[#1C1F37]">
              {companyName}
            </h1>
            <p className="text-gray-600 text-base">
              {welcomeMessage}
            </p>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((value) => {
              const isActive = (hoverRating || rating || 0) >= value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => handleRatingSelect(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    relative touch-none
                    w-full h-[80px]
                    flex flex-col items-center justify-center
                    py-2 px-1 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-[#B4D335] border border-[#B4D335]' 
                      : 'bg-white border border-[#B4D335]'
                    }
                    disabled:opacity-50
                  `}
                >
                  <span className="text-2xl mb-2">
                    {getRatingEmoji(value)}
                  </span>
                  <span className={`
                    text-[11px] font-medium text-center leading-tight
                    ${isActive ? 'text-white' : 'text-[#1C1F37]'}
                  `}>
                    {getRatingLabel(value)}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg mt-4 border border-red-200"
            >
              {error}
            </motion.div>
          )}

          {isSubmitting && (
            <div className="flex justify-center mt-4">
              <div 
                className="w-5 h-5 border-2 border-gray-200 rounded-full animate-spin"
                style={{ borderTopColor: "#B4D335" }}
              />
            </div>
          )}

          <div className="text-center mt-8">
            <a 
              href="https://reviewplus.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1C1F37] text-xs hover:text-[#B4D335] transition-colors duration-200"
            >
              Powered by
              <span className="font-medium text-[#B4D335]">ReviewPlus</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 