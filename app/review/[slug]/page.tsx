import { createClient } from '@supabase/supabase-js'
import { notFound } from "next/navigation"
import { ReviewForm } from "@/components/ReviewForm"

type PageProps = {
  params: Promise<{ slug: string }>
}

type Form = {
  id: string
  name: string
  welcome_message: string
  thank_you_message: string
  positive_redirect_url: string | null
  negative_redirect_url: string | null
  negative_redirect_type: string | null
  negative_feedback_questions: string[] | null
  enable_comments: boolean
  rating_threshold: number
  company_name: string
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReviewPage({ params }: PageProps) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { slug } = await params

    const { data: form, error } = await supabase
      .from('review_forms')
      .select(`
        id,
        name,
        welcome_message,
        thank_you_message,
        positive_redirect_url,
        negative_redirect_url,
        negative_redirect_type,
        negative_feedback_questions,
        enable_comments,
        rating_threshold,
        company_name
      `)
      .eq('slug', slug)
      .single()

    if (error || !form) {
      console.error('Form not found:', slug)
      return notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ReviewForm
            formId={form.id}
            welcomeMessage={form.welcome_message}
            thankYouMessage={form.thank_you_message}
            ratingThreshold={form.rating_threshold}
            positiveRedirectUrl={form.positive_redirect_url || "/thank-you"}
            negativeRedirectUrl={form.negative_redirect_url || "/thank-you"}
            negativeRedirectType={(form.negative_redirect_type as "internal" | "external") || "internal"}
            negativeFeedbackQuestions={Array.isArray(form.negative_feedback_questions) 
              ? form.negative_feedback_questions 
              : [
                  "What could we improve?",
                  "What was the main reason for your negative experience?",
                  "Would you like us to contact you to discuss this further?"
                ]}
            enableComments={form.enable_comments}
            primaryColor="#4f46e5"
            companyName={form.company_name}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Page error:', error)
    return notFound()
  }
} 