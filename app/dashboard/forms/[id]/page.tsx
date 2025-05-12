import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { FormIdSection } from '@/components/FormIdSection'
import { DeleteFormButton } from '@/components/DeleteFormButton'
import { FormQRCode } from '@/components/FormQRCode'
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Link as LinkIcon, Settings, Eye, Edit, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Review {
  id: string
  rating: number
  comment: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_status: 'pending' | 'contacted' | 'completed'
  feedback_categories: string[]
  feedback_text: string | null
  created_at: string
}

interface Form {
  id: string
  user_id: string
  name: string
  company_name: string
  rating_threshold: number
  welcome_message: string
  thank_you_message: string
  negative_feedback_questions: string[]
  reviews: Review[]
  positive_redirect_url: string
  negative_redirect_type: string
  negative_redirect_url: string
  slug: string
}

export default async function FormDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch form details with reviews
  const { data: form, error: formError } = await supabase
    .from('review_forms')
    .select(`
      *,
      reviews (
        id,
        rating,
        comment,
        contact_name,
        contact_email,
        contact_phone,
        contact_status,
        feedback_categories,
        feedback_text,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  // Handle case where form doesn't exist (was deleted)
  if (formError?.code === 'PGRST116') {
    return (
      <div className="container mx-auto py-8">
        <div className="border rounded-lg p-6 bg-yellow-50">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Form Not Found</h2>
          <p className="text-yellow-600">This form may have been deleted or you don't have access to it.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/forms">Return to Forms</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Handle other errors
  if (formError) {
    console.error('Error fetching form:', formError);
    return (
      <div className="container mx-auto py-8">
        <div className="border rounded-lg p-6 bg-red-50">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Form</h2>
          <p className="text-red-600">There was an error loading the form details. Please try again later.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/forms">Return to Forms</Link>
          </Button>
        </div>
      </div>
    );
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
    );
  }

  // Verify ownership
  if (form.user_id !== user.id) {
    redirect('/dashboard/forms')
  }

  const formUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/review/${form.slug}`

  // Calculate review statistics
  const totalReviews = form.reviews?.length || 0
  const averageRating = form.reviews?.length 
    ? (form.reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / form.reviews.length).toFixed(1)
    : '0.0'
  const positiveReviews = form.reviews?.filter((review: Review) => review.rating >= form.rating_threshold).length || 0
  const negativeReviews = form.reviews?.filter((review: Review) => review.rating < form.rating_threshold).length || 0

  return (
    <div className="max-w-full px-2 sm:px-4 md:px-8 py-6 mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate" title={form.name}>{form.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate" title={form.company_name}>{form.company_name}</p>
        </div>
        <div className="hidden sm:flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-3">
          <Button variant="outline" className="w-full sm:w-auto gap-2" asChild>
            <Link href={formUrl} target="_blank">
              <Eye className="h-4 w-4" />
              View Live Form
            </Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto gap-2" asChild>
            <Link href={`/dashboard/forms/${id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit Form
            </Link>
          </Button>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Reviews</h3>
              <p className="text-3xl font-bold mt-2">{totalReviews}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
              <p className="text-3xl font-bold mt-2">{averageRating}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Positive Reviews</h3>
              <p className="text-3xl font-bold mt-2 text-green-600">{positiveReviews}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Negative Reviews</h3>
              <p className="text-3xl font-bold mt-2 text-red-600">{negativeReviews}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <ThumbsDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Form Settings</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Welcome Message</h3>
              <p className="mt-1 text-sm">{form.welcome_message}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Rating Threshold</h3>
              <p className="mt-1 text-sm">{form.rating_threshold}+</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Positive Review Redirect</h3>
              <p className="mt-1 text-sm">
                <a 
                  href={form.positive_redirect_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                >
                  {form.positive_redirect_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Negative Review Handling</h3>
              <p className="mt-1 text-sm">
                {form.negative_redirect_type === 'internal' 
                  ? 'Show feedback form' 
                  : (
                    <a 
                      href={form.negative_redirect_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                    >
                      {form.negative_redirect_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                }
              </p>
            </div>
          </div>
          {form.negative_redirect_type === 'internal' && (
            <div className="sm:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Negative Feedback Options</h3>
              <div className="grid gap-2">
                {form.negative_feedback_questions?.map((question: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-gray-600">{index + 1}</span>
                    </div>
                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code and Form ID */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <FormQRCode formUrl={formUrl} />
        <div className="space-y-6">
          <FormIdSection formId={form.id} />
          <div className="bg-gradient-to-br from-white to-gray-50 border-none rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Form Actions</h2>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href={formUrl} target="_blank">
                  <Eye className="h-4 w-4" />
                  View Live Form
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href={`/dashboard/forms/${id}/edit`}>
                  <Edit className="h-4 w-4" />
                  Edit Form
                </Link>
              </Button>
              <DeleteFormButton formId={form.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 