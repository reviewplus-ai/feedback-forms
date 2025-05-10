"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts"
import { useRouter } from "next/navigation"

interface ReviewData {
  name: string
  total: number
  positive: number
  negative: number
}

export function CompanyReviewStats() {
  const [data, setData] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchReviewStats() {
      try {
        const response = await fetch("/api/reviews/stats")
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push("/login")
          return
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch review statistics")
        }
        
        const stats = await response.json()
        setData(stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchReviewStats()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p>Loading review statistics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[350px] text-red-500">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p>No review data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Total"
        />
        <Line
          type="monotone"
          dataKey="positive"
          stroke="#4ade80"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Positive"
        />
        <Line
          type="monotone"
          dataKey="negative"
          stroke="#f87171"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Negative"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
