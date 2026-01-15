import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | SKOUTEX",
  description: "Terms of Service for SKOUTEX - AI Agents for Football Intelligence. Read our terms and conditions for using our platform.",
};

export default function TermsOfService() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Skoutex
              Technologies S.L. (&quot;SKOUTEX&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company registered in Spain with CIF B24985947.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using our website and services, you agree to be bound by these Terms. If you disagree
              with any part of these Terms, you may not access our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">2. Company Information</h2>
            <div className="bg-[#f6f6f6] rounded-xl p-6">
              <p className="text-gray-600 mb-2"><strong>Company:</strong> Skoutex Technologies S.L.</p>
              <p className="text-gray-600 mb-2"><strong>CIF:</strong> B24985947</p>
              <p className="text-gray-600 mb-2"><strong>Legal Form:</strong> Sociedad Limitada Unipersonal</p>
              <p className="text-gray-600 mb-2"><strong>Activity:</strong> Specialized Design Activities (CNAE 7410)</p>
              <p className="text-gray-600"><strong>Date of Incorporation:</strong> December 16, 2025</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">3. Description of Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              SKOUTEX provides AI-powered football intelligence services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Player analysis and scouting recommendations</li>
              <li>Monte Carlo simulations for transfer decisions</li>
              <li>Contextual fit scoring and market valuations</li>
              <li>Professional reporting and data visualization</li>
              <li>WhatsApp integration for instant analysis</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">4. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information.
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your account information remains accurate and up-to-date</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">5. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You agree not to use our services to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit harmful code or malicious software</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of our services</li>
              <li>Collect or harvest user data without authorization</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All content, features, and functionality of our services, including but not limited to text, graphics,
              logos, icons, images, audio clips, data compilations, software, and the overall design, are the
              exclusive property of SKOUTEX or our licensors and are protected by intellectual property laws.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit
              any of our content without our prior written consent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">7. Data and Analytics</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The data, analytics, and insights provided by SKOUTEX are for informational purposes only. While we
              strive for accuracy, we do not guarantee that our analyses, predictions, or recommendations will be
              error-free or lead to specific outcomes.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You acknowledge that football-related decisions involve inherent risks and that SKOUTEX shall not be
              held liable for any decisions made based on our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">8. Subscription and Payment</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Access to certain features may require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Pay all fees associated with your subscription plan</li>
              <li>Provide valid payment information</li>
              <li>Accept automatic renewal unless cancelled</li>
              <li>Comply with our refund and cancellation policies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To the maximum extent permitted by applicable law, SKOUTEX shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or system failures</li>
              <li>Errors or inaccuracies in content</li>
              <li>Unauthorized access to your data</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">10. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify, defend, and hold harmless SKOUTEX and its officers, directors, employees,
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising
              from your use of our services or violation of these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">11. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account and access to our services immediately, without prior notice
              or liability, for any reason, including breach of these Terms. Upon termination, your right to use our
              services will immediately cease.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">12. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Spain. Any disputes
              arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction
              of the courts of Spain.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">13. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes
              by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of our
              services after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">14. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-[#f6f6f6] rounded-xl p-6">
              <p className="text-gray-600 mb-2"><strong>Email:</strong> legal@skoutex.com</p>
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
