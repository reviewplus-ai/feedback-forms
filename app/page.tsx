import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center select-none">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 inline-flex items-center">
                review<Image src="/logo.png" alt="Plus Logo" width={22} height={22} className="inline-block align-middle" priority />
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="font-medium">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Smart Review Collection for Your Business
                </h2>
                <p className="text-xl text-muted-foreground">
                  Collect positive reviews where they matter most. Capture valuable feedback from less satisfied
                  customers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                  </Link>
                  {/* <Link href="/demo">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      View Demo
                    </Button>
                  </Link> */}
                </div>
              </div>
              <div className="mx-auto lg:ml-auto max-w-md">
                <div className="rounded-xl border bg-card p-8 shadow-lg">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">How would you rate your experience?</h3>
                      <p className="text-muted-foreground">Your feedback helps us improve our service.</p>
                    </div>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button key={rating} variant="outline" size="lg" className="h-14 w-14 rounded-full text-lg">
                          {rating}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
                <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                  Our intelligent review system helps you collect more positive reviews and valuable feedback.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
                    1
                  </div>
                  <h3 className="mt-6 text-xl font-bold">Create Your Form</h3>
                  <p className="mt-3 text-muted-foreground">
                    Customize your review collection page with your branding and questions.
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
                    2
                  </div>
                  <h3 className="mt-6 text-xl font-bold">Set Up Redirects</h3>
                  <p className="mt-3 text-muted-foreground">Configure where to send customers based on their rating.</p>
                </div>
                <div className="rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
                    3
                  </div>
                  <h3 className="mt-6 text-xl font-bold">Share Your Link</h3>
                  <p className="mt-3 text-muted-foreground">
                    Send customers to your review page and start collecting smarter feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why Choose ReviewPlus</h2>
                <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                  Our platform offers powerful features to help you collect and manage reviews effectively.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Smart Routing</h3>
                  <p className="mt-2 text-muted-foreground">
                    Direct satisfied customers to leave positive reviews and capture feedback from others.
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Analytics Dashboard</h3>
                  <p className="mt-2 text-muted-foreground">
                    Track review performance and gain insights to improve your business.
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Custom Branding</h3>
                  <p className="mt-2 text-muted-foreground">
                    Match your review forms to your brand identity for a seamless experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
