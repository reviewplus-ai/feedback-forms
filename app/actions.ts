"use server"

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function createUserProfile(user: any) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: user.id,
      full_name: user.user_metadata.full_name,
      email: user.email,
      avatar_url: user.user_metadata.avatar_url
    })
    .select()
    .single()

  if (error) {
    console.error('Profile creation error:', error)
    throw new Error('Failed to create user profile: ' + error.message)
  }

  return profile
}

export async function createBusiness(formData: FormData) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get the session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to create a business')
  }

  // Get business data
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  
  if (!name?.trim() || !type) {
    throw new Error('Business name and type are required')
  }

  // Generate a slug from the business name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Create the business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      user_id: session.user.id,
      name: name,
      type: type,
      description: description,
      slug: slug
    })
    .select()
    .single()

  if (businessError) {
    console.error('Business creation error:', businessError)
    throw new Error('Failed to create business: ' + businessError.message)
  }

  revalidatePath('/dashboard/businesses')
  return business
}

export async function createForm(formData: FormData) {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to create a form' }
    }

    // Extract form data
    const companyName = formData.get('companyName') as string
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const welcomeMessage = formData.get('welcomeMessage') as string
    const ratingThreshold = parseInt(formData.get('ratingThreshold') as string)
    const positiveRedirectUrl = formData.get('positiveRedirectUrl') as string
    const negativeRedirectUrl = formData.get('negativeRedirectUrl') as string
    const negativeRedirectType = formData.get('negativeRedirectType') as string
    const negativeFeedbackQuestionsJson = formData.get('negativeFeedbackQuestions') as string

    // Validate required fields
    if (!companyName || !name || !slug || !welcomeMessage || !positiveRedirectUrl) {
      return { success: false, error: 'All required fields must be provided' }
    }

    // Validate URLs
    if (!positiveRedirectUrl.startsWith('http://') && !positiveRedirectUrl.startsWith('https://')) {
      return { success: false, error: 'Positive redirect URL must start with http:// or https://' }
    }

    if (negativeRedirectType === 'external' && (!negativeRedirectUrl || 
        (!negativeRedirectUrl.startsWith('http://') && !negativeRedirectUrl.startsWith('https://')))) {
      return { success: false, error: 'Negative redirect URL must start with http:// or https://' }
    }

    // Validate slug format
    if (!slug.match(/^[a-z0-9-]+$/)) {
      return { success: false, error: 'Form URL slug can only contain lowercase letters, numbers, and hyphens' }
    }

    // Check if slug is already taken
    const { data: existingForm } = await supabase
      .from('review_forms')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingForm) {
      return { success: false, error: 'This form URL is already taken. Please choose a different one.' }
    }

    // Parse negative feedback questions
    let negativeFeedbackQuestions: string[] = []
    if (negativeRedirectType === 'internal' && negativeFeedbackQuestionsJson) {
      try {
        negativeFeedbackQuestions = JSON.parse(negativeFeedbackQuestionsJson)
        if (!Array.isArray(negativeFeedbackQuestions) || negativeFeedbackQuestions.length === 0) {
          return { success: false, error: 'At least one negative feedback question is required' }
        }
      } catch (e) {
        return { success: false, error: 'Invalid negative feedback questions format' }
      }
    }

    // Create the form
    const { data: form, error } = await supabase
      .from('review_forms')
      .insert({
        user_id: user.id,
        company_name: companyName,
        name,
        slug,
        welcome_message: welcomeMessage,
        rating_threshold: ratingThreshold,
        positive_redirect_url: positiveRedirectUrl,
        negative_redirect_type: negativeRedirectType,
        negative_redirect_url: negativeRedirectType === 'external' ? negativeRedirectUrl : null,
        negative_feedback_questions: negativeFeedbackQuestions
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating form:', error)
      return { success: false, error: 'Failed to create form. Please try again.' }
    }

    return { success: true, form }
  } catch (error) {
    console.error('Error in createForm:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getUserProfile() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to view profile')
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    throw new Error('Failed to fetch profile: ' + error.message)
  }

  return profile
}

export async function getBusinesses() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to view businesses')
  }

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching businesses:', error)
    throw new Error('Failed to fetch businesses: ' + error.message)
  }

  return businesses
}

export async function getForms() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('You must be logged in to view forms')
    }

    const { data: forms, error } = await supabase
      .from('review_forms')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch forms: ' + error.message)
    }

    return { success: true, data: forms }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function submitReview(formData: FormData) {
  try {
    // Use the service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get basic review data
    const formId = formData.get('formId') as string
    const rating = parseInt(formData.get('rating') as string)
    const otherFeedback = formData.get('otherFeedback') as string
    const feedbackCategories = formData.get('feedbackCategories') as string
    const contact = formData.get('contact') as string
    const name = formData.get('name') as string

    if (!formId || isNaN(rating)) {
      throw new Error('Invalid form data')
    }

    // Get the form to check the threshold
    const { data: form, error: formError } = await supabase
      .from('review_forms')
      .select('rating_threshold')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      console.error('Form error:', formError)
      throw new Error('Failed to get form details: ' + formError?.message)
    }

    // Determine if the review is positive based on the current threshold
    const isPositive = rating >= form.rating_threshold

    // Parse contact information
    let contactEmail = null
    let contactPhone = null
    if (contact) {
      // Check if contact is an email
      if (contact.includes('@')) {
        contactEmail = contact
      } else {
        contactPhone = contact
      }
    }

    // Parse feedback categories
    let categories = []
    if (feedbackCategories) {
      try {
        categories = JSON.parse(feedbackCategories)
      } catch (e) {
        console.error('Error parsing feedback categories:', e)
      }
    }

    // Create the review with the correct column names based on the actual database schema
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([
        {
          form_id: formId,
          rating,
          comment: otherFeedback || null,
          contact_name: name || null,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          contact_status: 'pending',
          feedback_categories: categories,
          feedback_text: otherFeedback || null,
          is_positive: isPositive
        }
      ])
      .select()
      .single()

    if (reviewError) {
      console.error('Review error:', reviewError)
      throw new Error('Failed to create review: ' + reviewError.message)
    }

    // We're removing the Telegram notification for now since we don't have company_id
    // This can be re-implemented later if needed

    return {
      success: true,
      data: {
        review,
        ratingThreshold: form.rating_threshold,
        negativeRedirectType: 'internal',
        negativeRedirectUrl: '',
        companyName: '',
        positiveRedirectUrl: ''
      }
    }
  } catch (error) {
    console.error('Error in submitReview:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function deleteForm(formData: FormData) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const formId = formData.get('formId')
  if (!formId) {
    throw new Error('Form ID is required')
  }

  // Check if user owns the form
  const { data: form, error: formError } = await supabase
    .from('review_forms')
    .select('user_id')
    .eq('id', formId)
    .single()

  if (formError || !form || form.user_id !== session.user.id) {
    throw new Error('Not authorized to delete this form')
  }

  // Delete the form
  const { error: deleteError } = await supabase
    .from('review_forms')
    .delete()
    .eq('id', formId)

  if (deleteError) {
    throw new Error('Failed to delete form')
  }

  revalidatePath('/dashboard/forms')
  return { success: true }
}

export async function updateForm(formData: FormData) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const formId = formData.get('formId')
  if (!formId) {
    throw new Error('Form ID is required')
  }

  // Check if user owns the form
  const { data: form, error: formError } = await supabase
    .from('review_forms')
    .select('*')
    .eq('id', formId)
    .single()

  if (formError || !form || form.user_id !== session.user.id) {
    throw new Error('Not authorized to edit this form')
  }

  // Get form data
  const welcomeMessage = formData.get('welcomeMessage')
  const ratingThreshold = parseInt(formData.get('ratingThreshold') as string)
  const positiveRedirectUrl = formData.get('positiveRedirectUrl')
  const negativeRedirectUrl = formData.get('negativeRedirectUrl')
  const negativeRedirectType = formData.get('negativeRedirectType')
  const negativeFeedbackQuestions = formData.get('negativeFeedbackQuestions')

  // Validate required fields
  if (!welcomeMessage || !positiveRedirectUrl) {
    throw new Error('Welcome message and positive redirect URL are required')
  }

  // Validate URLs
  if (!positiveRedirectUrl.toString().startsWith('http')) {
    throw new Error('Positive redirect URL must be a valid URL starting with http:// or https://')
  }
  
  if (negativeRedirectType === 'external' && !negativeRedirectUrl?.toString().startsWith('http')) {
    throw new Error('Negative redirect URL must be a valid URL starting with http:// or https://')
  }

  // Parse negative feedback questions
  let parsedQuestions: string[] = []
  if (negativeFeedbackQuestions) {
    try {
      parsedQuestions = JSON.parse(negativeFeedbackQuestions.toString())
    } catch (e) {
      console.error('Error parsing negative feedback questions:', e)
    }
  }

  // Update the form
  const { error: updateError } = await supabase
    .from('review_forms')
    .update({
      welcome_message: welcomeMessage,
      rating_threshold: ratingThreshold || 4,
      positive_redirect_url: positiveRedirectUrl,
      negative_redirect_url: negativeRedirectUrl,
      negative_redirect_type: negativeRedirectType || 'internal',
      negative_feedback_questions: parsedQuestions,
      updated_at: new Date().toISOString()
    })
    .eq('id', formId)

  if (updateError) {
    console.error('Form update error:', updateError)
    throw new Error('Failed to update form: ' + updateError.message)
  }

  revalidatePath('/dashboard/forms')
  return { success: true }
}