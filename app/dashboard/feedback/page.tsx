"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Star, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { DateRange } from "react-day-picker"
import FeedbackDateRangePicker from "@/components/FeedbackDateRangePicker"
import ReviewStatusSelect from "@/components/ReviewStatusSelect"
import { Review } from "@/types/review"

type SortOption = "newest" | "oldest" | "highest" | "lowest"
type FilterOption = "all" | "positive" | "negative"

export default function FeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [selectedForm, setSelectedForm] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const router = useRouter()
  const [forms, setForms] = useState<{ id: string; name: string }[]>([])

  // Responsive: show 1 month on mobile, 2 on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        filterBy,
        formId: selectedForm,
        ...(dateRange && { dateFrom: dateRange.from?.toISOString(), dateTo: dateRange.to?.toISOString() }),
        ...(searchQuery && { searchQuery })
      })

      const response = await fetch(`/api/reviews?${params}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
        
        const data = await response.json()
      setReviews(data.reviews)
      setTotalItems(data.total)
      setTotalPages(data.totalPages)
      setForms(data.forms)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchReviews()
  }, [currentPage, sortBy, filterBy, selectedForm, dateRange, searchQuery])

  const handleFilterChange = (value: FilterOption) => {
    setFilterBy(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleFormChange = (value: string) => {
    setSelectedForm(value)
    setCurrentPage(1)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const exportToCSV = async (exportAll: boolean = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: exportAll ? '1' : currentPage.toString(),
        limit: exportAll ? totalItems.toString() : itemsPerPage.toString(),
        sortBy,
        filterBy,
        formId: selectedForm,
        ...(dateRange && { dateFrom: dateRange.from?.toISOString(), dateTo: dateRange.to?.toISOString() }),
        ...(searchQuery && { searchQuery })
      })

      const response = await fetch(`/api/reviews?${params}`)
      if (!response.ok) throw new Error('Failed to fetch reviews for export')
      
      const data = await response.json()
      const reviewsToExport = data.reviews

    const headers = [
      "Date",
      "Form",
      "Rating",
      "Comment",
      "Categories",
      "Contact Name",
      "Contact Email",
      "Contact Phone",
      "Contact Status"
    ]
    
      const csvData = reviewsToExport.map((review: Review) => [
        format(new Date(review.created_at), 'yyyy-MM-dd HH:mm:ss'),
        review.form?.name || 'Unknown Form',
      review.rating,
      review.comment || "",
      review.feedback_categories?.join(", ") || "",
      review.contact_name || "",
      review.contact_email || "",
      review.contact_phone || "",
      review.contact_status || ""
    ])

    const csvContent = [
      headers.join(","),
        ...csvData.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
      link.setAttribute("download", `reviews-${format(new Date(), 'yyyy-MM-dd')}${exportAll ? '-all' : '-page-' + currentPage}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting reviews:', error)
      setError('Failed to export reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (reviewId: string, newStatus: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, contact_status: newStatus }
        : review
    ))
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
    <div className="flex-1 space-y-4 px-6 sm:px-8 md:px-12 pt-6 pb-6">
      {/* Header and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-2">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">All Feedback</h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">View and manage all your customer feedback</p>
        </div>
        <div className="flex justify-center sm:justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => exportToCSV(false)}
                >
                  Export Current Page
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => exportToCSV(true)}
                >
                  Export All Pages
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters: 2-column grid on mobile, 4-column on desktop, no horizontal scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Sort By</label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Filter By Feedback</label>
          <Select value={filterBy} onValueChange={handleFilterChange}>
            <SelectTrigger className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
              <SelectValue placeholder="Filter by feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Feedback</SelectItem>
              <SelectItem value="positive">Positive Feedback</SelectItem>
              <SelectItem value="negative">Negative Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Filter By Form</label>
          <Select value={selectedForm} onValueChange={handleFormChange}>
            <SelectTrigger className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.name}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Date Range</label>
          <div className="relative">
            <FeedbackDateRangePicker 
              value={dateRange} 
              onChange={handleDateRangeChange}
              className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm"
              popoverProps={{
                className: "mr-4",
                align: "start",
                sideOffset: 4
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Search</label>
        <Input
          placeholder="Search in comments, forms, or categories..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm"
        />
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Feedback List</CardTitle>
          <CardDescription>
            Showing {reviews.length} of {totalItems} feedbacks
            {filterBy !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {filterBy === "positive" ? "Positive" : "Negative"} Feedbacks
              </Badge>
            )}
            {selectedForm !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {selectedForm}
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                          ))}
                        </div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-4 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{review.form?.name || 'Unknown Form'}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        review.is_positive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {review.is_positive ? 'Positive' : 'Negative'}
                      </span>
                    </div>
                    {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                </div>
                {review.feedback_categories && review.feedback_categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {review.feedback_categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                {(review.contact_name || review.contact_email || review.contact_phone) && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                        <ReviewStatusSelect
                          reviewId={review.id}
                          currentStatus={review.contact_status}
                          onStatusChange={(newStatus) => handleStatusChange(review.id, newStatus)}
                        />
                    </div>
                    <div className="space-y-2">
                      {review.contact_name && (
                          <p className="text-sm text-muted-foreground">Name: {review.contact_name}</p>
                      )}
                      {review.contact_email && (
                          <p className="text-sm text-muted-foreground">Email: {review.contact_email}</p>
                      )}
                      {review.contact_phone && (
                          <p className="text-sm text-muted-foreground">Phone: {review.contact_phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm w-10 h-10 flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-wrap items-center gap-2 justify-center flex-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 p-0 ${
                      currentPage === page 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                        : 'bg-gradient-to-br from-white to-gray-50 border-none shadow-sm'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm w-10 h-10 flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 