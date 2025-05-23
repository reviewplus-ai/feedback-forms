"use client"

import { signIn } from "next-auth/react"

export function SignInButton() {
  const handleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
        <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
          />
        </svg>
      </span>
      Sign in with Google
    </button>
  )
} 