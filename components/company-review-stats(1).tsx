"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 45,
    positive: 32,
    negative: 13,
  },
  {
    name: "Feb",
    total: 52,
    positive: 40,
    negative: 12,
  },
  {
    name: "Mar",
    total: 61,
    positive: 48,
    negative: 13,
  },
  {
    name: "Apr",
    total: 58,
    positive: 42,
    negative: 16,
  },
  {
    name: "May",
    total: 71,
    positive: 56,
    negative: 15,
  },
  {
    name: "Jun",
    total: 82,
    positive: 65,
    negative: 17,
  },
  {
    name: "Jul",
    total: 93,
    positive: 76,
    negative: 17,
  },
  {
    name: "Aug",
    total: 105,
    positive: 85,
    negative: 20,
  },
  {
    name: "Sep",
    total: 112,
    positive: 90,
    negative: 22,
  },
  {
    name: "Oct",
    total: 120,
    positive: 95,
    negative: 25,
  },
  {
    name: "Nov",
    total: 132,
    positive: 105,
    negative: 27,
  },
  {
    name: "Dec",
    total: 142,
    positive: 110,
    negative: 32,
  },
]

export function CompanyReviewStats() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="positive" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
