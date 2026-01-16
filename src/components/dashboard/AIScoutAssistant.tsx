/**
 * AI Scout Assistant CTA Module
 * Premium call-to-action for the AI chat feature
 */

"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AIScoutAssistantProps {
  className?: string;
}

export function AIScoutAssistant({ className = "" }: AIScoutAssistantProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={`mb-12 ${className}`}>
      <Link href="/dashboard/chat">
        <div
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-8 text-center cursor-pointer group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background decoration - animated grid */}
          <div className="absolute inset-0 opacity-10">
            <div
              className={`w-full h-full transition-transform duration-1000 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Floating sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white rounded-full transition-all duration-1000 ${
                  isHovered ? "opacity-100" : "opacity-40"
                }`}
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  animationDelay: `${i * 200}ms`,
                  transform: isHovered ? `translateY(-${i * 2}px)` : "translateY(0)",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div
              className={`inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 transition-transform duration-300 ${
                isHovered ? "scale-110 rotate-12" : "scale-100 rotate-0"
              }`}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            {/* Headline */}
            <h3 className="text-xl font-semibold text-white mb-2">
              Need player recommendations?
            </h3>

            {/* Body */}
            <p className="text-blue-100 mb-6 max-w-md mx-auto leading-relaxed">
              Get intelligent, data-driven suggestions from our AI Scout Assistant.
              Ask about tactics, compare players, or discover hidden gems.
            </p>

            {/* CTA Button */}
            <button
              className={`
                px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold
                shadow-lg shadow-blue-900/20
                transition-all duration-200
                ${
                  isHovered
                    ? "transform scale-105 shadow-xl shadow-blue-900/30"
                    : "scale-100"
                }
              `}
            >
              Open Scout Assistant
            </button>

            {/* Hint text */}
            <p className="mt-4 text-xs text-blue-200">
              ✨ Powered by GPT-4 • Context-aware • Real-time insights
            </p>
          </div>

          {/* Gradient overlay on hover */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-t from-blue-700/20 to-transparent
              transition-opacity duration-300
              ${isHovered ? "opacity-100" : "opacity-0"}
            `}
          />
        </div>
      </Link>
    </section>
  );
}
