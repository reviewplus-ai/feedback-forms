"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createForm } from '@/app/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, MessageSquare, Star, Link as LinkIcon, Settings } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

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
  const [neutralRedirectType, setNeutralRedirectType] = useState('internal')
  const [neutralRedirectUrl, setNeutralRedirectUrl] = useState('')
  const [neutralFeedbackQuestions, setNeutralFeedbackQuestions] = useState([
    "Parking availability or convenience",
    "Cleanliness of the premises",
    "Staff helpfulness",
    "Waiting time",
    "Quality of amenities (WiFi, restrooms, etc.)",
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
  const [socialReviewLinks, setSocialReviewLinks] = useState<{ name: string; url: string }[]>([])

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
      formDataObj.append('neutralRedirectType', neutralRedirectType)
      formDataObj.append('neutralRedirectUrl', neutralRedirectUrl)
      if (neutralRedirectType === 'internal') {
        formDataObj.append('neutralFeedbackQuestions', JSON.stringify(neutralFeedbackQuestions))
      }

      // Add negative feedback questions to form data
      if (formData.negativeRedirectType === 'internal') {
        if (negativeFeedbackQuestions.length === 0) {
          throw new Error('At least one negative feedback question is required for internal redirect')
        }
        formDataObj.append('negativeFeedbackQuestions', JSON.stringify(negativeFeedbackQuestions))
      }

      formDataObj.append('socialReviewLinks', JSON.stringify(socialReviewLinks))

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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter your company and form details.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Form URL */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Form URL</CardTitle>
              <CardDescription>Set the public URL for your feedback form.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Welcome Message */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Welcome Message</CardTitle>
              <CardDescription>Customize the greeting shown to users.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Rating Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Rating Settings</CardTitle>
              <CardDescription>Set the threshold for positive and negative reviews.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Redirect Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Redirect Settings</CardTitle>
              <CardDescription>Configure where users go after submitting feedback. Social review links are shown after a positive review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label htmlFor="positiveRedirectUrl" className="block text-base font-semibold text-foreground mb-1">
                    Positive Review Redirect URL <span className="text-red-500">*</span>
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

                {/* Social Review Links (now under positive redirect) */}
                <div>
                  <label className="block text-base font-semibold text-foreground mb-1">Social Review Links</label>
                  <p className="text-muted-foreground text-sm mb-2 font-medium">These links will be shown to users after a <span className="font-bold text-green-600">positive</span> review. Add your business's public review pages (e.g., Google, Facebook, etc.).</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSocialReviewLinks([...socialReviewLinks, { name: '', url: '' }])} className="mb-3">
                    Add Link
                  </Button>
                  <div className="space-y-3">
                    {socialReviewLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded p-2">
                        {/* Optional: Add platform icon if recognized */}
                        {link.name.toLowerCase().includes('google') && (
                          <img src="/logo.png" alt="Google" className="h-6 w-6" />
                        )}
                        {link.name.toLowerCase().includes('facebook') && (
                          <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
                        )}
                        <input
                          type="text"
                          placeholder="Platform Name (e.g. Google)"
                          value={link.name}
                          onChange={e => setSocialReviewLinks(links => links.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <input
                          type="url"
                          placeholder="Review URL"
                          value={link.url}
                          onChange={e => setSocialReviewLinks(links => links.map((l, i) => i === idx ? { ...l, url: e.target.value } : l))}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => setSocialReviewLinks(links => links.filter((_, i) => i !== idx))} title="Remove link">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="negativeRedirectType" className="block text-base font-semibold text-foreground mb-1">
                    Negative Review Handling <span className="text-red-500">*</span>
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

                {/* Neutral Feedback Handling (now under redirect settings) */}
                <div>
                  <label className="block text-base font-semibold text-foreground mb-1">Neutral Feedback Handling</label>
                  <p className="text-muted-foreground text-sm mb-2 font-medium">This controls what happens for <span className="font-bold text-blue-600">neutral</span> reviews (e.g., 3 stars).</p>
                  <select
                    value={neutralRedirectType}
                    onChange={e => setNeutralRedirectType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="internal">Show improvements form</option>
                    <option value="external">Redirect to URL</option>
                  </select>
                  {neutralRedirectType === 'external' && (
                    <input
                      type="url"
                      value={neutralRedirectUrl}
                      onChange={e => setNeutralRedirectUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mt-2"
                      placeholder="e.g., https://your-domain.com/neutral-feedback"
                    />
                  )}
                  {neutralRedirectType === 'internal' && (
                    <div className="space-y-2 mt-2">
                      <label className="block text-xs text-muted-foreground mb-1">Neutral Feedback Questions</label>
                      {neutralFeedbackQuestions.map((question, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={question}
                            onChange={e => setNeutralFeedbackQuestions(qs => qs.map((q, i) => i === index ? e.target.value : q))}
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter question"
                          />
                          <Button type="button" variant="outline" size="icon" onClick={() => setNeutralFeedbackQuestions(qs => qs.filter((_, i) => i !== index))} className="shrink-0"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => setNeutralFeedbackQuestions(qs => [...qs, ''])} className="w-full gap-2"><Plus className="h-4 w-4" />Add Question</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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