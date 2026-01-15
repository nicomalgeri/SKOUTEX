"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Header from "@/components/dashboard/Header";
import { useAppStore } from "@/lib/store";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Check,
  Globe,
  Camera,
  X,
} from "lucide-react";

type Tab = "profile" | "notifications" | "security" | "preferences";

export default function SettingsPage() {
  const { language, setLanguage } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "John Smith",
    email: "john@club.com",
    role: "Sporting Director",
    phone: "+34 123 456 789",
    timezone: "Europe/Madrid",
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePhoto(event.target?.result as string);
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: true,
    playerUpdates: true,
    marketAlerts: false,
    whatsappEnabled: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    { id: "preferences", label: "Preferences", icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <>
      <Header title="Settings" subtitle="Manage your account preferences" />

      <div className="p-3 sm:p-4 lg:p-6 w-full max-w-[100vw] lg:max-w-none overflow-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl p-1 mb-6 overflow-x-auto bg-white border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#0031FF] text-white"
                    : "text-gray-600 hover:text-[#2C2C2C] hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="rounded-2xl p-4 sm:p-6 space-y-6 bg-white border border-gray-200">
              <h2 className="text-lg font-semibold text-[#2C2C2C]">Personal Information</h2>

              <div className="flex items-center gap-6 mb-6">
                <div className="relative group">
                  {profilePhoto ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden relative">
                      <Image
                        src={profilePhoto}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={removePhoto}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0031FF] to-[#0050FF] flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {profile.name[0]}
                      </span>
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <label
                    htmlFor="profile-photo-upload"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer bg-gray-100 text-[#2C2C2C] hover:bg-gray-200"
                  >
                    <Camera className="w-4 h-4" />
                    {profilePhoto ? "Change Photo" : "Upload Photo"}
                  </label>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-[#0031FF] bg-[#f6f6f6] border border-gray-200 text-[#2C2C2C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-[#0031FF] bg-[#f6f6f6] border border-gray-200 text-[#2C2C2C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full px-4 py-3 rounded-xl cursor-not-allowed bg-gray-100 border border-gray-200 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-[#0031FF] bg-[#f6f6f6] border border-gray-200 text-[#2C2C2C]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="rounded-2xl p-4 sm:p-6 space-y-6 bg-white border border-gray-200">
              <h2 className="text-lg font-semibold text-[#2C2C2C]">Notification Preferences</h2>

              <div className="space-y-4">
                <ToggleOption
                  label="Email Alerts"
                  description="Receive important updates via email"
                  enabled={notifications.emailAlerts}
                  onChange={(v) => setNotifications({ ...notifications, emailAlerts: v })}
                />
                <ToggleOption
                  label="Push Notifications"
                  description="Browser notifications for real-time updates"
                  enabled={notifications.pushNotifications}
                  onChange={(v) => setNotifications({ ...notifications, pushNotifications: v })}
                />
                <ToggleOption
                  label="Weekly Digest"
                  description="Summary of activity every Monday"
                  enabled={notifications.weeklyDigest}
                  onChange={(v) => setNotifications({ ...notifications, weeklyDigest: v })}
                />
                <ToggleOption
                  label="Player Updates"
                  description="Alerts when watchlist players have updates"
                  enabled={notifications.playerUpdates}
                  onChange={(v) => setNotifications({ ...notifications, playerUpdates: v })}
                />
                <ToggleOption
                  label="Market Alerts"
                  description="Notifications about market value changes"
                  enabled={notifications.marketAlerts}
                  onChange={(v) => setNotifications({ ...notifications, marketAlerts: v })}
                />
                <ToggleOption
                  label="WhatsApp Integration"
                  description="Receive analysis via WhatsApp bot"
                  enabled={notifications.whatsappEnabled}
                  onChange={(v) => setNotifications({ ...notifications, whatsappEnabled: v })}
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="rounded-2xl p-4 sm:p-6 space-y-6 bg-white border border-gray-200">
              <h2 className="text-lg font-semibold text-[#2C2C2C]">Security Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4 text-gray-500">Change Password</h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-[#0031FF] bg-[#f6f6f6] border border-gray-200 text-[#2C2C2C]"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-[#0031FF] bg-[#f6f6f6] border border-gray-200 text-[#2C2C2C]"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-[#0031FF] bg-[#f6f6f6] border border-gray-200 text-[#2C2C2C]"
                    />
                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all bg-gray-100 text-[#2C2C2C] hover:bg-gray-200">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-4 text-gray-500">Two-Factor Authentication</h3>
                  <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0031FF] text-white font-medium rounded-xl hover:bg-[#0028CC] transition-all">
                    Enable 2FA
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-4 text-gray-500">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#f6f6f6]">
                      <div>
                        <p className="font-medium text-[#2C2C2C]">Current Session</p>
                        <p className="text-sm text-gray-500">MacBook Pro - Madrid, Spain</p>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="rounded-2xl p-4 sm:p-6 space-y-6 bg-white border border-gray-200">
              <h2 className="text-lg font-semibold text-[#2C2C2C]">App Preferences</h2>

              {/* Language Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-500">
                  <Globe className="w-4 h-4" />
                  Language
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      language === "en"
                        ? "bg-[#0031FF]/10 border-[#0031FF] text-[#2C2C2C]"
                        : "bg-[#f6f6f6] border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">🇬🇧</span>
                    <span className="text-xs sm:text-sm font-medium">English</span>
                  </button>
                  <button
                    onClick={() => setLanguage("es")}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      language === "es"
                        ? "bg-[#0031FF]/10 border-[#0031FF] text-[#2C2C2C]"
                        : "bg-[#f6f6f6] border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">🇪🇸</span>
                    <span className="text-xs sm:text-sm font-medium">Espanol</span>
                  </button>
                  <button
                    onClick={() => setLanguage("ar")}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      language === "ar"
                        ? "bg-[#0031FF]/10 border-[#0031FF] text-[#2C2C2C]"
                        : "bg-[#f6f6f6] border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">🇸🇦</span>
                    <span className="text-xs sm:text-sm font-medium">العربية</span>
                  </button>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">
                  Timezone
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-[#0031FF] bg-[#f6f6f6] border border-gray-200 text-[#2C2C2C]"
                >
                  <option value="Europe/Madrid">Europe/Madrid (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>

              {/* Data Display */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-500">
                  Data Display
                </label>
                <div className="space-y-4">
                  <ToggleOption
                    label="Compact Tables"
                    description="Show more data in tables with less spacing"
                    enabled={false}
                    onChange={() => {}}
                  />
                  <ToggleOption
                    label="Show Player Photos"
                    description="Display player photos in search results"
                    enabled={true}
                    onChange={() => {}}
                  />
                  <ToggleOption
                    label="Auto-refresh Data"
                    description="Automatically refresh player data every 5 minutes"
                    enabled={true}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028CC] transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ToggleOption({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#f6f6f6]">
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-sm sm:text-base text-[#2C2C2C]">{label}</p>
        <p className="text-xs sm:text-sm text-gray-500 truncate">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-all flex-shrink-0 ${
          enabled ? "bg-[#0031FF]" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white transition-all ${
            enabled ? "translate-x-5 sm:translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
