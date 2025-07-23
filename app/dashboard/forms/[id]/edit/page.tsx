'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updateForm } from '@/app/actions'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, MessageSquare, Star, Link as LinkIcon, Settings, Building2 } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

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

// const THANK_YOU_MESSAGES = [
//   "Thank you for your feedback!",
//   "We appreciate your time!",
//   "Thanks for helping us improve!",
//   "Your feedback means a lot to us!",
//   "Thank you for sharing your thoughts!"
// ]

export default function EditFormPage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const resolvedParams = use(params)
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [negativeRedirectType, setNegativeRedirectType] = useState('internal')
  const [negativeFeedbackQuestions, setNegativeFeedbackQuestions] = useState<string[]>([])
  const [neutralRedirectType, setNeutralRedirectType] = useState('internal')
  const [neutralRedirectUrl, setNeutralRedirectUrl] = useState('')
  const [neutralFeedbackQuestions, setNeutralFeedbackQuestions] = useState<string[]>([])
  const [socialReviewLinks, setSocialReviewLinks] = useState<{ name: string; url: string }[]>([])
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

  useEffect(() => {
    let mounted = true

    async function loadForm() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const { data: form, error } = await supabase
          .from('review_forms')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (error || !form || form.user_id !== session.user.id) {
          router.push('/dashboard')
          return
        }

        if (mounted) {
          setForm(form)
          setFormData({
            companyName: form.company_name || '',
            name: form.name || '',
            slug: form.slug || '',
            welcomeMessage: form.welcome_message || WELCOME_MESSAGES[0],
            ratingThreshold: form.rating_threshold?.toString() || '4',
            positiveRedirectUrl: form.positive_redirect_url || '',
            negativeRedirectUrl: form.negative_redirect_url || '',
            negativeRedirectType: form.negative_redirect_type || 'internal'
          })
          setNegativeRedirectType(form.negative_redirect_type || 'internal')
          setNegativeFeedbackQuestions(form.negative_feedback_questions || [])
          setNeutralRedirectType(form.neutral_redirect_type || 'internal')
          setNeutralRedirectUrl(form.neutral_redirect_url || '')
          setNeutralFeedbackQuestions(form.neutral_feedback_questions || [])
          setSocialReviewLinks(form.social_review_links || [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading form:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadForm()

    return () => {
      mounted = false
    }
  }, [resolvedParams.id, router, supabase])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.append('formId', resolvedParams.id)
      formData.append('negativeFeedbackQuestions', JSON.stringify(negativeFeedbackQuestions))
      formData.append('neutralRedirectType', neutralRedirectType)
      formData.append('neutralRedirectUrl', neutralRedirectUrl)
      if (neutralRedirectType === 'internal') {
        formData.append('neutralFeedbackQuestions', JSON.stringify(neutralFeedbackQuestions))
      }
      formData.append('socialReviewLinks', JSON.stringify(socialReviewLinks))
      
      // Ensure we're not changing the slug
      formData.set('slug', form.slug)
      
      await updateForm(formData)
      toast.success('Form updated successfully')
      router.replace(`/dashboard/forms/${resolvedParams.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update form')
    } finally {
      setSaving(false)
    }
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-6 shadow-sm">
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="container mx-auto py-8">
        <div className="border rounded-lg p-6 bg-yellow-50">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Form Not Found</h2>
          <p className="text-yellow-600">The requested form could not be found.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/forms">Return to Forms</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8">
      <div className="mb-4">
        <Button variant="outline" className="gap-2 text-sm py-1 px-3" asChild>
          <Link href={`/dashboard/forms/${resolvedParams.id}`}>
            <ArrowLeft className="h-3 w-3" />
            Back to Form
          </Link>
        </Button>
      </div>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Feedback Form</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Update your form settings and preferences</p>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            <div className="space-y-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyName" className="text-muted-foreground">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={formData.companyName}
                  disabled
                  className="bg-gray-100 mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">Company name cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="name" className="text-muted-foreground">Form Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={formData.name}
                  disabled
                  className="bg-gray-100 mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">Form name cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="slug" className="text-muted-foreground">Form URL</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={formData.slug}
                  disabled
                  className="bg-gray-100 mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">Form URL cannot be changed</p>
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
                defaultValue={formData.welcomeMessage}
              >
                <option value="">Select a predefined message</option>
                {WELCOME_MESSAGES.map((message) => (
                  <option key={message} value={message}>
                    {message}
                  </option>
                ))}
              </select>
              <Textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                placeholder="Or enter your custom welcome message"
                className="w-full"
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
              <Label htmlFor="ratingThreshold" className="text-muted-foreground">Rating Threshold</Label>
              <select
                id="ratingThreshold"
                name="ratingThreshold"
                value={formData.ratingThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, ratingThreshold: e.target.value }))}
                className="w-full mt-1"
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
                <Label htmlFor="positiveRedirectUrl" className="text-muted-foreground">Positive Review Redirect URL</Label>
                <Input
                  id="positiveRedirectUrl"
                  name="positiveRedirectUrl"
                  type="url"
                  defaultValue={formData.positiveRedirectUrl}
                  required
                  placeholder="e.g., https://g.page/r/your-business/review"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  URL where users will be redirected after a positive review (e.g., Google Reviews page)
                </p>
              </div>

              <div>
                <Label htmlFor="negativeRedirectType" className="text-muted-foreground">Negative Review Handling</Label>
                <div className="space-y-4 mt-1">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="negativeRedirectType"
                        value="internal"
                        checked={formData.negativeRedirectType === 'internal'}
                        onChange={(e) => setFormData(prev => ({ ...prev, negativeRedirectType: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, negativeRedirectType: e.target.value }))}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">Redirect to URL</span>
                    </label>
                  </div>
                </div>
              </div>

              {formData.negativeRedirectType === 'external' && (
                <div>
                  <Label htmlFor="negativeRedirectUrl" className="text-muted-foreground">Negative Review Redirect URL</Label>
                  <Input
                    id="negativeRedirectUrl"
                    name="negativeRedirectUrl"
                    type="url"
                    defaultValue={formData.negativeRedirectUrl}
                    required={formData.negativeRedirectType === 'external'}
                    placeholder="e.g., https://your-domain.com/feedback-form"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL where users will be redirected after a negative review
                  </p>
                </div>
              )}

              {formData.negativeRedirectType === 'internal' && (
                <div>
                  <Label className="text-muted-foreground">Negative Feedback Questions</Label>
                  <div className="space-y-2 mt-1">
                    {negativeFeedbackQuestions.map((question, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          value={question}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                          required
                          className="flex-1"
                          placeholder="Enter question"
                        />
                        <Button
                          type="button"
                          onClick={() => handleRemoveQuestion(index)}
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      variant="outline"
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

          {/* Neutral Feedback Settings */}
          <div>
            <Label className="text-muted-foreground">Neutral Feedback Handling</Label>
            <div className="space-y-2 mt-1">
              <select
                value={neutralRedirectType}
                onChange={e => setNeutralRedirectType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="internal">Show improvements form</option>
                <option value="external">Redirect to URL</option>
              </select>
              {neutralRedirectType === 'external' && (
                <Input
                  type="url"
                  value={neutralRedirectUrl}
                  onChange={e => setNeutralRedirectUrl(e.target.value)}
                  className="w-full mt-1"
                  placeholder="e.g., https://your-domain.com/neutral-feedback"
                />
              )}
              {neutralRedirectType === 'internal' && (
                <div className="space-y-2 mt-1">
                  <Label className="text-xs text-muted-foreground mb-1">Neutral Feedback Questions</Label>
                  {neutralFeedbackQuestions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        value={question}
                        onChange={e => setNeutralFeedbackQuestions(qs => qs.map((q, i) => i === index ? e.target.value : q))}
                        className="flex-1"
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

          {/* Social Review Links Section */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold">Social Review Links</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => setSocialReviewLinks([...socialReviewLinks, { name: '', url: '' }])}>
                Add Link
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mb-2 font-medium">These links will be shown to users after a <span className="font-bold text-green-600">positive</span> review. Add your business's public review pages (e.g., Google, Facebook, etc.).</p>
            {socialReviewLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded p-2 mb-2">
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

          {/* Form Actions */}
          <div className="border-t pt-6">
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.replace(`/dashboard/forms/${resolvedParams.id}`)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 