import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | SKOUTEX",
  description: "Privacy Policy for SKOUTEX - AI Agents for Football Intelligence. Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Skoutex Technologies S.L. (hereinafter &quot;SKOUTEX&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), with CIF B24985947,
              is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using our services, you agree to the terms of this Privacy Policy. If you do not agree
              with the terms of this policy, please do not access the site.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">2. Data Controller</h2>
            <div className="bg-[#f6f6f6] rounded-xl p-6">
              <p className="text-gray-600 mb-2"><strong>Company:</strong> Skoutex Technologies S.L.</p>
              <p className="text-gray-600 mb-2"><strong>CIF:</strong> B24985947</p>
              <p className="text-gray-600 mb-2"><strong>Legal Form:</strong> Sociedad Limitada Unipersonal</p>
              <p className="text-gray-600 mb-2"><strong>Date of Incorporation:</strong> December 16, 2025</p>
              <p className="text-gray-600"><strong>Contact:</strong> privacy@skoutex.com</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">3. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We may collect the following types of information:</p>

            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">3.1 Personal Data</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>Company name and job title</li>
              <li>Account credentials</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">3.2 Usage Data</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Pages visited and features used</li>
              <li>Time and date of visits</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">4. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We use the collected information for:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Providing and maintaining our services</li>
              <li>Processing demo requests and inquiries</li>
              <li>Sending promotional communications (with your consent)</li>
              <li>Improving our platform and user experience</li>
              <li>Complying with legal obligations</li>
              <li>Detecting and preventing fraud or abuse</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">5. Legal Basis for Processing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Under the General Data Protection Regulation (GDPR), we process your personal data based on:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Consent:</strong> When you have given explicit consent for specific purposes</li>
              <li><strong>Contract:</strong> When processing is necessary to fulfill our contractual obligations</li>
              <li><strong>Legitimate Interest:</strong> When we have a legitimate business interest that does not override your rights</li>
              <li><strong>Legal Obligation:</strong> When we are required to process data by law</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">6. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do not sell your personal data. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Service providers who assist in our operations</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this
              policy, unless a longer retention period is required or permitted by law. When data is no longer needed,
              we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">8. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Under GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@skoutex.com.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">9. Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over
              the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">10. International Transfers</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data may be transferred to and processed in countries outside the European Economic Area (EEA).
              When such transfers occur, we ensure appropriate safeguards are in place, such as Standard Contractual
              Clauses approved by the European Commission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
              new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy
              periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
