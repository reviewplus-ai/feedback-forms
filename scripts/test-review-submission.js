// This script tests the review submission functionality
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testReviewSubmission() {
  console.log('Testing review submission...')
  
  // Get a form ID to test with
  const { data: forms, error: formsError } = await supabase
    .from('review_forms')
    .select('id, name')
    .limit(1)
  
  if (formsError) {
    console.error('Error fetching forms:', formsError)
    return
  }
  
  if (!forms || forms.length === 0) {
    console.error('No forms found in the database')
    return
  }
  
  const formId = forms[0].id
  console.log(`Using form ID: ${formId} (${forms[0].name})`)
  
  // Submit a test review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      form_id: formId,
      rating: 5,
      comment: 'This is a test review from the test script'
    })
    .select()
    .single()
  
  if (reviewError) {
    console.error('Error submitting review:', reviewError)
    return
  }
  
  console.log('Review submitted successfully:', review)
  
  // Verify the review was stored
  const { data: storedReview, error: fetchError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', review.id)
    .single()
  
  if (fetchError) {
    console.error('Error fetching review:', fetchError)
    return
  }
  
  console.log('Review verified in database:', storedReview)
  console.log('\nTest completed successfully!')
}

testReviewSubmission()
  .then(() => {
    console.log('\nScript completed.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script error:', error)
    process.exit(1)
  }) 