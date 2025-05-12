"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createForm } from '@/app/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, MessageSquare, Star, Link as LinkIcon, Settings } from 'lucide-react'

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent"
}

const WELCOME_MESSAGES = [
  "How was your experience with us?",
  "How would you rate your experience?",
  "What did you think of our service?",
  "How satisfied were you with your visit?",
  "How was your interaction with our team?"
]

const THANK_YOU_MESSAGES = [
  "Thank you for your feedback!",
  "We appreciate your time!",
  "Thanks for helping us improve!",
  "Your feedback means a lot to us!",
  "Thank you for sharing your thoughts!"
]

export default function NewFormPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [negativeRedirectType, setNegativeRedirectType] = useState('internal')
  const [useCompanyNameAsSlug, setUseCompanyNameAsSlug] = useState(true)
  const [negativeFeedbackQuestions, setNegativeFeedbackQuestions] = useState([
    "Service Quality",
    "Long Wait Time",
    "Staff Behavior",
    "Product Issue",
    "Price Concerns",
    "Other"
  ])
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    slug: '',
    welcomeMessage: WELCOME_MESSAGES[0],
    ratingThreshold: '4',
    positiveRedirectUrl: '',
    negativeRedirectUrl: '',
    negativeRedirectType: 'internal'
  })

  // Update slug when company name changes if useCompanyNameAsSlug is true
  useEffect(() => {
    if (useCompanyNameAsSlug && formData.companyName) {
      const slug = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.companyName, useCompanyNameAsSlug])

  // Handle company name change separately to update slug
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      companyName: value
    }))
    
    // If using company name as slug, update the slug
    if (useCompanyNameAsSlug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  // Handle slug change separately
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    // Only allow lowercase letters, numbers, and hyphens
    const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setFormData(prev => ({
      ...prev,
      slug: sanitizedValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Validate all required fields
      const requiredFields: Record<string, string> = {
        companyName: 'Company name',
        name: 'Form name',
        slug: 'Form URL slug',
        welcomeMessage: 'Welcome message',
        positiveRedirectUrl: 'Positive review redirect URL'
      }

      // Add negative redirect URL to required fields only if external redirect is selected
      if (formData.negativeRedirectType === 'external') {
        requiredFields.negativeRedirectUrl = 'Negative review redirect URL'
      }

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field as keyof typeof formData]?.trim()) {
          throw new Error(`${label} is required`)
        }
      }

      // Validate URLs
      if (!formData.positiveRedirectUrl.startsWith('http')) {
        throw new Error('Positive redirect URL must be a valid URL starting with http:// or https://')
      }
      if (formData.negativeRedirectType === 'external' && !formData.negativeRedirectUrl.startsWith('http')) {
        throw new Error('Negative redirect URL must be a valid URL starting with http:// or https://')
      }

      const formDataObj = new FormData()
      formDataObj.append('companyName', formData.companyName)
      formDataObj.append('name', formData.name)
      formDataObj.append('slug', formData.slug)
      formDataObj.append('welcomeMessage', formData.welcomeMessage)
      formDataObj.append('ratingThreshold', formData.ratingThreshold)
      formDataObj.append('positiveRedirectUrl', formData.positiveRedirectUrl)
      formDataObj.append('negativeRedirectUrl', formData.negativeRedirectUrl)
      formDataObj.append('negativeRedirectType', formData.negativeRedirectType)

      // Add negative feedback questions to form data
      if (formData.negativeRedirectType === 'internal') {
        if (negativeFeedbackQuestions.length === 0) {
          throw new Error('At least one negative feedback question is required for internal redirect')
        }
        formDataObj.append('negativeFeedbackQuestions', JSON.stringify(negativeFeedbackQuestions))
      }

      const result = await createForm(formDataObj)
      
      if (result.success) {
        setSuccess('Form created successfully!')
        setTimeout(() => {
          router.push('/dashboard/forms')
        }, 1500)
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function handleAddQuestion() {
    setNegativeFeedbackQuestions([...negativeFeedbackQuestions, ''])
  }

  function handleRemoveQuestion(index: number) {
    setNegativeFeedbackQuestions(questions => questions.filter((_, i) => i !== index))
  }

  function handleQuestionChange(index: number, value: string) {
    setNegativeFeedbackQuestions(questions => 
      questions.map((q, i) => i === index ? value : q)
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8">
      <div className="mb-4">
        <Button variant="outline" className="gap-2 text-sm py-1 px-3" asChild>
          <Link href="/dashboard/forms">
            <ArrowLeft className="h-3 w-3" />
            Back to Forms
          </Link>
        </Button>
      </div>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Create New Feedback Form</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Set up a new feedback form for your customers</p>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-muted-foreground mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleCompanyNameChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                  Form Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Customer Feedback Form"
                />
              </div>
            </div>
          </div>

          {/* Form URL */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Form URL</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useCompanyNameAsSlug"
                  checked={useCompanyNameAsSlug}
                  onChange={(e) => {
                    setUseCompanyNameAsSlug(e.target.checked)
                    if (e.target.checked && formData.companyName) {
                      const slug = formData.companyName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                      setFormData(prev => ({ ...prev, slug }))
                    }
                  }}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="useCompanyNameAsSlug" className="ml-2 block text-sm text-muted-foreground">
                  Use company name as form URL
                </label>
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-muted-foreground mb-1">
                  Form URL Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  required
                  disabled={useCompanyNameAsSlug}
                  pattern="[a-z0-9-]+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  placeholder="e.g., customer-feedback"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your form will be available at: <span className="font-medium text-foreground">{process.env.NEXT_PUBLIC_SITE_URL}/review/{formData.slug}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Welcome Message</h2>
            </div>
            <div className="space-y-4">
              <select
                id="welcomeMessageDropdown"
                onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                defaultValue="How was your experience with us?"
              >
                <option value="">Select a predefined message</option>
                {WELCOME_MESSAGES.map((message) => (
                  <option key={message} value={message}>
                    {message}
                  </option>
                ))}
              </select>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Or enter your custom welcome message"
                rows={3}
              />
            </div>
          </div>

          {/* Rating Settings */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Rating Settings</h2>
            </div>
            <div>
              <label htmlFor="ratingThreshold" className="block text-sm font-medium text-muted-foreground mb-1">
                Rating Threshold *
              </label>
              <select
                id="ratingThreshold"
                name="ratingThreshold"
                value={formData.ratingThreshold}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {Object.entries(RATING_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label} ({value}) - Reviews below this are negative
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Redirect Settings */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Redirect Settings</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="positiveRedirectUrl" className="block text-sm font-medium text-muted-foreground mb-1">
                  Positive Review Redirect URL *
                </label>
                <input
                  type="url"
                  id="positiveRedirectUrl"
                  name="positiveRedirectUrl"
                  value={formData.positiveRedirectUrl}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., https://g.page/r/your-business/review"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  URL where users will be redirected after a positive review (e.g., Google Reviews page)
                </p>
              </div>

              <div>
                <label htmlFor="negativeRedirectType" className="block text-sm font-medium text-muted-foreground mb-1">
                  Negative Review Handling *
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="negativeRedirectType"
                        value="internal"
                        checked={formData.negativeRedirectType === 'internal'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            negativeRedirectType: e.target.value,
                            negativeRedirectUrl: ''
                          }))
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">Show feedback form</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="negativeRedirectType"
                        value="external"
                        checked={formData.negativeRedirectType === 'external'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            negativeRedirectType: e.target.value
                          }))
                          setNegativeFeedbackQuestions([
                            "Service Quality",
                            "Long Wait Time",
                            "Staff Behavior",
                            "Product Issue",
                            "Price Concerns",
                            "Other"
                          ])
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">Redirect to URL</span>
                    </label>
                  </div>
                </div>
              </div>

              {formData.negativeRedirectType === 'external' && (
                <div>
                  <label htmlFor="negativeRedirectUrl" className="block text-sm font-medium text-muted-foreground mb-1">
                    Negative Review Redirect URL *
                  </label>
                  <input
                    type="url"
                    id="negativeRedirectUrl"
                    name="negativeRedirectUrl"
                    value={formData.negativeRedirectUrl}
                    onChange={handleChange}
                    required={formData.negativeRedirectType === 'external'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., https://your-domain.com/feedback-form"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    URL where users will be redirected after a negative review
                  </p>
                </div>
              )}

              {formData.negativeRedirectType === 'internal' && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Negative Feedback Questions *
                  </label>
                  <div className="space-y-2">
                    {negativeFeedbackQuestions.map((question, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                          required
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter question"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveQuestion(index)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddQuestion}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6">
            {(error || success) && (
              <div className={`mb-6 p-4 rounded-md border ${
                error 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {error || success}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/forms">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? 'Creating...' : 'Create Form'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 