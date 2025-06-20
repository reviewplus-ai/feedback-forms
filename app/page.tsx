"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Footer from '@/components/Footer'
import { Check, Star, ArrowRight, Shield, Zap, BarChart3, Users, Sparkles, QrCode, MessageSquare, TrendingUp, Building2, Heart, DollarSign, Clock, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + 100

      sections.forEach((section) => {
        const sectionElement = section as HTMLElement
        const sectionTop = sectionElement.offsetTop
        const sectionHeight = sectionElement.offsetHeight
        const sectionId = section.getAttribute("id")

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId || "")
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center select-none group">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 inline-flex items-center transition-transform group-hover:scale-105">
                review<Image src="/logo.png" alt="Plus Logo" width={22} height={22} className="inline-block align-middle" priority />
              </span>
            </Link>
            <div className="flex items-center gap-6 ml-4 md:ml-0">
              <nav className="hidden md:flex items-center gap-4">
                {[
                  { id: "features", label: "Features" },
                  { id: "how-it-works", label: "How It Works" },
                  { id: "why-it-matters", label: "Why It Matters" },
                  // { id: "testimonials", label: "Testimonials" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      activeSection === item.id
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            <div className="flex items-center gap-4">
                <Link href="/quote" className="ml-4">
                  <Button variant="outline" className="font-medium border-blue-200 text-blue-600 hover:bg-blue-50">
                    Get a Quote
                  </Button>
                </Link>
              <Link href="/login">
                  <Button variant="ghost" className="font-medium hover:bg-gray-100/50">Login</Button>
              </Link>
              <Link href="/signup">
                  <Button className="font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20">Sign Up</Button>
              </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 rounded-full blur-3xl" />
        </div>

        {/* Hero Section */}
        <section id="hero" className="relative pt-6 pb-8 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
              <div className="inline-flex items-center rounded-full border border-blue-200 px-3 py-1 text-xs sm:text-sm font-medium bg-blue-50/50 text-blue-700 backdrop-blur-sm animate-fade-in-delay-1">
                <Sparkles className="w-4 h-4 mr-2" />
                The Smart Way to Collect Feedback
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 animate-fade-in-delay-2">
                Smart Feedback Collection for Your Business
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto animate-fade-in-delay-3">
                Collect instant feedback with simple surveys—no hardware required. Start your 7-day free trial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-3 animate-fade-in-delay-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  </Link>
                {/* <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link> */}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 pt-8 animate-fade-in-delay-5">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  <span>No Hardware Required</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  <span>Instant Feedback</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  <span>Trusted by 10k+ Businesses</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What ReviewPlus Does Section */}
        <section id="features" className="py-8 md:py-20 lg:py-32 relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-4xl space-y-12 animate-fade-in">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  What ReviewPlus Does
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-gray-600">
                  Collect instant feedback from your customers with a simple QR code
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-8 animate-fade-in-delay-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Scan & Share</h3>
                      <p className="text-gray-600">Customers scan QR code and provide instant feedback</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Real-time Insights</h3>
                      <p className="text-gray-600">Get feedback directly to your dashboard instantly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">For Any Business</h3>
                      <p className="text-gray-600">Perfect for salons, restaurants, clinics, and retail shops</p>
                    </div>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm animate-fade-in-delay-2">
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="group relative">
                          <Star className={`w-8 h-8 transition-colors duration-200 ${
                            star <= 2 ? 'text-red-400' : star <= 4 ? 'text-yellow-400' : 'text-green-400'
                          }`} />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="text-sm text-gray-600">Negative</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="text-sm text-gray-600">Neutral</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span className="text-sm text-gray-600">Positive</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Smart rating system that automatically categorizes feedback
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-8 md:py-20 lg:py-32 relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-5xl space-y-16 animate-fade-in">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  How It Works
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-gray-600">
                  A simple three-step process to collect and analyze feedback
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white rounded-2xl p-8 h-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-6">
                      <QrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Display QR Code</h3>
                    <p className="text-gray-600">Place your unique QR code at checkout points for easy customer access</p>
                    <div className="mt-6 flex items-center text-sm text-blue-600">
                      <span>Step 1</span>
                      <div className="w-8 h-px bg-blue-200 mx-2" />
                      <span>Setup</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white rounded-2xl p-8 h-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 mb-6">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Collect Feedback</h3>
                    <p className="text-gray-600">Customers scan and provide instant feedback through a mobile-friendly form</p>
                    <div className="mt-6 flex items-center text-sm text-purple-600">
                      <span>Step 2</span>
                      <div className="w-8 h-px bg-purple-200 mx-2" />
                      <span>Engage</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white rounded-2xl p-8 h-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 mb-6">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">View Insights</h3>
                    <p className="text-gray-600">Access real-time analytics and insights on your dashboard</p>
                    <div className="mt-6 flex items-center text-sm text-green-600">
                      <span>Step 3</span>
                      <div className="w-8 h-px bg-green-200 mx-2" />
                      <span>Analyze</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-2xl blur-2xl" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900">Real-time Feedback Loop</h3>
                      <p className="text-gray-600">Get instant notifications and actionable insights from customer feedback</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Instant Notifications</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <span>Smart Analytics</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Action Tracking</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                      <div className="relative h-full flex items-center justify-center">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-blue-600" />
                          </div>
                          <ArrowRight className="w-6 h-6 text-gray-400" />
                          <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-purple-600" />
                          </div>
                          <ArrowRight className="w-6 h-6 text-gray-400" />
                          <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Matters Section */}
        <section id="why-it-matters" className="py-8 md:py-20 lg:py-32 relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-5xl space-y-16 animate-fade-in">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  Why It Matters
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-gray-600">
                  Every day, you see customers leave with polite smiles and think all is well. But behind each smile could be a hidden concern.
                </p>
              </div>

              <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 h-full">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 mb-4 md:mb-6">
                      <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Catch Small Problems</h3>
                    <p className="text-sm md:text-base text-gray-600">Identify issues before they grow into bigger problems. Early detection means easier solutions.</p>
                    <div className="mt-4 md:mt-6 flex items-center text-sm text-blue-600">
                      <span>Proactive</span>
                      <div className="w-6 md:w-8 h-px bg-blue-200 mx-2" />
                      <span>Preventive</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 h-full">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 mb-4 md:mb-6">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Show You Care</h3>
                    <p className="text-sm md:text-base text-gray-600">Demonstrate that customer feedback matters to your business. Build trust through active listening.</p>
                    <div className="mt-4 md:mt-6 flex items-center text-sm text-purple-600">
                      <span>Engagement</span>
                      <div className="w-6 md:w-8 h-px bg-purple-200 mx-2" />
                      <span>Trust</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 h-full">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-50 mb-4 md:mb-6">
                      <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Drive Revenue</h3>
                    <p className="text-sm md:text-base text-gray-600">84% of companies report higher revenue after focusing on customer experience.</p>
                    <div className="mt-4 md:mt-6 flex items-center text-sm text-green-600">
                      <span>Growth</span>
                      <div className="w-6 md:w-8 h-px bg-green-200 mx-2" />
                      <span>ROI</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 h-full">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 mb-4 md:mb-6">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Build Loyalty</h3>
                    <p className="text-sm md:text-base text-gray-600">Repeat buyers typically spend 67% more than new customers. Loyal customers are your best advocates.</p>
                    <div className="mt-4 md:mt-6 flex items-center text-sm text-orange-600">
                      <span>Retention</span>
                      <div className="w-6 md:w-8 h-px bg-orange-200 mx-2" />
                      <span>Advocacy</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 rounded-2xl blur-2xl" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                    <div className="space-y-4">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900">The Power of Customer Feedback</h3>
                      <p className="text-base md:text-lg text-gray-600 max-w-xl">
                        Transform your business by listening to your customers. Every piece of feedback is an opportunity to improve.
                      </p>
                      <div className="flex flex-wrap gap-3 md:gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          <span>Early Problem Detection</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                          <span>Customer Trust</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                          <span>Revenue Growth</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                          <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                          <span>Customer Loyalty</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-40 md:h-48 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl p-4 md:p-6">
                      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                      <div className="relative h-full flex items-center justify-center">
                        <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                          </div>
                          <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
                            <Heart className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                          </div>
                          <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                          </div>
                          <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
                            <Users className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-8 md:py-20 lg:py-32 relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-5xl space-y-16 animate-fade-in">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  Customer Testimonials
                </h2>
              </div>
              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                {[
                  {
                    quote: "ReviewPlus has transformed how we gather feedback. Setting up our first QR survey took only minutes, and now our team acts on customer insights daily. We've seen a real uptick in returning customers since we started using it.",
                    author: "Muhammed Safeer ",
                    role: "Unomed"
                  },
                  {
                    quote: "In one week, ReviewPlus gathered more survey responses than our old system did in months. The insights helped us re-train staff quickly and increase our satisfaction score by 20%. It's a no-brainer for any business.",
                    author: "Sheeba",
                    role: "Alovera Beauty"
                  },
                  {
                    quote: "Our members love being heard. By using ReviewPlus after classes, we improved amenities where it mattered. Membership renewals have gone up 15%!",
                    author: "Bibin",
                    role: "Ferro Sappiens Fitness Center"
                  }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={`group relative flex flex-col h-full rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in-delay-${index + 1}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex-1 flex flex-col">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4 flex-1">"{item.quote}"</p>
                      <div>
                        <p className="font-medium text-gray-900">{item.author}</p>
                        <p className="text-sm text-gray-600">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta" className="py-8 md:py-20 lg:py-32 relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-3xl text-center space-y-8 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                Get Started Today
              </h2>
              <p className="text-xl text-gray-600">
                Choose the plan that works best for your business. All plans include a 7-day free trial.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs sm:max-w-none mx-auto animate-fade-in-delay-2">
                <Link href="/signup" className="w-full">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/quote" className="w-full">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Get a Custom Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
