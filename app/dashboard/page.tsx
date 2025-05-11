"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, BarChart3, Settings, Users, TrendingUp, Star, ThumbsUp, ThumbsDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { CompanyReviewStats } from "@/components/company-review-stats"
import { RecentReviews } from "@/components/recent-reviews"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  totalReviews: number
  averageRating: number
  positiveReviews: number
  negativeReviews: number
  // feedbackCollected: number
  reviewGrowth: number
  ratingGrowth: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push("/login")
          return
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics")
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [router])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px] text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 px-4 sm:px-4 md:px-6 pb-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mt-2 mb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return "Good morning!";
              if (hour < 18) return "Good afternoon!";
              return "Good evening!";
            })()}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1">
            {stats?.totalReviews ? (
              `Monitoring ${stats.totalReviews} customer experiences. ${stats.negativeReviews ? `${stats.negativeReviews} need attention.` : 'All feedback is positive!'}`
            ) : (
              "Start collecting customer feedback to identify areas for improvement."
            )}
          </p>
        </div>
        <Link href="/dashboard/forms/new" className="w-full md:w-auto mt-2 md:mt-0">
          <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Form
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <div className="flex items-center mt-2">
              {stats?.reviewGrowth ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">
                    +{stats.reviewGrowth}% from last month
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">First month of data collection</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
            <div className="flex items-center mt-2">
              {stats?.ratingGrowth ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">
                    +{stats.ratingGrowth} from last month
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">First month of data collection</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Feedbacks</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.positiveReviews || 0}</div>
            <div className="flex items-center mt-2">
              {stats?.totalReviews ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                  {Math.round((stats.positiveReviews / stats.totalReviews) * 100)}% of total
                </Badge>
              ) : (
                <p className="text-xs text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negative Feedbacks</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <ThumbsDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.negativeReviews || 0}</div>
            <div className="flex items-center mt-2">
              {stats?.totalReviews ? (
                <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
                  {Math.round((stats.negativeReviews / stats.totalReviews) * 100)}% of total
                </Badge>
              ) : (
                <p className="text-xs text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Feedback Analytics</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  Feedback distribution over the last 7 days
                </CardDescription>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <CompanyReviewStats />
          </CardContent>
        </Card>

        <Card className="col-span-1 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Feedbacks</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  Latest feedback from your customers
                </CardDescription>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecentReviews />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 