import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    // Get the review ID from the URL
    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }
    
    console.log('API Route - Received review ID:', id)
    
    // Get the request body
    const body = await request.json()
    const { status } = body
    console.log('API Route - Received status:', status)

    // Validate status
    if (!['pending', 'contacted', 'completed'].includes(status)) {
      console.log('API Route - Invalid status:', status)
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // First verify the review exists
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, contact_status')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('API Route - Error fetching review:', fetchError)
      return NextResponse.json(
        { error: `Failed to fetch review: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!existingReview) {
      console.log('API Route - Review not found:', id)
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    console.log('API Route - Current review status:', existingReview.contact_status)

    // Update the review status
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({ 
        contact_status: status
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('API Route - Error updating review:', updateError)
      return NextResponse.json(
        { error: `Failed to update review: ${updateError.message}` },
        { status: 500 }
      )
    }

    if (!updatedReview) {
      console.log('API Route - No review returned after update:', id)
      return NextResponse.json(
        { error: 'Review not found after update' },
        { status: 404 }
      )
    }

    // Verify the status was actually updated
    if (updatedReview.contact_status !== status) {
      console.error('API Route - Status mismatch after update:', {
        expected: status,
        actual: updatedReview.contact_status
      })
      return NextResponse.json(
        { error: 'Status update failed - status mismatch' },
        { status: 500 }
      )
    }

    console.log('API Route - Successfully updated review:', updatedReview)

    return NextResponse.json({ 
      success: true,
      data: updatedReview
    })
  } catch (error) {
    console.error('API Route - Unexpected error in review update:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 