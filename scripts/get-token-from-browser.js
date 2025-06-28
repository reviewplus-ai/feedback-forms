#!/usr/bin/env node

console.log(`
🔑 To get your auth token for testing:

1. Open your browser and go to your app (http://localhost:3000)
2. Log in to your account
3. Open browser developer tools (F12)
4. Go to the Console tab
5. Run this command:

const { data: { session } } = await supabase.auth.getSession()
console.log('Access token:', session?.access_token)

6. Copy the access token and run:

export TEST_AUTH_TOKEN="your_token_here"
node scripts/debug-whatsapp-templates.js

This will show you the difference between Meta templates and your local database.
`);

console.log(`
Alternative method - check localStorage:

localStorage.getItem('sb-REPLACE_WITH_YOUR_SUPABASE_PROJECT_ID-auth-token')

Then parse the JSON and get the access_token value.
`); 