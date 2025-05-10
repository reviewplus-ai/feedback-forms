'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BarChart, LineChart, PieChart, Download, Calendar as CalendarIcon, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getAnalyticsMetrics, getReviewTrends, getRatingDistribution, exportAnalyticsData, getFormAnalytics, getFeedbackAnalysis } from '@/app/actions/analytics'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts'
import { toast } from 'sonner'
import FeedbackDateRangePicker from '@/components/FeedbackDateRangePicker'
import { DateRange } from 'react-day-picker'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
const MINIMAL_COLORS = {
  negative: '#FCA5A5', // mild red
  neutral: '#60A5FA', // blue
  positive: '#34D399' // green
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>()
  const [timeRange, setTimeRange] = useState('7d')
  const [metrics, setMetrics] = useState<any>(null)
  const [reviewTrends, setReviewTrends] = useState<any[]>([])
  const [ratingDistribution, setRatingDistribution] = useState<any>({})
  const [formAnalytics, setFormAnalytics] = useState<any[]>([])
  const [feedbackAnalysis, setFeedbackAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)

  const clearAnalyticsData = () => {
    setMetrics(null)
    setReviewTrends([])
    setRatingDistribution(null)
    setFormAnalytics([])
    setFeedbackAnalysis(null)
    setLoading(true)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setLoading(true)
    if (!range?.from && !range?.to) {
      setTimeRange('7d')
      setDateRange(undefined)
      return
    }
    if (range?.from && range?.to) {
      setDateRange(range)
      setTimeRange('')
    }
  }

  const handleTimeRangeChange = (range: string) => {
    setLoading(true)
    if (range) {
      setTimeRange(range)
      setDateRange(undefined)
    }
  }

  useEffect(() => {
    if (loading && (timeRange || (dateRange?.from && dateRange?.to))) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, timeRange, dateRange])

  useEffect(() => {
    // Set default selected form when feedbackAnalysis loads
    if (feedbackAnalysis?.feedbackOptionsByForm?.length > 0) {
      setSelectedFormId(feedbackAnalysis.feedbackOptionsByForm[0].formId)
    }
  }, [feedbackAnalysis])

  const fetchData = async () => {
    try {
      // Validate date range
      if (dateRange?.from && dateRange?.to) {
        if (dateRange.from > dateRange.to) {
          toast.error('Invalid date range: Start date must be before end date')
          setLoading(false)
          return
        }
      }

      const [metricsData, trendsData, distributionData, formData, feedbackData] = await Promise.all([
        getAnalyticsMetrics(timeRange, dateRange),
        getReviewTrends(timeRange, dateRange),
        getRatingDistribution(timeRange, dateRange),
        getFormAnalytics(timeRange, dateRange),
        getFeedbackAnalysis(timeRange, dateRange)
      ])

      setMetrics(metricsData || null)
      setReviewTrends(trendsData || [])
      setRatingDistribution(distributionData || null)
      setFormAnalytics(formData || null)
      setFeedbackAnalysis(feedbackData || null)
    } catch (error) {
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely format numbers
  const safeNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return 0
    return value
  }

  // Move handleExport below all variable declarations to avoid linter errors
  const handleExport = async () => {
    try {
      // Gather all analytics data from state
      const exportRows: string[] = [];
      const dateLabel = dateRange?.from && dateRange?.to
        ? `${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`
        : timeRange;
      const formLabel = selectedFormId
        ? allForms.find(f => String(f.formId) === String(selectedFormId))?.formName || 'Selected Form'
        : 'All Forms';

      // Section: Summary Metrics
      exportRows.push('Summary Metrics');
      exportRows.push(`Date Range:,${dateLabel}`);
      exportRows.push(`Form:,${formLabel}`);
      exportRows.push('Metric,Value');
      if (metrics) {
        exportRows.push(`Review Volume,${metrics.totalReviews}`);
        exportRows.push(`Average Rating,${metrics.averageRating}`);
        exportRows.push(`Completion Rate,${metrics.completionRate}%`);
        exportRows.push(`Positive Reviews,${metrics.positiveReviews}`);
        exportRows.push(`Contact Requests,${metrics.contactRequests}`);
        exportRows.push(`Form Engagement,${metrics.formEngagement}%`);
        exportRows.push(`Active Forms,${metrics.activeForms}`);
        exportRows.push(`Total Forms,${metrics.totalForms}`);
      }
      exportRows.push('');

      // Section: Review Trends
      exportRows.push('Review Trends');
      exportRows.push('Date,Rating');
      filteredReviewTrends.forEach((trend: any) => {
        exportRows.push(`${format(new Date(trend.created_at), 'yyyy-MM-dd')},${trend.rating}`);
      });
      exportRows.push('');

      // Section: Rating Distribution
      exportRows.push('Rating Distribution');
      exportRows.push('Rating,Count');
      filteredRatingDistribution.forEach((dist: any) => {
        exportRows.push(`${dist.name},${dist.value}`);
      });
      exportRows.push('');

      // Section: Form Comparison
      exportRows.push('Form Comparison');
      exportRows.push('Form Name,Total Reviews,Average Rating,Positive %,Negative %');
      formAnalytics.forEach((form: any) => {
        exportRows.push(`${form.name},${form.totalReviews},${form.averageRating},${form.positivePercentage}%,${form.negativePercentage}%`);
      });
      exportRows.push('');

      // Section: Negative Reviews
      exportRows.push('Negative Reviews');
      exportRows.push('Text,Rating,Date');
      (selectedNegative || []).forEach((neg: any) => {
        exportRows.push(`"${(neg.text || '').replace(/"/g, '""')}",${neg.rating},${format(new Date(neg.created_at), 'yyyy-MM-dd HH:mm')}`);
      });
      exportRows.push('');

      // Section: Feedback Categories
      exportRows.push('Feedback Categories');
      exportRows.push('Category,Count');
      (selectedFeedbackOptions || []).forEach((cat: any) => {
        exportRows.push(`"${(cat.option || '').replace(/"/g, '""')}",${cat.count}`);
      });
      exportRows.push('');

      // Section: Common Phrases (optional)
      exportRows.push('Common Phrases');
      exportRows.push('Phrase,Count');
      (filteredCommonPhrases || []).forEach((phrase: any) => {
        exportRows.push(`"${(phrase.phrase || '').replace(/"/g, '""')}",${phrase.count}`);
      });
      exportRows.push('');

      // Download as CSV
      const csv = exportRows.join('\n');
      downloadCSV(csv, `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  }

  const convertToCSV = (data: any[]) => {
    const headers = ['Date', 'Rating', 'Comment', 'Form Name', 'Company Name', 'Contact Email']
    const rows = data.map(review => [
      format(new Date(review.created_at), 'yyyy-MM-dd HH:mm:ss'),
      review.rating,
      review.comment || '',
      review.review_forms?.name || '',
      review.review_forms?.company_name || '',
      review.contact_email || ''
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const pieData = ratingDistribution ? Object.entries(ratingDistribution).map(([rating, count]) => ({
    name: `${rating} Stars`,
    value: count
  })) : []

  const formComparisonData = formAnalytics.map(form => ({
    name: form.name,
    positive: form.positiveReviews,
    negative: form.negativeReviews,
    neutral: form.neutralReviews,
    averageRating: parseFloat(form.averageRating)
  }))

  // Use all forms from formAnalytics for the dropdown
  const allForms = formAnalytics.map((form: any) => ({ formId: form.id, formName: form.name }))

  // Get selected form's data (robust string comparison)
  const selectedFeedbackOptions = feedbackAnalysis?.feedbackOptionsByForm?.find(
    (f: any) => String(f.formId) === String(selectedFormId)
  )?.feedbackOptions || []
  const selectedNegative = feedbackAnalysis?.negativeByForm?.find(
    (f: any) => String(f.formId) === String(selectedFormId)
  )?.negative || []

  // Filter metrics for selected form
  const filteredMetrics = selectedFormId && metrics && formAnalytics.length > 0
    ? (() => {
        if (!selectedFormId) return metrics; // All Forms
        const form = formAnalytics.find((f: any) => String(f.id) === String(selectedFormId));
        if (!form) return metrics;
        // Calculate metrics for the selected form only
        const totalReviews = form.totalReviews;
        const reviewsWithComments = form.reviewsWithComments ?? 0;
        const completionRate = form.completionRate ?? 0;
        const positiveReviews = form.positiveReviews;
        const averageRating = parseFloat(form.averageRating);
        const contactRequests = form.contactRequests || 0;
        const contactRate = form.contactRate || 0;
        return {
          ...metrics,
          totalReviews,
          reviewsWithComments,
          completionRate,
          positiveReviews,
          averageRating,
          contactRequests,
          contactRate,
          formEngagement: 100, // always 100% for a single form
          activeForms: 1,
          totalForms: 1
        };
      })()
    : metrics;

  const filteredReviewTrends = selectedFormId
    ? reviewTrends.filter((r: any) => String(r.form_id) === String(selectedFormId))
    : reviewTrends

  const ratingLabels = {
    '1': 'Poor',
    '2': 'Fair',
    '3': 'Good',
    '4': 'Very Good',
    '5': 'Excellent'
  } as const;

  // Get the distribution for selected form or global
  const selectedDist = selectedFormId 
    ? (ratingDistribution as Record<string, Record<string, number>>)?.[selectedFormId] || {}
    : Object.values(ratingDistribution as Record<string, Record<string, number>> || {})
        .reduce((acc, curr) => {
          Object.entries(curr || {}).forEach(([rating, count]) => {
            acc[rating] = (acc[rating] || 0) + Number(count);
          });
          return acc;
        }, {} as Record<string, number>);

  // Transform the data for the pie chart
  const filteredRatingDistribution = Object.entries(selectedDist || {})
    .filter(([rating, count]) => ['1','2','3','4','5'].includes(rating) && count > 0)
    .map(([rating, count]) => ({
      name: ratingLabels[rating as '1'|'2'|'3'|'4'|'5'],
      value: Number(count)
    }))
    .sort((a, b) => Number(a.name.split(' ')[1]) - Number(b.name.split(' ')[1]));

  // Find the common phrases for the selected form (or global)
  const selectedCommonPhrases = selectedFormId && selectedFormId !== ''
    ? feedbackAnalysis?.commonPhrasesByForm?.find((f: any) => String(f.formId) === String(selectedFormId))?.commonPhrases || []
    : feedbackAnalysis?.commonPhrases || [];
  // Filter out empty or whitespace-only phrases
  const filteredCommonPhrases = selectedCommonPhrases.filter(
    (p: any) => p.phrase && p.phrase.trim().length > 0
  );
  // Only show if at least 2 phrases have count > 1
  const trulyCommonPhrases = filteredCommonPhrases.filter((p: any) => p.count > 1);

  // Helper function to safely calculate percentages with rounding
  const safePercentage = (value: number, total: number) => {
    if (!total || total === 0) return 0
    return Math.round((value / total) * 100)
  }

  // Helper function to format percentage changes
  const formatPercentageChange = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '0%'
    return `${value > 0 ? '+' : ''}${Math.round(value)}%`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track and analyze your customer feedback performance</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="font-medium text-sm text-muted-foreground">Form</label>
            <select
              className="w-full rounded-md border border-input bg-gradient-to-br from-white to-gray-50 px-3 py-2 shadow-sm"
              value={selectedFormId || ''}
              onChange={e => setSelectedFormId(e.target.value)}
              disabled={loading}
            >
              <option value="">All Forms</option>
              {allForms.map((form: any) => (
                <option key={form.formId} value={form.formId}>{form.formName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm text-muted-foreground">Date Range</label>
            <div className="relative">
              <FeedbackDateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm text-muted-foreground">Quick Range</label>
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="w-full rounded-md border border-input bg-gradient-to-br from-white to-gray-50 px-3 py-2 shadow-sm"
              disabled={loading}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm text-muted-foreground">Actions</label>
            <Button 
              onClick={handleExport} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 space-y-4">
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
          <div className="grid gap-6 md:grid-cols-2">
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
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="mb-4">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Review Volume</CardTitle>
                <BarChart className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeNumber(filteredMetrics?.totalReviews)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(filteredMetrics?.reviewTrend)} from last period
                </p>
                <div className="mt-2">
                  <div className="text-sm font-medium">Completion Rate</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" 
                      style={{ width: `${safeNumber(filteredMetrics?.completionRate)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {safeNumber(filteredMetrics?.completionRate)}% with comments
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating Analysis</CardTitle>
                <LineChart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeNumber(filteredMetrics?.averageRating)?.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(filteredMetrics?.ratingTrend)} from last period
                </p>
                <div className="mt-2">
                  <div className="text-sm font-medium">Positive vs Negative</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600" 
                      style={{ width: `${safePercentage(safeNumber(filteredMetrics?.positiveReviews), safeNumber(filteredMetrics?.totalReviews))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {safePercentage(safeNumber(filteredMetrics?.positiveReviews), safeNumber(filteredMetrics?.totalReviews))}% positive reviews
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Callback Requests</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeNumber(filteredMetrics?.contactRate)}%</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(filteredMetrics?.contactTrend)} from last period
                </p>
                <div className="mt-2">
                  <div className="text-sm font-medium">Pending Callbacks</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" 
                      style={{ width: `${safePercentage(safeNumber(filteredMetrics?.contactRequests), safeNumber(filteredMetrics?.totalReviews))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {safeNumber(filteredMetrics?.contactRequests)} customers waiting for callback
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Form Performance</CardTitle>
                <BarChart className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeNumber(filteredMetrics?.formEngagement)}%</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(filteredMetrics?.formTrend)} from last period
                </p>
                <div className="mt-2">
                  <div className="text-sm font-medium">Active Forms</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" 
                      style={{ width: `${safePercentage(safeNumber(filteredMetrics?.activeForms), safeNumber(filteredMetrics?.totalForms))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {safeNumber(filteredMetrics?.activeForms)} of {safeNumber(filteredMetrics?.totalForms)} forms active
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Review Trends</h3>
              <div className="h-[300px]">
                {filteredReviewTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={filteredReviewTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="created_at"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        stroke="#6B7280"
                      />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                        contentStyle={{ 
                          borderRadius: 8, 
                          background: '#fff', 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          border: 'none'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#3B82F6' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No review trend data available
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
              <div className="h-[300px]">
                {filteredRatingDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={filteredRatingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {filteredRatingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} reviews`, 'Count']}
                        contentStyle={{ 
                          borderRadius: 8, 
                          background: '#fff', 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          border: 'none'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No rating data available
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Form Comparison</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={formComparisonData} barCategoryGap={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: 8, 
                      background: '#fff', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: 'none'
                    }}
                    labelStyle={{ color: '#6B7280', fontWeight: 500 }}
                    itemStyle={{ color: '#374151' }}
                  />
                  <Bar 
                    dataKey="positive" 
                    name="Positive Reviews" 
                    fill={MINIMAL_COLORS.positive} 
                    radius={[8, 8, 0, 0]} 
                    stackId="a" 
                    isAnimationActive 
                  />
                  <Bar 
                    dataKey="neutral" 
                    name="Neutral Reviews" 
                    fill={MINIMAL_COLORS.neutral} 
                    radius={[8, 8, 0, 0]} 
                    stackId="a" 
                    isAnimationActive 
                  />
                  <Bar 
                    dataKey="negative" 
                    name="Negative Reviews" 
                    fill={MINIMAL_COLORS.negative} 
                    radius={[8, 8, 0, 0]} 
                    stackId="a" 
                    isAnimationActive 
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Negative Feedback</h3>
              <div className="space-y-4 h-80 overflow-y-auto pr-2">
                {selectedNegative && selectedNegative.length > 0 ? (
                  selectedNegative.map((feedback: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <TrendingDown className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{feedback.text}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>Rating: {feedback.rating} stars</span>
                          <span>•</span>
                          <span>{format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No negative feedback available for this period
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Most Selected Feedback Categories</h3>
              <div className="space-y-4 h-80 overflow-y-auto pr-2">
                {selectedFeedbackOptions.length > 0 ? (
                  selectedFeedbackOptions.map((category: any, index: number, arr: any[]) => {
                    const allCounts = arr.map((c: any) => c.count)
                    const allEqual = allCounts.every((count: number) => count === allCounts[0])
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-medium">{category.option}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{category.count} times</span>
                          {!allEqual && (
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600" 
                                style={{ 
                                  width: `${(category.count / arr[0].count * 100)}%` 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : selectedFormId ? (
                  <div className="text-muted-foreground">No feedback categories available</div>
                ) : (
                  <div className="text-muted-foreground">No feedback categories available</div>
                )}
              </div>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Form Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-muted-foreground font-medium">Form Name</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Total Reviews</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Average Rating</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Positive %</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Negative %</th>
                  </tr>
                </thead>
                <tbody>
                  {formAnalytics.map((form) => (
                    <tr key={form.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-2">{form.name}</td>
                      <td className="py-2">{form.totalReviews}</td>
                      <td className="py-2">{form.averageRating}</td>
                      <td className="py-2 text-green-600">{form.positivePercentage}%</td>
                      <td className="py-2 text-red-600">{form.negativePercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
} 