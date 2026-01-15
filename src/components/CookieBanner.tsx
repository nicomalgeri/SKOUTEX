"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const savedPreferences = localStorage.getItem("cookie_preferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
      setIsVisible(false);
    } else {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie_preferences", JSON.stringify(prefs));
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setPreferences(prefs);
    setIsVisible(false);
    setShowPreferences(false);

    if (prefs.analytics) {
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      console.log("Marketing enabled");
    }
  };

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const acceptEssential = () => {
    savePreferences({ essential: true, analytics: false, marketing: false });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop for preferences panel */}
      {showPreferences && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
          onClick={() => setShowPreferences(false)}
        />
      )}

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {!showPreferences ? (
            /* Main Banner - Premium Dark Style */
            <div className="relative overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#0031FF]/50 via-white/20 to-[#0031FF]/50 rounded-2xl" />

              <div className="relative bg-[#0a0a12] rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col gap-5">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0031FF] to-[#0050FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#0031FF]/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">We value your privacy</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        We use cookies to enhance your experience and analyze site performance.{" "}
                        <Link href="/cookies" className="text-white hover:text-white/80 underline transition-colors">
                          Learn more
                        </Link>
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={acceptAll}
                      className="flex-1 sm:flex-none px-6 py-3 bg-white text-[#0a0a12] font-semibold rounded-xl hover:bg-white/90 transition-all"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={acceptEssential}
                      className="flex-1 sm:flex-none px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/10"
                    >
                      Essential Only
                    </button>
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="flex-1 sm:flex-none px-6 py-3 text-white/60 font-medium hover:text-white transition-colors"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Preferences Panel - Premium Dark Style */
            <div className="relative overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-br from-[#0031FF] via-white/20 to-[#0031FF]/50 rounded-3xl" />

              <div className="relative bg-[#0a0a12] rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0031FF] to-[#0050FF] rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Cookie Preferences</h3>
                  </div>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-white/40 text-sm mb-6">
                  Manage your cookie preferences. Essential cookies are required for the website to function.
                </p>

                {/* Essential Cookies */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Essential</h4>
                        <p className="text-xs text-green-400 font-medium">Always Active</p>
                      </div>
                    </div>
                    <div className="w-14 h-7 bg-green-500 rounded-full relative cursor-not-allowed">
                      <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>
                  <p className="text-white/40 text-sm">
                    Required for core functionality like security and accessibility.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${preferences.analytics ? "bg-gradient-to-br from-[#0031FF] to-[#0050FF] shadow-[#0031FF]/20" : "bg-white/10"}`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Analytics</h4>
                        <p className="text-xs text-white/40">Optional</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                      className={`w-14 h-7 rounded-full relative transition-colors ${preferences.analytics ? "bg-[#0031FF]" : "bg-white/20"}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${preferences.analytics ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                  <p className="text-white/40 text-sm">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${preferences.marketing ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/20" : "bg-white/10"}`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Marketing</h4>
                        <p className="text-xs text-white/40">Optional</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                      className={`w-14 h-7 rounded-full relative transition-colors ${preferences.marketing ? "bg-purple-500" : "bg-white/20"}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${preferences.marketing ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                  <p className="text-white/40 text-sm">
                    Used to deliver personalized advertisements.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={saveCustomPreferences}
                    className="flex-1 px-6 py-3.5 bg-white text-[#0a0a12] font-semibold rounded-xl hover:bg-white/90 transition-all"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={acceptEssential}
                    className="px-6 py-3.5 text-white/50 font-medium hover:text-white transition-colors"
                  >
                    Reject Optional
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  const openPreferences = () => {
    localStorage.removeItem("cookie_preferences");
    window.location.reload();
  };

  return (
    <button onClick={openPreferences} className={className}>
      Cookie Settings
    </button>
  );
}
