"use server"

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { subDays, subMonths, subYears } from 'date-fns'
import { DateRange } from 'react-day-picker'

function getDateRange(timeRange: string, dateRange?: DateRange) {
  if (dateRange?.from && dateRange?.to) {
    // Create dates in local timezone
    const startDate = new Date(dateRange.from)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(dateRange.to)
    endDate.setHours(23, 59, 59, 999)
    
    // Convert to UTC for database queries
    const utcStartDate = new Date(Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0, 0, 0, 0
    ))
    
    const utcEndDate = new Date(Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23, 59, 59, 999
    ))
    
    return { startDate: utcStartDate, endDate: utcEndDate }
  }

  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  let startDate: Date

  switch (timeRange) {
    case '7d':
      startDate = subDays(endDate, 7)
      break
    case '30d':
      startDate = subDays(endDate, 30)
      break
    case '90d':
      startDate = subDays(endDate, 90)
      break
    case '1y':
      startDate = subYears(endDate, 1)
      break
    default:
      startDate = subDays(endDate, 7)
  }
  startDate.setHours(0, 0, 0, 0)

  // Convert to UTC
  const utcStartDate = new Date(Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0, 0, 0, 0
  ))
  
  const utcEndDate = new Date(Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    23, 59, 59, 999
  ))
  
  return { startDate: utcStartDate, endDate: utcEndDate }
}

export async function getAnalyticsMetrics(timeRange: string, dateRange?: DateRange) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    const { startDate, endDate } = getDateRange(timeRange, dateRange)
    const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))

    // Get user's forms with their review counts
    const { data: forms, error: formsError } = await supabase
      .from('review_forms')
      .select(`
        id,
        name,
        reviews:reviews (
          id,
          rating,
          created_at,
          contact_email,
          contact_phone
        )
      `)
      .eq('user_id', session.user.id)

    if (formsError) {
      throw formsError
    }

    if (!forms) {
      return null
    }

    const formIds = forms.map(form => form.id)

    // Get current period metrics with proper date filtering
    const { data: currentReviews, error: currentError } = await supabase
      .from('reviews')
      .select('rating, comment, feedback_categories, created_at, form_id, is_positive, contact_email, contact_phone')
      .in('form_id', formIds)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (currentError) {
      throw currentError
    }

    // Get previous period metrics for trend calculation
    const { data: previousReviews, error: previousError } = await supabase
      .from('reviews')
      .select('rating, comment, feedback_categories, created_at, form_id, is_positive, contact_email, contact_phone')
      .in('form_id', formIds)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    if (previousError) {
      throw previousError
    }

    if (!currentReviews || !previousReviews) {
      return null
    }

    // Calculate current period metrics
    const totalReviews = currentReviews.length
    const totalReviewsWithComments = currentReviews.filter(review => review.comment && review.comment.trim().length > 0).length
    const completionRate = totalReviews > 0 ? Math.round((totalReviewsWithComments / totalReviews) * 100) : 0
    const positiveReviews = currentReviews.filter(review => review.is_positive).length
    const averageRating = totalReviews > 0 ? currentReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews : 0

    // Calculate contact needs metrics
    const contactRequests = currentReviews.filter(review => 
      review.contact_email || review.contact_phone
    ).length
    const contactRate = totalReviews > 0 ? Math.round((contactRequests / totalReviews) * 100) : 0

    // Calculate form performance metrics
    const totalForms = forms.length
    const activeForms = forms.filter(form => 
      form.reviews && form.reviews.some(review => 
        new Date(review.created_at) >= startDate && 
        new Date(review.created_at) <= endDate
      )
    ).length
    const formEngagement = totalForms > 0 ? Math.round((activeForms / totalForms) * 100) : 0

    // Calculate previous period metrics for trends
    const prevTotalReviews = previousReviews.length
    const prevPositiveReviews = previousReviews.filter(review => review.is_positive).length
    const prevAverageRating = prevTotalReviews > 0 ? previousReviews.reduce((acc, review) => acc + review.rating, 0) / prevTotalReviews : 0
    const prevContactRequests = previousReviews.filter(review => 
      review.contact_email || review.contact_phone
    ).length
    const prevContactRate = prevTotalReviews > 0 ? Math.round((prevContactRequests / prevTotalReviews) * 100) : 0
    const prevActiveForms = forms.filter(form => 
      form.reviews && form.reviews.some(review => 
        new Date(review.created_at) >= previousStartDate && 
        new Date(review.created_at) < startDate
      )
    ).length
    const prevFormEngagement = totalForms > 0 ? Math.round((prevActiveForms / totalForms) * 100) : 0

    // Calculate trends
    const reviewTrend = prevTotalReviews ? ((totalReviews - prevTotalReviews) / prevTotalReviews) * 100 : 0
    const ratingTrend = prevAverageRating ? ((averageRating - prevAverageRating) / prevAverageRating) * 100 : 0
    const contactTrend = prevContactRate ? ((contactRate - prevContactRate) / prevContactRate) * 100 : 0
    const formTrend = prevFormEngagement ? ((formEngagement - prevFormEngagement) / prevFormEngagement) * 100 : 0

    return {
      totalReviews,
      reviewsWithComments: totalReviewsWithComments,
      completionRate,
      positiveReviews,
      averageRating,
      contactRate,
      contactRequests,
      formEngagement,
      activeForms,
      totalForms,
      reviewTrend,
      ratingTrend,
      contactTrend,
      formTrend
    }
  } catch (error) {
    throw error
  }
}

export async function getReviewTrends(timeRange: string, dateRange?: DateRange) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { startDate, endDate } = getDateRange(timeRange, dateRange)

  // Get user's forms
  const { data: forms, error: formsError } = await supabase
    .from('review_forms')
    .select('id')
    .eq('user_id', session.user.id)
  if (formsError) throw formsError
  const formIds = forms.map(form => form.id)

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('created_at, rating, form_id')
    .in('form_id', formIds)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return reviews || []
}

export async function getRatingDistribution(timeRange: string, dateRange?: DateRange) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { startDate, endDate } = getDateRange(timeRange, dateRange)

  // Get user's forms
  const { data: forms } = await supabase
    .from('review_forms')
    .select('id')
    .eq('user_id', user.id)
  if (!forms) return null
  const formIds = forms.map(form => form.id)

  // Get reviews for the time period
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, form_id')
    .in('form_id', formIds)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
  if (!reviews) return null

  // Per-form distribution
  const perForm: Record<string, { 1: number, 2: number, 3: number, 4: number, 5: number }> = {}
  // Global distribution
  const globalDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  reviews.forEach(review => {
    const formId = String(review.form_id)
    if (!perForm[formId]) perForm[formId] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const rating = Math.round(review.rating)
    if (rating >= 1 && rating <= 5) {
      perForm[formId][rating as 1|2|3|4|5]++
      globalDist[rating as 1|2|3|4|5]++
    }
  })

  // Return per-form and global under key ''
  return { '': globalDist, ...perForm }
}

export async function exportAnalyticsData(timeRange: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('You must be logged in to export analytics')
  }

  const now = new Date()
  let startDate: Date
  switch (timeRange) {
    case '7d':
      startDate = subDays(now, 7)
      break
    case '30d':
      startDate = subDays(now, 30)
      break
    case '90d':
      startDate = subDays(now, 90)
      break
    case '1y':
      startDate = subYears(now, 1)
      break
    default:
      startDate = subDays(now, 7)
  }

  // First get the user's form IDs
  const { data: userForms, error: formsError } = await supabase
    .from('review_forms')
    .select('id')
    .eq('user_id', session.user.id)

  if (formsError) throw formsError

  const formIds = userForms.map(form => form.id)

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      review_forms:form_id (
        name,
        company_name
      )
    `)
    .gte('created_at', startDate.toISOString())
    .in('form_id', formIds)
    .order('created_at', { ascending: false })

  if (error) throw error

  return reviews
}

export async function getFormAnalytics(timeRange: string, dateRange?: DateRange) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    const { startDate, endDate } = getDateRange(timeRange, dateRange)

    // Get forms with their analytics
    const { data: forms, error: formsError } = await supabase
      .from('review_forms')
      .select(`
        id,
        name,
        company_name,
        reviews:reviews (
          rating,
          comment,
          created_at,
          contact_email,
          contact_phone
        )
      `)
      .eq('user_id', session.user.id)

    if (formsError) {
      throw formsError
    }

    if (!forms) {
      return []
    }

    // Filter reviews by date range
    const filteredForms = forms.map(form => {
      const reviews = (form.reviews || []).filter(review => {
        const reviewDate = new Date(review.created_at)
        return reviewDate >= startDate && reviewDate <= endDate
      })

      const totalReviews = reviews.length
      const reviewsWithComments = reviews.filter(r => r.comment && r.comment.trim().length > 0).length
      const completionRate = totalReviews > 0 ? Math.round((reviewsWithComments / totalReviews) * 100) : 0
      const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : '0.0'
      const positiveReviews = reviews.filter(r => r.rating >= 4).length
      const negativeReviews = reviews.filter(r => r.rating <= 2).length
      const neutralReviews = reviews.filter(r => r.rating === 3).length
      const contactRequests = reviews.filter(r => r.contact_email || r.contact_phone).length
      const contactRate = totalReviews > 0 ? Math.round((contactRequests / totalReviews) * 100) : 0

      return {
        id: form.id,
        name: form.name,
        company_name: form.company_name,
        totalReviews,
        reviewsWithComments,
        completionRate,
        averageRating,
        positiveReviews,
        negativeReviews,
        neutralReviews,
        positivePercentage: totalReviews > 0 ? (positiveReviews / totalReviews * 100).toFixed(1) : '0.0',
        negativePercentage: totalReviews > 0 ? (negativeReviews / totalReviews * 100).toFixed(1) : '0.0',
        contactRequests,
        contactRate
      }
    })

    return filteredForms
  } catch (error) {
    throw error
  }
}

export async function getFeedbackAnalysis(timeRange: string, dateRange?: DateRange) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    const { startDate, endDate } = getDateRange(timeRange, dateRange)

    // Get user's forms
    const { data: forms, error: formsError } = await supabase
      .from('review_forms')
      .select('id, name')
      .eq('user_id', session.user.id)

    if (formsError) {
      throw formsError
    }

    if (!forms) {
      return null
    }

    const formIds = forms.map(form => form.id)

    // Get reviews with comments and feedback categories
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        rating,
        comment,
        feedback_categories,
        form_id,
        created_at,
        is_positive
      `)
      .in('form_id', formIds)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (reviewsError) {
      throw reviewsError
    }

    if (!reviews) {
      return null
    }

    // Build form name lookup
    const formIdToName: Record<string, string> = {}
    forms.forEach(form => {
      formIdToName[form.id] = form.name
    })

    // Analyze feedback by form
    const feedbackByForm: Record<string, { 
      formName: string, 
      feedbackOptions: Record<string, number>, 
      negative: { text: string, rating: number, created_at: string }[] 
    }> = {}

    // For All Forms aggregation
    const allFormsFeedbackOptions: Record<string, number> = {}
    const allFormsNegative: { text: string, rating: number, created_at: string }[] = []

    reviews.forEach(review => {
      const formName = formIdToName[review.form_id] || 'Unknown Form'
      if (!feedbackByForm[review.form_id]) {
        feedbackByForm[review.form_id] = { formName, feedbackOptions: {}, negative: [] }
      }

      // Process feedback categories
      let categories = review.feedback_categories
      if (typeof categories === 'string') {
        try {
          const parsed = JSON.parse(categories)
          categories = Array.isArray(parsed) ? parsed : [parsed]
        } catch {
          categories = categories.includes(',') ? categories.split(',').map((c: string) => c.trim()) : [categories]
        }
      }
      if (!Array.isArray(categories)) categories = [categories]

      categories.forEach((category: string) => {
        if (typeof category === 'string' && category.trim()) {
          feedbackByForm[review.form_id].feedbackOptions[category] = 
            (feedbackByForm[review.form_id].feedbackOptions[category] || 0) + 1
          allFormsFeedbackOptions[category] = (allFormsFeedbackOptions[category] || 0) + 1
        }
      })

      // Add to negative feedback if rating <= 2 and has a comment
      if (review.comment && review.rating <= 2) {
        const negativeFeedback = {
          text: review.comment,
          rating: review.rating,
          created_at: review.created_at
        }
        feedbackByForm[review.form_id].negative.push(negativeFeedback)
        allFormsNegative.push(negativeFeedback)
      }
    })

    // Convert to arrays and sort
    const feedbackOptionsByForm = Object.entries(feedbackByForm).map(([formId, { formName, feedbackOptions }]) => ({
      formId,
      formName,
      feedbackOptions: Object.entries(feedbackOptions)
        .filter(([option, count]) => option && count > 0)
        .map(([option, count]) => ({ option, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }))

    const negativeByForm = Object.entries(feedbackByForm).map(([formId, { formName, negative }]) => ({
      formId,
      formName,
      negative: negative
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
    }))

    // Add All Forms aggregate
    feedbackOptionsByForm.unshift({
      formId: '',
      formName: 'All Forms',
      feedbackOptions: Object.entries(allFormsFeedbackOptions)
        .filter(([option, count]) => option && count > 0)
        .map(([option, count]) => ({ option, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    })

    negativeByForm.unshift({
      formId: '',
      formName: 'All Forms',
      negative: allFormsNegative
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
    })

    return {
      feedbackOptionsByForm,
      negativeByForm
    }
  } catch (error) {
    throw error
  }
} 