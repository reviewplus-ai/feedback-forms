"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Building2, Mail, Phone, User, MessageSquare, Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function QuotePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "",
    message: ""
  })

  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ loading: true, success: false, error: null })

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote request')
      }

      setStatus({ loading: false, success: true, error: null })
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        businessType: "",
        message: ""
      })
    } catch (error) {
      console.error('Quote submission error:', error)
      setStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit quote request. Please try again.'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center select-none group">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 inline-flex items-center transition-transform group-hover:scale-105">
                review<Image src="/logo.png" alt="Plus Logo" width={22} height={22} className="inline-block align-middle" priority />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
              Get a Custom Quote
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              Tell us about your business and we'll help you find the perfect solution
            </p>
          </div>

          {status.success ? (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-green-200 p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                We've received your quote request and will get back to you within 24 hours.
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Return to Home
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/50 p-4 sm:p-6 md:p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {status.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-600">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{status.error}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-9 sm:pl-10 h-10 sm:h-11 text-base"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="pl-9 sm:pl-10 h-10 sm:h-11 text-base"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="pl-9 sm:pl-10 h-10 sm:h-11 text-base"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="company" className="text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your Company"
                        className="pl-9 sm:pl-10 h-10 sm:h-11 text-base"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="businessType" className="text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                    required
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-base">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="salon">Salon/Spa</SelectItem>
                      <SelectItem value="clinic">Medical Clinic</SelectItem>
                      <SelectItem value="fitness">Fitness Center</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Additional Information
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Textarea
                      id="message"
                      placeholder="Tell us about your business needs and any specific requirements..."
                      className="pl-9 sm:pl-10 min-h-[100px] sm:min-h-[120px] text-base resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={status.loading}
                    className="flex-1 h-11 sm:h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20"
                  >
                    {status.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 sm:h-12 text-base"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 sm:mt-8 text-center text-sm text-gray-600 px-4">
            <p>We'll get back to you within 24 hours with a custom quote.</p>
            <p className="mt-2">Need immediate assistance? <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact us</Link></p>
          </div>
        </div>
      </main>
    </div>
  )
} 