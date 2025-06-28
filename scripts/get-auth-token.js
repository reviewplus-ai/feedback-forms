#!/usr/bin/env node

/**
 * Helper script to get auth token for testing
 * Run this in the browser console while logged into your app
 */

console.log(`
🔑 To get your auth token for testing:

1. Open your browser and go to your app
2. Log in to your account
3. Open browser developer tools (F12)
4. Go to the Console tab
5. Run this command:

localStorage.getItem('sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token')

6. Copy the access_token value from the result
7. Set it as an environment variable:

export TEST_AUTH_TOKEN="your_token_here"

8. Then run the test script:

node scripts/test-template-sync.js
`);

// Also show how to get it from Supabase client
console.log(`
Alternative method using Supabase client:

1. In your app's browser console, run:

const { data: { session } } = await supabase.auth.getSession()
console.log('Access token:', session?.access_token)

2. Copy the access token and set it as TEST_AUTH_TOKEN
`); 