# Review System

A modern review management system built with Next.js, Supabase, and Telegram integration.

## Features

- User authentication with Google OAuth
- Company and review form management
- Real-time review collection
- Telegram bot integration for notifications
- Responsive and modern UI

## Tech Stack

- Next.js 15
- Supabase (Database & Auth)
- Tailwind CSS
- Radix UI
- Telegram Bot API

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

## Project Structure

- `app/`: Next.js app router pages and API routes
- `components/`: Reusable UI components
- `lib/`: Utility functions and configurations
- `public/`: Static assets
- `styles/`: Global styles and Tailwind configuration
- `types/`: TypeScript type definitions
- `utils/`: Helper functions
- `hooks/`: Custom React hooks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 