// This script creates a test form
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestForm() {
  console.log('Creating test form...')
  
  // Create a test user
  const timestamp = Date.now()
  const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
    email: `test${timestamp}@example.com`,
    password: 'testpassword123',
    email_confirm: true
  })
  
  if (userError) {
    console.error('Error creating user:', userError)
    return
  }
  
  console.log('Created user:', user)
  
  // Create a test company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .upsert({
      name: 'Test Company',
      domain: 'example.com',
      is_google_workspace: false,
      user_id: user.id
    })
    .select()
    .single()
  
  if (companyError) {
    console.error('Error creating company:', companyError)
    return
  }
  
  console.log('Created company:', company)
  
  // Create a test form
  const testForm = {
    name: 'Test Form',
    slug: 'test-form',
    welcome_message: 'Welcome to our test form!',
    thank_you_message: 'Thank you for your feedback!',
    rating_threshold: 4,
    positive_redirect_url: 'https://example.com/thank-you',
    negative_redirect_url: 'https://example.com/feedback',
    enable_comments: true,
    company_id: company.id,
    user_id: user.id
  }
  
  const { data: form, error: formError } = await supabase
    .from('review_forms')
    .upsert(testForm)
    .select()
    .single()
  
  if (formError) {
    console.error('Error creating form:', formError)
    return
  }
  
  console.log('Created form:', form)
  console.log('\nTest form created successfully!')
  console.log('You can access it at: /review/test-form')
}

createTestForm()
  .then(() => {
    console.log('\nScript completed.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script error:', error)
    process.exit(1)
  }) 