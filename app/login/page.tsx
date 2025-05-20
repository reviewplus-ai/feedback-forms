'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          }
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[400px] mx-4">
        <div className="bg-card rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={92}
              height={92}
              className="mx-auto mb-1"
            />
            <h1 className="text-3xl font-semibold text-card-foreground mb-2">
              Sign in
            </h1>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-card-foreground"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-card-foreground"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-input rounded-lg hover:bg-accent transition-colors text-card-foreground font-medium"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" className="text-foreground">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-2">
              By continuing, you agree to our
              <Link href="/legal/terms" className="underline hover:text-primary mx-1">Terms of Service</Link>
              and
              <Link href="/legal/privacy-policy" className="underline hover:text-primary mx-1">Privacy Policy</Link>.
            </p>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 