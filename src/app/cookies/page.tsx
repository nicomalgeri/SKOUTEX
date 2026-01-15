import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | SKOUTEX",
  description: "Cookie Policy for SKOUTEX - AI Agents for Football Intelligence. Learn about how we use cookies and similar technologies.",
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#0a0a0a] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-white/80 text-sm font-medium mb-6 px-4 py-2 bg-white/10 rounded-full transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-gray-400">Last updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you
              visit a website. They are widely used to make websites work more efficiently, provide a better user
              experience, and give website owners information about how their site is being used.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This Cookie Policy explains how Skoutex Technologies S.L. (&quot;SKOUTEX&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses
              cookies and similar technologies on our website.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">2. Types of Cookies We Use</h2>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">2.1 Essential Cookies</h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                <p className="text-green-800 font-medium mb-2">Always Active</p>
                <p className="text-gray-600">
                  These cookies are necessary for the website to function properly. They enable core functionality
                  such as security, network management, and accessibility. You cannot opt out of these cookies.
                </p>
              </div>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#f6f6f6]">
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Cookie Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Purpose</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">cookie_consent</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Stores your cookie preferences</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">session_id</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Maintains user session</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">2.2 Analytics Cookies</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                <p className="text-blue-800 font-medium mb-2">Optional - Requires Consent</p>
                <p className="text-gray-600">
                  These cookies help us understand how visitors interact with our website by collecting and reporting
                  information anonymously. This helps us improve our website and services.
                </p>
              </div>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#f6f6f6]">
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Cookie Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Purpose</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">_ga</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Google Analytics - Distinguishes users</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">_ga_*</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Google Analytics - Maintains session state</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">2.3 Marketing Cookies</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-4">
                <p className="text-purple-800 font-medium mb-2">Optional - Requires Consent</p>
                <p className="text-gray-600">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                  They help measure the effectiveness of advertising campaigns.
                </p>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f6f6f6]">
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Cookie Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Purpose</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C]">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">_fbp</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Facebook Pixel - Tracks conversions</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">3 months</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">li_sugr</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">LinkedIn - Browser identifier</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">3 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">3. How to Manage Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You can manage your cookie preferences at any time by clicking the &quot;Cookie Settings&quot; link in the
              footer of our website. You can also control cookies through your browser settings:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              Please note that disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Some cookies on our website are set by third-party services. We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Vercel:</strong> For website hosting and performance optimization</li>
              <li><strong>LinkedIn:</strong> For professional networking and marketing</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">5. Updates to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other
              operational, legal, or regulatory reasons. Please revisit this page periodically to stay informed
              about our use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">6. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="bg-[#f6f6f6] rounded-xl p-6">
              <p className="text-gray-600 mb-2"><strong>Email:</strong> privacy@skoutex.com</p>
              <p className="text-gray-600 mb-2"><strong>Company:</strong> Skoutex Technologies S.L.</p>
              <p className="text-gray-600"><strong>CIF:</strong> B24985947</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f6f6f6] py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Skoutex Technologies S.L. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
