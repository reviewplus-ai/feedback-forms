import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | ReviewPlus',
  description: 'Our terms of service outline the rules and guidelines for using our review system.',
}

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using our review system, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms, you
            are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p>Permission is granted to temporarily access the review system for personal, non-commercial use only. This license does not include:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose</li>
            <li>Attempting to reverse engineer any software contained on the site</li>
            <li>Removing any copyright or other proprietary notations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p>As a user of our review system, you agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate and truthful information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Not engage in any fraudulent or deceptive practices</li>
            <li>Respect the rights of other users</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content Guidelines</h2>
          <p>All reviews and content posted must:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Be truthful and based on personal experience</li>
            <li>Not contain offensive or inappropriate language</li>
            <li>Not violate any third-party rights</li>
            <li>Not contain spam or promotional content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Disclaimer</h2>
          <p>
            The materials on our review system are provided on an 'as is' basis. We make no
            warranties, expressed or implied, and hereby disclaim and negate all other warranties
            including, without limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of intellectual property.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
            <br />
            Email: legal@reviewsystem.com
          </p>
        </section>
      </div>
    </div>
  )
} 