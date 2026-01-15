"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clubName: "",
    role: "sporting_director",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            club_name: formData.clubName,
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <Link href="/">
              <Image
                src="/skoutex-logo.svg"
                alt="SKOUTEX"
                width={180}
                height={60}
                className="mx-auto brightness-0 invert"
                priority
              />
            </Link>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-gray-400 mb-6">
              We&apos;ve sent a confirmation link to <span className="text-white">{formData.email}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Click the link in your email to verify your account and start using SKOUTEX.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-block mt-6 text-[#0031FF] hover:text-[#0050FF] font-medium transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/skoutex-logo.svg"
              alt="SKOUTEX"
              width={180}
              height={60}
              className="mx-auto brightness-0 invert"
              priority
            />
          </Link>
          <p className="text-gray-400 mt-4 text-sm">
            AI Agents for Football Intelligence
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm mb-8">
            Start your journey with SKOUTEX
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0031FF] focus:ring-1 focus:ring-[#0031FF] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Club / Organisation
              </label>
              <input
                type="text"
                name="clubName"
                value={formData.clubName}
                onChange={handleChange}
                placeholder="FC Example"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0031FF] focus:ring-1 focus:ring-[#0031FF] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#0031FF] focus:ring-1 focus:ring-[#0031FF] transition-all"
              >
                <option value="sporting_director">Sporting Director</option>
                <option value="scout">Scout</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Club Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Work email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@club.com"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0031FF] focus:ring-1 focus:ring-[#0031FF] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0031FF] focus:ring-1 focus:ring-[#0031FF] transition-all"
              />
              <p className="text-gray-500 text-xs mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0031FF] focus:ring-1 focus:ring-[#0031FF] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#222222] text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#0031FF] hover:text-[#0050FF] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
