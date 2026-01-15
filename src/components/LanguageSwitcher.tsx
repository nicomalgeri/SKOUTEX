"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Language } from "@/lib/i18n";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "ar", label: "AR" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("skoutex-language") as Language;
    if (saved && ["en", "es", "ar"].includes(saved)) {
      setCurrentLang(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const changeLang = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem("skoutex-language", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="fixed left-4 bottom-8 z-[100]">
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[120px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-left transition-all ${
                currentLang === lang.code
                  ? "bg-[#0031FF]/10 text-[#0031FF]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#2C2C2C]"
              }`}
            >
              <span className="font-semibold text-sm">{lang.label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:border-[#0031FF] hover:shadow-xl transition-all"
      >
        <Image
          src="/language-switcher.svg"
          alt="Language"
          width={24}
          height={24}
          className="opacity-70"
        />
      </button>
    </div>
  );
}
