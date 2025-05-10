const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function insertTestData() {
  console.log('Inserting test data...')

  try {
    // Create a test user
    const timestamp = Date.now()
    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
      email: `test${timestamp}@example.com`,
      password: 'test123',
      email_confirm: true
    })
    
    if (userError) {
      console.error('Error creating user:', userError)
      return
    }
    
    console.log('Created user:', user)
    
    // Create a test company
    const companySlug = `test-company-${timestamp}`
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Test Company',
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
    const formSlug = `test-form-${timestamp}`
    const testForm = {
      name: 'Test Form',
      slug: formSlug,
      company_id: company.id,
      user_id: user.id
    }

    const { data: form, error: formError } = await supabase
      .from('review_forms')
      .insert(testForm)
      .select()
      .single()

    if (formError) {
      console.error('Error creating form:', formError)
      return
    }

    console.log('Created form:', form)
    console.log('\nTest data inserted successfully!')
    console.log('You can access the form at: /review/' + formSlug)

    // Create a test review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        form_id: form.id,
        rating: 5,
        comment: 'This is a test review'
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return
    }

    console.log('Created review:', review)
  } catch (error) {
    console.error('Error inserting test data:', error)
  }
}

insertTestData()
  .then(() => {
    console.log('\nScript completed.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script error:', error)
    process.exit(1)
  }) 