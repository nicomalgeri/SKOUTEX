"use client";

import { useState } from "react";
import Image from "next/image";

interface BookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  company: string;
  email: string;
  date: string;
  time: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  date?: string;
  time?: string;
}

type Step = "details" | "datetime" | "confirm" | "success";

const initialFormData: FormData = {
  name: "",
  company: "",
  email: "",
  date: "",
  time: "",
};

// Available time slots (9 AM to 6 PM, 30-minute intervals)
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function BookingPopup({ isOpen, onClose }: BookingPopupProps) {
  const [step, setStep] = useState<Step>("details");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Generate next 14 weekdays for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 21 && dates.length < 9; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      dates.push({
        value: date.toISOString().split("T")[0],
        display: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return dates;
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const validateDetails = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name is required";
    }
    if (!formData.company) {
      newErrors.company = "Club or Organisation is required";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDateTime = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.date) {
      newErrors.date = "Please select a date";
    }
    if (!formData.time) {
      newErrors.time = "Please select a time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === "details" && validateDetails()) {
      setStep("datetime");
    } else if (step === "datetime" && validateDateTime()) {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "datetime") setStep("details");
    else if (step === "confirm") setStep("datetime");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/request-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("success");
      } else {
        throw new Error(data.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Request error:", error);
      setSubmitError("Something went wrong. Please try again or contact team@skoutex.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setStep("details");
    setSubmitError("");
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  const getSelectedDateDisplay = () => {
    if (!formData.date) return "";
    const date = new Date(formData.date + "T12:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSelectedTimeDisplay = () => {
    if (!formData.time) return "";
    return formatTimeDisplay(formData.time);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[1000] transition-opacity"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="px-10 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/skoutex-logo-blue.svg"
                  alt="SKOUTEX"
                  width={150}
                  height={58}
                  priority
                />
              </div>
              <h2 className="text-[26px] font-bold text-[#2C2C2C] mb-2">
                {step === "success" ? "Request Sent!" : "Request a Demo"}
              </h2>
              {step !== "success" && (
                <p className="text-gray-400 text-[15px]">
                  {step === "details" && "Tell us about yourself"}
                  {step === "datetime" && "Choose your preferred time"}
                  {step === "confirm" && "Review and submit your request"}
                </p>
              )}
            </div>

            {/* Step Indicator */}
            {step !== "success" && (
              <div className="flex items-center justify-center gap-2 mb-8">
                {["details", "datetime", "confirm"].map((s, i) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all ${
                      step === s
                        ? "w-6 bg-[#0031FF]"
                        : ["details", "datetime", "confirm"].indexOf(step) > i
                        ? "bg-[#0031FF]"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Step: Details */}
            {step === "details" && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={`w-full px-5 py-4 bg-[#f8f8f8] border ${
                      errors.name ? "border-red-400" : "border-transparent"
                    } rounded-2xl text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-base`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-2">{errors.name}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Club or Organisation"
                    className={`w-full px-5 py-4 bg-[#f8f8f8] border ${
                      errors.company ? "border-red-400" : "border-transparent"
                    } rounded-2xl text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-base`}
                  />
                  {errors.company && <p className="text-red-500 text-xs mt-1.5 ml-2">{errors.company}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className={`w-full px-5 py-4 bg-[#f8f8f8] border ${
                      errors.email ? "border-red-400" : "border-transparent"
                    } rounded-2xl text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-base`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-2">{errors.email}</p>}
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full py-4 bg-[#2C2C2C] text-white font-semibold rounded-2xl hover:bg-[#1a1a1a] transition-all mt-4 text-[15px]"
                >
                  Continue
                </button>

                <p className="text-center text-gray-400 text-[12px] mt-4">
                  By continuing, you agree to our{" "}
                  <a href="/privacy" className="text-[#2C2C2C] underline hover:no-underline" target="_blank">
                    Privacy Policy
                  </a>
                </p>
              </div>
            )}

            {/* Step: Date & Time */}
            {step === "datetime" && (
              <div className="flex flex-col" style={{ maxHeight: "calc(80vh - 200px)" }}>
                <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#2C2C2C] mb-3">Select a date</label>
                    <div className="grid grid-cols-3 gap-2">
                      {getAvailableDates().map((date) => (
                        <button
                          key={date.value}
                          onClick={() => setFormData((prev) => ({ ...prev, date: date.value }))}
                          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            formData.date === date.value
                              ? "bg-[#2C2C2C] text-white"
                              : "bg-[#f8f8f8] text-[#2C2C2C] hover:bg-gray-200"
                          }`}
                        >
                          {date.display}
                        </button>
                      ))}
                    </div>
                    {errors.date && <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>}
                  </div>

                  {/* Time Selection */}
                  {formData.date && (
                    <div>
                      <label className="block text-sm font-medium text-[#2C2C2C] mb-3">Select a time (Europe/Madrid)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.slice(0, 9).map((time) => (
                          <button
                            key={time}
                            onClick={() => setFormData((prev) => ({ ...prev, time }))}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              formData.time === time
                                ? "bg-[#0031FF] text-white"
                                : "bg-[#f8f8f8] text-[#2C2C2C] hover:bg-gray-200"
                            }`}
                          >
                            {formatTimeDisplay(time)}
                          </button>
                        ))}
                      </div>
                      {errors.time && <p className="text-red-500 text-xs mt-1.5">{errors.time}</p>}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-5 flex-shrink-0">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-4 bg-[#f8f8f8] text-[#2C2C2C] font-semibold rounded-2xl hover:bg-gray-200 transition-all text-[15px]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={!formData.date || !formData.time}
                    className="flex-1 py-4 bg-[#2C2C2C] text-white font-semibold rounded-2xl hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === "confirm" && (
              <div className="space-y-6">
                <div className="bg-[#f8f8f8] rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="text-[#2C2C2C] font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organisation</span>
                    <span className="text-[#2C2C2C] font-medium">{formData.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-[#2C2C2C] font-medium">{formData.email}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="text-[#2C2C2C] font-medium">{getSelectedDateDisplay()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="text-[#2C2C2C] font-medium">{getSelectedTimeDisplay()} (Europe/Madrid)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-[#2C2C2C] font-medium">25 minutes</span>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-4 bg-[#f8f8f8] text-[#2C2C2C] font-semibold rounded-2xl hover:bg-gray-200 transition-all text-[15px]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-[#0031FF] text-white font-semibold rounded-2xl hover:bg-[#0028cc] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Request"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {step === "success" && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <p className="text-gray-500 text-[15px] mb-4">
                  Thanks for your interest, <span className="text-[#2C2C2C] font-semibold">{formData.name}</span>!
                </p>

                <p className="text-gray-400 text-[14px] mb-2">
                  Your demo request for
                </p>
                <p className="text-[#2C2C2C] font-semibold text-[15px] mb-1">
                  {getSelectedDateDisplay()}
                </p>
                <p className="text-[#2C2C2C] font-semibold text-[15px] mb-6">
                  at {getSelectedTimeDisplay()} (Europe/Madrid)
                </p>

                <p className="text-gray-400 text-[14px] mb-8">
                  has been sent to our team. We&apos;ll confirm your booking at <span className="text-[#2C2C2C]">{formData.email}</span> shortly.
                </p>

                <button
                  onClick={handleClose}
                  className="w-full py-4 bg-[#2C2C2C] text-white font-semibold rounded-2xl hover:bg-[#1a1a1a] transition-all text-[15px]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
