import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Footer from '@/components/Footer'
import { Check, Star, ArrowRight, Shield, Zap, BarChart3, Users, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center select-none group">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 inline-flex items-center transition-transform group-hover:scale-105">
                review<Image src="/logo.png" alt="Plus Logo" width={22} height={22} className="inline-block align-middle" priority />
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {/* <Link href="/pricing">
                <Button variant="ghost" className="font-medium">Pricing</Button>
              </Link> */}
              <Link href="/login">
                <Button variant="ghost" className="font-medium hover:bg-gray-100/50">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-6 pb-8 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="hidden sm:block absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Hero Text */}
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-none">
                <div className="inline-flex items-center rounded-full border border-blue-200 px-3 py-1 text-xs sm:text-sm font-medium bg-blue-50/50 text-blue-700 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  The Smart Way to Collect Feedback
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  Smart Feedback Collection for Your Business
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                  Collect positive feedback where it matters most. Capture valuable insights from less satisfied
                  customers and improve your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-3 w-1/3 max-w-xs sm:max-w-none">
                  <Link href="/signup" className="w-full">
                    <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 pt-2">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Secure & Reliable</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Lightning Fast</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Trusted by 10k+ Businesses</span>
                  </div>
                </div>
              </div>
              {/* Feedback Card */}
              <div className="relative w-full max-w-md mx-auto lg:mx-0 order-2 lg:order-none">
                <div className="relative z-10 rounded-2xl border border-gray-200/50 bg-white/80 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-300">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">How would you rate your experience?</h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600">Your feedback helps us improve our service.</p>
                    </div>
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button 
                          key={rating} 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 sm:h-14 sm:w-14 rounded-full text-base sm:text-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="hidden sm:block absolute -top-4 -right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="hidden sm:block absolute -bottom-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 md:py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-5xl space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  How It Works
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-gray-600">
                  Our intelligent feedback system helps you collect more positive feedback and valuable insights.
                </p>
              </div>
              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                {[
                  {
                    title: "Create Your Form",
                    description: "Customize your feedback collection page with your branding and questions.",
                    icon: "🎨"
                  },
                  {
                    title: "Set Up Redirects",
                    description: "Configure where to send customers based on their rating.",
                    icon: "🔄"
                  },
                  {
                    title: "Share Your Link",
                    description: "Send customers to your feedback page and start collecting smarter insights.",
                    icon: "📤"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="group relative flex flex-col h-full rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex-1 flex flex-col">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-2xl text-white shadow-lg shadow-blue-500/20">
                        {feature.icon}
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="mt-3 text-gray-600 flex-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-8 md:py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-5xl space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  Simple, Transparent Pricing
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-gray-600">
                  Choose the plan that's right for your business. All plans include a 14-day free trial.
                </p>
              </div>
              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                {[
                  {
                    name: "Starter",
                    price: "$29",
                    description: "Perfect for small businesses just getting started.",
                    features: [
                      'Up to 100 feedbacks/month',
                      'Basic analytics',
                      'Email support',
                      '1 form template'
                    ],
                    buttonText: "Start Free Trial",
                    buttonLink: "/signup",
                    popular: false
                  },
                  {
                    name: "Pro",
                    price: "$79",
                    description: "For growing businesses that need more features.",
                    features: [
                      'Up to 500 feedbacks/month',
                      'Advanced analytics',
                      'Priority support',
                      '5 form templates',
                      'Custom branding',
                      'API access'
                    ],
                    buttonText: "Start Free Trial",
                    buttonLink: "/signup",
                    popular: true
                  },
                  {
                    name: "Enterprise",
                    price: "Custom",
                    description: "For large organizations with specific needs.",
                    features: [
                      'Unlimited feedbacks',
                      'Custom analytics',
                      '24/7 support',
                      'Unlimited templates',
                      'White-label solution',
                      'Custom integrations',
                      'Dedicated account manager'
                    ],
                    buttonText: "Contact Sales",
                    buttonLink: "/contact",
                    popular: false
                  }
                ].map((plan, index) => (
                  <div 
                    key={index}
                    className={`group relative flex flex-col h-full rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 ${
                      plan.popular ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg shadow-blue-500/20">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline">
                          <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                          {plan.price !== "Custom" && (
                            <span className="ml-1 text-lg text-gray-600">/mo</span>
                          )}
                        </div>
                        <p className="mt-2 text-gray-600">{plan.description}</p>
                      </div>
                      <ul className="space-y-3 flex-1">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <Check className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={plan.buttonLink} className="mt-6">
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20' 
                              : ''
                          }`}
                        >
                          {plan.buttonText}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-8 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-5xl space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  Trusted by Businesses Worldwide
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-gray-600">
                  See what our customers have to say about ReviewPlus.
                </p>
              </div>
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    quote: "ReviewPlus has transformed how we collect and manage customer feedback. The smart routing feature is a game-changer!",
                    author: "Sarah Johnson",
                    role: "Marketing Director",
                    company: "TechCorp"
                  },
                  {
                    quote: "The analytics dashboard gives us valuable insights into our customer satisfaction. Highly recommended!",
                    author: "Michael Chen",
                    role: "CEO",
                    company: "GrowthLabs"
                  },
                  {
                    quote: "Setting up our feedback collection system was a breeze. The customer support team is exceptional.",
                    author: "Emily Rodriguez",
                    role: "Customer Success Manager",
                    company: "ServicePro"
                  }
                ].map((testimonial, index) => (
                  <div 
                    key={index}
                    className="group relative rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex-1 flex flex-col">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4 flex-1">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-medium text-gray-900">{testimonial.author}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of businesses already using ReviewPlus to collect and manage their customer feedback.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs sm:max-w-none mx-auto">
                <Link href="/signup" className="w-full">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full hover:bg-gray-100/50"
                  >
                    Contact Sales
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
