"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, User, Bell, Shield, Palette, Globe, CreditCard, 
  Key, Mail, Smartphone, Save, Camera, Check, X, Loader2,
  Moon, Sun, Monitor, Upload, Trash2, AlertTriangle, ChevronRight
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

type SettingsTab = "company" | "profile" | "notifications" | "security" | "appearance" | "billing" | "integrations"

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: Globe },
]

const DEFAULT_ACCESS_ROLES = ["EMPLOYEE", "SALES", "TECH", "MARKETING"]

type AccessCategory = {
  id: string
  name: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>("company")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Company settings state
  const [companyName, setCompanyName] = useState("Acme Corporation")
  const [companyEmail, setCompanyEmail] = useState("admin@acme.com")
  const [companyWebsite, setCompanyWebsite] = useState("https://acme.com")
  const [timezone, setTimezone] = useState("Asia/Kolkata")

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailOnNewUser: true,
    emailOnCompletion: true,
    emailWeeklySummary: false,
    pushOnComment: true,
    pushOnMention: true,
  })

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [accentColor, setAccentColor] = useState("#FF6B35")

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [accessCategories, setAccessCategories] = useState<AccessCategory[]>([])
  const [roleDefaults, setRoleDefaults] = useState<Record<string, string[]>>({})
  const [savingRoleKey, setSavingRoleKey] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.orgId) return
    const loadRoleDefaults = async () => {
      try {
        const res = await fetch(`/api/role-default-access?orgId=${encodeURIComponent(user.orgId)}`)
        if (!res.ok) throw new Error("Failed to load role defaults")
        const data = await res.json()
        setAccessCategories((data.categories || []).map((c: any) => ({ id: c.id, name: c.name })))
        setRoleDefaults(data.mappings || {})
      } catch {
        // keep settings usable even if migration is not applied yet
      }
    }
    void loadRoleDefaults()
  }, [user?.orgId])

  const toggleRoleCategory = async (roleKey: string, categoryId: string) => {
    if (!user?.orgId) return
    const existing = roleDefaults[roleKey] || []
    const next = existing.includes(categoryId)
      ? existing.filter((id) => id !== categoryId)
      : [...existing, categoryId]

    setRoleDefaults((prev) => ({ ...prev, [roleKey]: next }))
    setSavingRoleKey(roleKey)
    try {
      const res = await fetch("/api/role-default-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: user.orgId,
          roleKey,
          categoryIds: next,
        }),
      })
      if (!res.ok) throw new Error("Failed to save role defaults")
      toast.success(`Updated default categories for ${roleKey}`)
    } catch {
      toast.error("Could not save role defaults")
      setRoleDefaults((prev) => ({ ...prev, [roleKey]: existing }))
    } finally {
      setSavingRoleKey(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "company":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-1">Company Information</h3>
              <p className="text-sm text-[#78716C]">Update your company details and preferences</p>
            </div>

            {/* Company Logo */}
            <div className="flex items-start gap-6 p-6 bg-[#F9FAFB] rounded-2xl">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#C8A96E] flex items-center justify-center text-white text-2xl font-bold">
                  AC
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-[#E7E5E4] hover:bg-[#F5F5F4] transition-colors">
                  <Camera size={14} className="text-[#78716C]" />
                </button>
              </div>
              <div>
                <h4 className="font-medium text-[#1C1917]">Company Logo</h4>
                <p className="text-sm text-[#78716C] mt-1">PNG, JPG up to 2MB. Recommended 200x200px</p>
                <button className="mt-3 text-sm text-[#FF6B35] font-medium hover:underline">
                  Upload new logo
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Admin Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Website</label>
                <input
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] transition-colors"
                >
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="America/New_York">US Eastern</option>
                  <option value="America/Los_Angeles">US Pacific</option>
                  <option value="Europe/London">UK (GMT)</option>
                </select>
              </div>
            </div>

            {/* Default Language */}
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-2">Default Language</label>
              <select className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] transition-colors">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>

            {/* AI Settings */}
            <div className="p-6 bg-gradient-to-r from-[#FF6B35]/5 to-[#C8A96E]/5 rounded-2xl border border-[#FF6B35]/20">
              <h4 className="font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
                <Key size={18} className="text-[#FF6B35]" />
                AI Search Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1C1917]">Enable AI Search</p>
                    <p className="text-sm text-[#78716C]">Allow employees to search using AI</p>
                  </div>
                  <ToggleSwitch defaultChecked />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-2">AI Model</label>
                  <select className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] transition-colors">
                    <option>GPT-4 (Recommended)</option>
                    <option>GPT-3.5 Turbo</option>
                    <option>Claude 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-2">Response Style</label>
                  <select className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] transition-colors">
                    <option>Concise</option>
                    <option>Detailed</option>
                    <option>Step-by-step</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Role-based default category access */}
            <div className="p-6 bg-white rounded-2xl border border-[#E7E5E4]">
              <h4 className="font-semibold text-[#1C1917] mb-2">Default Category Access by Role</h4>
              <p className="text-sm text-[#78716C] mb-4">
                New users automatically get access to categories selected for their role or department key.
              </p>
              {accessCategories.length === 0 ? (
                <p className="text-sm text-[#A8A29E]">
                  No categories available yet. Create categories first, then map defaults here.
                </p>
              ) : (
                <div className="space-y-4">
                  {DEFAULT_ACCESS_ROLES.map((roleKey) => (
                    <div key={roleKey} className="rounded-xl border border-[#E7E5E4] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-medium text-[#1C1917]">{roleKey}</p>
                        {savingRoleKey === roleKey && (
                          <span className="text-xs text-[#78716C]">Saving...</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {accessCategories.map((category) => {
                          const selected = (roleDefaults[roleKey] || []).includes(category.id)
                          return (
                            <button
                              key={`${roleKey}-${category.id}`}
                              type="button"
                              onClick={() => void toggleRoleCategory(roleKey, category.id)}
                              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                selected
                                  ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#C2410C]"
                                  : "border-[#E7E5E4] bg-white text-[#78716C] hover:border-[#FF6B35]/30"
                              }`}
                            >
                              {category.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-1">Personal Profile</h3>
              <p className="text-sm text-[#78716C]">Update your personal information</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-6 p-6 bg-[#F9FAFB] rounded-2xl">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#C8A96E]" />
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-[#E7E5E4]">
                  <Camera size={16} className="text-[#78716C]" />
                </button>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C1917]">Admin User</h4>
                <p className="text-sm text-[#78716C]">admin@acme.com</p>
                <button className="mt-2 text-sm text-[#FF6B35] font-medium hover:underline">
                  Change photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="Admin"
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="User"
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="admin@acme.com"
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-2">Bio</label>
              <textarea
                rows={3}
                defaultValue="Platform administrator"
                className="w-full px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35] resize-none"
              />
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-1">Notification Preferences</h3>
              <p className="text-sm text-[#78716C]">Choose how you want to be notified</p>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden">
              <div className="p-4 bg-[#F9FAFB] border-b border-[#E7E5E4]">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-[#FF6B35]" />
                  <h4 className="font-semibold text-[#1C1917]">Email Notifications</h4>
                </div>
              </div>
              <div className="divide-y divide-[#E7E5E4]">
                <NotificationRow
                  title="New User Registration"
                  description="Get notified when a new user signs up"
                  checked={notifications.emailOnNewUser}
                  onChange={(checked) => setNotifications({ ...notifications, emailOnNewUser: checked })}
                />
                <NotificationRow
                  title="Course Completions"
                  description="Receive alerts when users complete training"
                  checked={notifications.emailOnCompletion}
                  onChange={(checked) => setNotifications({ ...notifications, emailOnCompletion: checked })}
                />
                <NotificationRow
                  title="Weekly Summary"
                  description="Get a weekly report of platform activity"
                  checked={notifications.emailWeeklySummary}
                  onChange={(checked) => setNotifications({ ...notifications, emailWeeklySummary: checked })}
                />
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden">
              <div className="p-4 bg-[#F9FAFB] border-b border-[#E7E5E4]">
                <div className="flex items-center gap-2">
                  <Smartphone size={18} className="text-[#FF6B35]" />
                  <h4 className="font-semibold text-[#1C1917]">Push Notifications</h4>
                </div>
              </div>
              <div className="divide-y divide-[#E7E5E4]">
                <NotificationRow
                  title="Comments"
                  description="When someone comments on your content"
                  checked={notifications.pushOnComment}
                  onChange={(checked) => setNotifications({ ...notifications, pushOnComment: checked })}
                />
                <NotificationRow
                  title="Mentions"
                  description="When someone mentions you"
                  checked={notifications.pushOnMention}
                  onChange={(checked) => setNotifications({ ...notifications, pushOnMention: checked })}
                />
              </div>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-1">Security Settings</h3>
              <p className="text-sm text-[#78716C]">Manage your account security</p>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
              <h4 className="font-semibold text-[#1C1917] mb-4">Change Password</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <button className="px-5 py-2.5 bg-[#1C1917] text-white font-medium rounded-xl hover:bg-[#2C2723] transition-colors">
                  Update Password
                </button>
              </div>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#1C1917]">Two-Factor Authentication</h4>
                  <p className="text-sm text-[#78716C] mt-1">Add an extra layer of security to your account</p>
                </div>
                <ToggleSwitch 
                  checked={twoFactorEnabled} 
                  onChange={setTwoFactorEnabled} 
                />
              </div>
            </div>

            {/* Session Timeout */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
              <h4 className="font-semibold text-[#1C1917] mb-4">Session Settings</h4>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">Auto Logout After</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="15">15 minutes of inactivity</option>
                  <option value="30">30 minutes of inactivity</option>
                  <option value="60">1 hour of inactivity</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-red-600" />
                <h4 className="font-semibold text-red-900">Danger Zone</h4>
              </div>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-1">Appearance</h3>
              <p className="text-sm text-[#78716C]">Customize how Arambh looks for you</p>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-4">Theme</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as typeof theme)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      theme === t.id
                        ? "border-[#FF6B35] bg-[#FF6B35]/5"
                        : "border-[#E7E5E4] hover:border-[#FF6B35]/30"
                    }`}
                  >
                    <t.icon size={32} className={theme === t.id ? "text-[#FF6B35]" : "text-[#78716C]"} />
                    <span className={`font-medium ${theme === t.id ? "text-[#FF6B35]" : "text-[#1C1917]"}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-4">Accent Color</label>
              <div className="flex items-center gap-3">
                {["#FF6B35", "#6366F1", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-10 h-10 rounded-full transition-transform ${
                      accentColor === color ? "ring-2 ring-offset-2 ring-[#1C1917] scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-[#E7E5E4]">
              <h4 className="font-semibold text-[#1C1917] mb-4">Preview</h4>
              <div className="bg-white rounded-xl p-4 border border-[#E7E5E4]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: accentColor }} />
                  <div>
                    <div className="font-medium text-[#1C1917]">Sample Lesson</div>
                    <div className="text-sm text-[#78716C]">This is how content will look</div>
                  </div>
                </div>
                <button
                  className="w-full py-2.5 text-white font-medium rounded-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  Primary Button
                </button>
              </div>
            </div>
          </div>
        )

      case "billing":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-1">Billing & Plans</h3>
              <p className="text-sm text-[#78716C]">Manage your subscription and billing</p>
            </div>

            {/* Current Plan */}
            <div className="bg-gradient-to-r from-[#FF6B35] to-[#C8A96E] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm opacity-80">Current Plan</span>
                  <h4 className="text-2xl font-bold mt-1">Professional</h4>
                  <p className="text-sm opacity-80 mt-2">50 users | Unlimited lessons | AI Search</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-sm opacity-80">/month</span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button className="px-5 py-2.5 bg-white text-[#FF6B35] font-medium rounded-xl hover:bg-white/90 transition-colors">
                  Upgrade Plan
                </button>
                <button className="px-5 py-2.5 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors">
                  Cancel
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
              <h4 className="font-semibold text-[#1C1917] mb-4">Payment Method</h4>
              <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium text-[#1C1917]">**** **** **** 4242</p>
                    <p className="text-sm text-[#78716C]">Expires 12/2025</p>
                  </div>
                </div>
                <button className="text-sm text-[#FF6B35] font-medium hover:underline">
                  Update
                </button>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden">
              <div className="p-4 bg-[#F9FAFB] border-b border-[#E7E5E4]">
                <h4 className="font-semibold text-[#1C1917]">Billing History</h4>
              </div>
              <div className="divide-y divide-[#E7E5E4]">
                {[
                  { date: "Mar 1, 2024", amount: "$99.00", status: "Paid" },
                  { date: "Feb 1, 2024", amount: "$99.00", status: "Paid" },
                  { date: "Jan 1, 2024", amount: "$99.00", status: "Paid" },
                ].map((invoice, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-[#1C1917]">{invoice.date}</p>
                      <p className="text-sm text-[#78716C]">Professional Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#1C1917]">{invoice.amount}</p>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "integrations":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-1">Integrations</h3>
              <p className="text-sm text-[#78716C]">Connect Arambh with your favorite tools</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Slack", desc: "Send notifications to Slack channels", connected: true, icon: "S" },
                { name: "Google Workspace", desc: "Sync users from Google Workspace", connected: true, icon: "G" },
                { name: "Microsoft Teams", desc: "Share lessons directly to Teams", connected: false, icon: "T" },
                { name: "Zoom", desc: "Host live training sessions", connected: false, icon: "Z" },
                { name: "Zapier", desc: "Automate workflows with Zapier", connected: false, icon: "⚡" },
                { name: "Notion", desc: "Import content from Notion", connected: false, icon: "N" },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="bg-white rounded-2xl border border-[#E7E5E4] p-5 hover:border-[#FF6B35]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F5F5F4] flex items-center justify-center text-xl font-bold text-[#1C1917]">
                      {integration.icon}
                    </div>
                    {integration.connected ? (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Connected
                      </span>
                    ) : (
                      <button className="text-xs text-[#FF6B35] font-medium hover:underline">
                        Connect
                      </button>
                    )}
                  </div>
                  <h4 className="font-semibold text-[#1C1917]">{integration.name}</h4>
                  <p className="text-sm text-[#78716C] mt-1">{integration.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-8">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 right-8 bg-green-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50"
          >
            <Check size={18} />
            Settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C1917]">Settings</h1>
        <p className="text-[#78716C] mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#FF6B35] text-white"
                    : "text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917]"
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-[#E7E5E4] flex items-center justify-end gap-3">
              <button className="px-5 py-2.5 text-[#78716C] font-medium rounded-xl hover:bg-[#F5F5F4] transition-colors">
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#E85520] transition-colors disabled:opacity-70"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Toggle Switch Component
function ToggleSwitch({ checked, defaultChecked, onChange }: { 
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void 
}) {
  const [isChecked, setIsChecked] = useState(checked ?? defaultChecked ?? false)
  const actualChecked = checked !== undefined ? checked : isChecked

  const handleChange = () => {
    const newValue = !actualChecked
    setIsChecked(newValue)
    onChange?.(newValue)
  }

  return (
    <button
      onClick={handleChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        actualChecked ? "bg-[#FF6B35]" : "bg-[#E7E5E4]"
      }`}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        animate={{ left: actualChecked ? 28 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// Notification Row Component
function NotificationRow({ 
  title, 
  description, 
  checked, 
  onChange 
}: { 
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void 
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium text-[#1C1917]">{title}</p>
        <p className="text-sm text-[#78716C]">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  )
}
