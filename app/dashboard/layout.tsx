'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings, LogOut, User, LayoutDashboard, MessageSquare, FileText, BarChart2, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const data = await response.json()
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const handleLogout = async () => {
    try {
      localStorage.clear()
      sessionStorage.clear()

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Feedback',
      href: '/dashboard/feedback',
      icon: MessageSquare,
    },
    {
      name: 'Forms',
      href: '/dashboard/forms',
      icon: FileText,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart2,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center w-full px-2 sm:px-4 md:px-6 lg:px-0 pr-2 sm:pr-4 md:pr-8">
          {/* Custom mobile sidebar menu button */}
          <button
            type="button"
            className="lg:hidden mr-2 h-9 w-9 flex items-center justify-center rounded border border-input bg-background"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <Link href="/dashboard" className="flex items-center select-none pl-2 sm:pl-4 lg:pl-6">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 inline-flex items-center">
              review<Image src="/logo.png" alt="Plus Logo" width={22} height={22} className="inline-block align-middle" priority />
            </span>
          </Link>
          <div className="flex-1" />
          {/* Avatar/profile button always in header, right-aligned */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full flex items-center justify-center mr-2 sm:mr-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userProfile?.user_metadata?.picture || userProfile?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {userProfile?.user_metadata?.name?.[0] || userProfile?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="h-16 w-full" />

      {/* Main layout below header and spacer */}
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40 border-r bg-muted/40">
            <nav className="flex flex-col h-full space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          <main className="flex-1 p-2 sm:p-4 md:p-6">{children}</main>
        </div>
      </div>

      {/* Custom mobile sidebar and overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          {/* Sidebar */}
          <nav
            className="fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-background shadow-lg transition-transform duration-300 lg:hidden flex flex-col p-4"
            style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
            aria-label="Mobile sidebar navigation"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center pl-2 pr-3 py-2 gap-3 text-base font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </>
      )}
    </div>
  )
} 