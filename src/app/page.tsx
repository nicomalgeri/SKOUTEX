"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import BookingPopup from "@/components/BookingPopup";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getTranslations, getStoredLanguage, type Language, type Translations } from "@/lib/i18n";

// Logo component using the actual SVG file
function Logo({ className = "", white = false, small = false }: { className?: string; white?: boolean; small?: boolean }) {
  return (
    <div className={className}>
      <Image
        src={white ? "/skoutex-logo.svg" : "/skoutex-logo-blue.svg"}
        alt="SKOUTEX"
        width={small ? 140 : 180}
        height={small ? 54 : 70}
        className={white ? "brightness-0 invert" : ""}
        priority
      />
    </div>
  );
}

// Feature card component with premium styling
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative p-6 md:p-8 bg-white rounded-2xl border border-gray-100 hover:border-[#0031FF]/20 transition-all duration-500 overflow-hidden">
      {/* Premium gradient hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0031FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="w-12 h-12 md:w-14 md:h-14 mb-4 md:mb-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0031FF] to-[#0050FF] flex items-center justify-center text-white shadow-lg shadow-[#0031FF]/20">
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-[#2C2C2C] mb-2 md:mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed text-sm md:text-base">{description}</p>
      </div>
    </div>
  );
}

// Stats component with premium styling
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center group">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#0031FF] to-[#0050FF] bg-clip-text text-transparent mb-2 md:mb-3 group-hover:scale-105 transition-transform duration-300">{value}</div>
      <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider md:tracking-widest font-medium">{label}</div>
    </div>
  );
}

// Trusted by logos placeholder
function TrustedBy() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-16 opacity-40">
      {["Premier League", "La Liga", "Serie A", "Bundesliga", "MENA"].map((league) => (
        <div key={league} className="text-gray-400 font-semibold text-xs sm:text-sm tracking-wider uppercase">
          {league}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [t, setT] = useState<Translations>(getTranslations("en"));
  const [currentLang, setCurrentLang] = useState<Language>("en");

  useEffect(() => {
    const lang = getStoredLanguage();
    setCurrentLang(lang);
    setT(getTranslations(lang));
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  const isRtl = currentLang === "ar";

  return (
    <>
    <BookingPopup isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    <LanguageSwitcher />
    <div className={`min-h-screen bg-white overflow-x-hidden ${isRtl ? "rtl" : "ltr"}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={scrollToTop}
            className="focus:outline-none"
            type="button"
          >
            <Logo small className="md:hidden block" />
            <Logo className="hidden md:block" />
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#features" className="hidden md:inline text-sm text-gray-600 hover:text-[#0031FF] transition-colors font-medium">
              {t.features}
            </a>
            <a href="#how-it-works" className="hidden md:inline text-sm text-gray-600 hover:text-[#0031FF] transition-colors font-medium">
              {t.howItWorks}
            </a>
            <a
              href="/dashboard"
              className="px-3 sm:px-5 py-1.5 sm:py-2 border-2 border-[#0031FF] text-[#0031FF] text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0031FF] hover:text-white transition-all"
            >
              {t.dashboard}
            </a>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#0031FF] text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0028CC] transition-all hover:shadow-lg hover:shadow-[#0031FF]/25"
            >
              {t.requestDemo}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 overflow-hidden">
        {/* Premium background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f6f6f6_1px,transparent_1px),linear-gradient(to_bottom,#f6f6f6_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute top-0 left-0 sm:left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#0031FF]/[0.03] rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute bottom-0 right-0 sm:right-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-[#0031FF]/[0.05] rounded-full blur-[80px] sm:blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 text-center">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#2C2C2C] mb-6 sm:mb-8 leading-[1.1] tracking-tight">
            {t.heroTitle1}
            <br />
            <span className="bg-gradient-to-r from-[#0031FF] via-[#0050FF] to-[#0031FF] bg-clip-text text-transparent">{t.heroTitle2}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light px-2">
            {t.heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-20 px-4 sm:px-0">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="group w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-[#0031FF] text-white text-sm sm:text-base font-semibold rounded-full hover:bg-[#0028CC] transition-all hover:shadow-xl hover:shadow-[#0031FF]/30 flex items-center justify-center gap-2"
            >
              {t.requestDemo}
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-white border-2 border-gray-200 text-[#2C2C2C] text-sm sm:text-base font-semibold rounded-full hover:border-[#0031FF] hover:text-[#0031FF] transition-all text-center"
            >
              {t.exploreFeatures}
            </a>
          </div>

          {/* Hero visual - Premium dashboard mockup */}
          <div className="relative max-w-5xl mx-auto px-2 sm:px-0">
            {/* Glow effect */}
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-[#0031FF]/20 via-[#0050FF]/20 to-[#0031FF]/20 rounded-2xl sm:rounded-[2rem] blur-xl sm:blur-2xl opacity-60" />

            <div className="relative bg-gradient-to-br from-[#0031FF] via-[#0040FF] to-[#0050FF] rounded-2xl sm:rounded-3xl p-0.5 sm:p-1">
              <div className="bg-[#0a0a12] rounded-[0.9rem] sm:rounded-[1.4rem] p-4 sm:p-6 md:p-10">
                {/* Window controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-8">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
                  <span className="ml-2 sm:ml-4 text-white/40 text-xs sm:text-sm font-medium">SKOUTEX AI Agent</span>
                </div>

                {/* Dashboard content - Mobile: 2 cols, Desktop: 4 cols */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                    <div className="text-white/50 text-[10px] sm:text-xs uppercase tracking-wider mb-1 sm:mb-2">Fit Score</div>
                    <div className="text-2xl sm:text-4xl font-bold text-white">94<span className="text-sm sm:text-lg text-white">%</span></div>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                    <div className="text-white/50 text-[10px] sm:text-xs uppercase tracking-wider mb-1 sm:mb-2">Est. Value</div>
                    <div className="text-2xl sm:text-4xl font-bold text-white">€12<span className="text-sm sm:text-lg text-white">M</span></div>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                    <div className="text-white/50 text-[10px] sm:text-xs uppercase tracking-wider mb-1 sm:mb-2">Impact</div>
                    <div className="text-2xl sm:text-4xl font-bold text-green-400">+8<span className="text-sm sm:text-lg">pts</span></div>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                    <div className="text-white/50 text-[10px] sm:text-xs uppercase tracking-wider mb-1 sm:mb-2">Probability</div>
                    <div className="text-2xl sm:text-4xl font-bold text-white">87<span className="text-sm sm:text-lg text-white">%</span></div>
                  </div>
                </div>

                {/* Chart visualization */}
                <div className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-white/60 text-xs sm:text-sm font-medium">Performance Distribution</span>
                    <span className="text-[10px] sm:text-xs text-white/40 hidden sm:inline">1,000+ simulations</span>
                  </div>
                  <div className="flex items-end gap-1 sm:gap-1.5 h-20 sm:h-32">
                    {[15, 25, 40, 60, 80, 95, 100, 90, 70, 50, 35, 20, 12, 8, 5].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[#0031FF] to-[#0050FF] rounded-t-sm transition-all hover:from-[#0050FF] hover:to-[#0070FF]"
                        style={{ height: `${height}%`, opacity: 0.4 + (height / 100) * 0.6 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 sm:py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-gray-400 uppercase tracking-widest mb-6 sm:mb-8 font-medium">{t.designedFor}</p>
          <TrustedBy />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-28 bg-gradient-to-b from-white to-[#f6f6f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 md:gap-16">
            <StatItem value="50K+" label={t.playersIndexed} />
            <StatItem value="1000+" label={t.simulations} />
            <StatItem value="150+" label={t.dataPoints} />
            <StatItem value="<2s" label={t.analysisTime} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-28 bg-[#f6f6f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-xs sm:text-sm font-semibold text-[#0031FF] uppercase tracking-widest mb-3 sm:mb-4">{t.aiPoweredFeatures}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4 sm:mb-6 tracking-tight">
              {t.intelligentAgents}
            </h2>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-light px-2">
              {t.intelligentAgentsDesc}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title={t.conversationalSearch}
              description={t.conversationalSearchDesc}
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title={t.monteCarloSimulations}
              description={t.monteCarloSimulationsDesc}
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title={t.contextualFitScoring}
              description={t.contextualFitScoringDesc}
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              }
              title={t.whatsappIntegration}
              description={t.whatsappIntegrationDesc}
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title={t.marketValueEngine}
              description={t.marketValueEngineDesc}
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title={t.professionalReports}
              description={t.professionalReportsDesc}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-xs sm:text-sm font-semibold text-[#0031FF] uppercase tracking-widest mb-3 sm:mb-4">{t.process}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4 sm:mb-6 tracking-tight">
              {t.howItWorks}
            </h2>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-light">
              {t.howItWorksDesc}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="relative text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0031FF] to-[#0050FF] text-white rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 mx-auto shadow-xl shadow-[#0031FF]/20">
                1
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2C2C] mb-3 sm:mb-4">{t.step1Title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                {t.step1Desc}
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0031FF] to-[#0050FF] text-white rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 mx-auto shadow-xl shadow-[#0031FF]/20">
                2
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2C2C] mb-3 sm:mb-4">{t.step2Title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                {t.step2Desc}
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0031FF] to-[#0050FF] text-white rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 mx-auto shadow-xl shadow-[#0031FF]/20">
                3
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2C2C] mb-3 sm:mb-4">{t.step3Title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 sm:py-28 bg-[#0031FF] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <svg className="w-10 h-10 sm:w-16 sm:h-16 text-white/20 mx-auto mb-6 sm:mb-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-medium mb-6 sm:mb-10 leading-tight tracking-tight">
            {t.fasterDecisions.split(".").map((part, i) => (
              <span key={i}>
                {part.trim()}{i === 0 && "."}<br />
              </span>
            ))}
          </blockquote>
          <p className="text-white/60 text-base sm:text-lg font-light max-w-2xl mx-auto px-2">
            {t.fasterDecisionsDesc}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm font-semibold text-[#0031FF] uppercase tracking-widest mb-3 sm:mb-4">{t.getStarted}</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4 sm:mb-6 tracking-tight">
            {t.readyToDeploy}
          </h2>
          <p className="text-lg sm:text-xl text-gray-500 mb-8 sm:mb-12 max-w-xl mx-auto font-light">
            {t.readyToDeployDesc}
          </p>

          {submitted ? (
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-green-800 mb-2 sm:mb-3">{t.requestReceived}</h3>
              <p className="text-green-600 text-base sm:text-lg">{t.requestReceivedDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder={t.enterWorkEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-[#f6f6f6] border-2 border-transparent rounded-full focus:outline-none focus:border-[#0031FF] focus:bg-white transition-all text-base sm:text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto sm:mx-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#0031FF] text-white font-semibold rounded-full hover:bg-[#0028CC] transition-all hover:shadow-xl hover:shadow-[#0031FF]/30 disabled:opacity-70 disabled:cursor-not-allowed text-base sm:text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  t.requestDemo
                )}
              </button>
            </form>
          )}

          <p className="text-xs sm:text-sm text-gray-400 mt-6 sm:mt-8">
            {t.noCommitment}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-16 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:gap-8 mb-8 sm:mb-12 md:flex-row md:justify-between">
            <Logo white small className="md:hidden" />
            <Logo white className="hidden md:block" />
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                {t.features}
              </a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                {t.howItWorks}
              </a>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                {t.contact}
              </a>
            </div>
            <div className="flex items-center gap-4 sm:gap-5">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
              © 2025 Skoutex Technologies S.L. All rights reserved. CIF: B24985947
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
              <button
                onClick={() => {
                  localStorage.removeItem("cookie_preferences");
                  window.location.reload();
                }}
                className="hover:text-white transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
