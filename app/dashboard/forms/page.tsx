'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { PlusCircle, Star, Link as LinkIcon, Copy, CheckCircle, MessageSquare, Calendar, BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Form {
  id: string
  name: string
  company_name: string
  slug: string
  rating_threshold: number
  negative_feedback_questions: string[]
  created_at: string
  reviews?: {
    id: string
    rating: number
    created_at: string
  }[]
}

export default function FormsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadForms() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const { data: forms, error } = await supabase
          .from('review_forms')
          .select(`
            *,
            reviews (
              id,
              rating,
              created_at
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching forms:', error.message, error.details, error.hint)
          toast.error(`Failed to load forms: ${error.message}`)
          return
        }

        setForms(forms || [])
        setLoading(false)
      } catch (err) {
        console.error('Error in loadForms:', err)
        toast.error('An unexpected error occurred while loading forms')
        setLoading(false)
      }
    }

    loadForms()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full px-2 sm:px-4 md:px-8 py-6 mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Your Feedback Forms</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage and track your customer feedback forms</p>
        </div>
        <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" asChild>
          <Link href="/dashboard/forms/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Form
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <PlusCircle className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-4">No forms yet</h2>
          <p className="text-muted-foreground mb-6">Create your first review form to get started</p>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" asChild>
            <Link href="/dashboard/forms/new">Create Your First Form</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {forms.map((form) => {
            const totalReviews = form.reviews?.length || 0
            const averageRating = form.reviews?.length 
              ? (form.reviews.reduce((acc, review) => acc + review.rating, 0) / form.reviews.length).toFixed(1)
              : '0.0'
            const positiveReviews = form.reviews?.filter(review => review.rating >= form.rating_threshold).length || 0
            const lastReviewDate = form.reviews?.length 
              ? format(new Date(form.reviews[0].created_at), 'MMM d, yyyy')
              : 'No reviews yet'

            return (
              <div key={form.id} className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full justify-between">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1 truncate" title={form.name}>{form.name}</h2>
                    <p className="text-muted-foreground text-xs sm:text-sm truncate" title={form.company_name}>{form.company_name}</p>
                  </div>
                  <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="font-medium text-base sm:text-lg">{averageRating}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm mb-3">
                  <div className="flex items-center text-gray-600 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <LinkIcon className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/review/${form.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate" style={{ maxWidth: '120px', display: 'inline-block', verticalAlign: 'bottom' }} title={`${process.env.NEXT_PUBLIC_SITE_URL}/review/${form.slug}`}>{form.slug}</a>
                      <Button type="button" size="icon" variant="ghost" className="p-0.5" onClick={() => {navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/review/${form.slug}`); toast.success('Link copied!')}} title="Copy link">
                        <Copy className="h-3 w-3 text-blue-300 hover:text-blue-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Rating Threshold: {form.rating_threshold}+</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <MessageSquare className="h-3 w-3 text-purple-600" />
                    </div>
                    <span>Feedback Options: {form.negative_feedback_questions?.length || 0}</span>
                  </div>
                </div>

                <div className="border-t pt-3 mt-auto">
                  <div className="flex flex-col w-full">
                    <Button variant="outline" className="w-full hover:bg-gray-50 text-xs sm:text-sm py-2" asChild>
                      <Link href={`/dashboard/forms/${form.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 