import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | ReviewPlus',
  description: 'Learn more about our review system and our mission to provide authentic user reviews.',
}

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="prose prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p>
            We are dedicated to providing a platform where users can share authentic experiences
            and help others make informed decisions. Our review system is designed to be transparent,
            reliable, and user-friendly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
          <p>
            Our platform facilitates the collection and sharing of user reviews, enabling:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Authentic user experiences and feedback</li>
            <li>Transparent review processes</li>
            <li>Easy-to-use review submission</li>
            <li>Real-time review updates</li>
            <li>Secure data handling</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p>We believe in clear and honest communication with our users.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Reliability</h3>
              <p>We ensure the accuracy and authenticity of all reviews.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">User Privacy</h3>
              <p>We prioritize the protection of user data and privacy.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p>We continuously improve our platform to better serve our users.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            We'd love to hear from you! Whether you have questions, suggestions, or feedback,
            our team is here to help.
          </p>
          <div className="mt-4">
            <p>Email: contact@reviewsystem.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: 123 Review Street, Tech City, TC 12345</p>
          </div>
        </section>
      </div>
    </div>
  )
} 