# Review System

A modern review management system built with Next.js, Supabase, and Telegram integration.

## Features

- User authentication with Google OAuth
- Company and review form management
- Real-time review collection
- Telegram bot integration for notifications
- WhatsApp Business API integration for feedback requests
- Custom WhatsApp template management
- Responsive and modern UI

## Tech Stack

- Next.js 15
- Supabase (Database & Auth)
- Tailwind CSS
- Radix UI
- Telegram Bot API
- WhatsApp Business API (Meta Graph API)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local` with your credentials:
   - Supabase project URL and keys
   - Google OAuth credentials
   - Telegram bot token
   - WhatsApp Business API credentials
   - Webhook URL

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `NEXT_PUBLIC_SITE_URL`: Your site URL
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `WEBHOOK_URL`: Your webhook URL for Telegram bot
- `WHATSAPP_TOKEN`: Your WhatsApp Business API access token
- `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp phone number ID
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: Your WhatsApp Business account ID

## WhatsApp Integration

The system includes comprehensive WhatsApp Business API integration for sending feedback requests:

### Template Management
- Create custom WhatsApp templates with variables
- Automatic template creation via Meta's Graph API
- Template status tracking (APPROVED, PENDING, REJECTED)
- Template synchronization with WhatsApp Business API

### Key Features
- **Template Sync**: Automatically sync templates from Meta WhatsApp Business API
- **Variable Support**: Use `{{variable_name}}` syntax in templates
- **Status Tracking**: Monitor template approval status
- **Error Handling**: Comprehensive error messages and troubleshooting

### Usage
1. Go to Dashboard → Feedback Request
2. Create custom templates with UTILITY category
3. Use "Sync from Meta" to sync with WhatsApp Business API
4. Send feedback requests using approved templates

### Testing
Use the provided test scripts to verify functionality:
```bash
# Get auth token for testing
node scripts/get-auth-token.js

# Test template sync
export TEST_AUTH_TOKEN="your_token_here"
node scripts/test-template-sync.js

# Test template validation
node scripts/test-template-validation.js
```

## Project Structure

- `app/`: Next.js app router pages and API routes
- `components/`: Reusable UI components
- `lib/`: Utility functions and configurations
- `public/`: Static assets
- `styles/`: Global styles and Tailwind configuration
- `types/`: TypeScript type definitions
- `utils/`: Helper functions
- `hooks/`: Custom React hooks
- `scripts/`: Test and utility scripts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 