"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  ArrowRight,
  Loader2,
  Check,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
  })

  const passwordStrength = () => {
    const { password } = formData
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error("Please enter your name")
        return
      }
      if (!formData.email.trim()) {
        toast.error("Please enter your email")
        return
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters")
        return
      }
      setStep(2)
      return
    }

    setIsLoading(true)
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      department: formData.department || undefined,
    })
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (result.pending) {
      setStep(3)
      return
    }
  }

  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ]
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"]

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-8">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF9B50]">
              <Clock className="h-7 w-7 text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-2xl font-bold text-[#1C1917] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Registration Submitted!
          </motion.h1>

          <motion.p
            className="text-[#78716C] mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your account is <span className="font-semibold text-[#FF6B35]">pending approval</span> by
            an administrator.
          </motion.p>

          <motion.p
            className="text-sm text-[#A8A29E] mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            You will be able to log in once your account is approved by your
            admin, manager, or HR.
          </motion.p>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="rounded-xl bg-white border border-[#E7E5E4] p-4 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#1C1917]">
                    Account created for {formData.email}
                  </p>
                  <p className="text-xs text-[#78716C] mt-1">
                    Your details have been saved and sent to the admin team for
                    review.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[#FF6B35] font-medium hover:underline mt-4"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAF9F7]">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <motion.svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              whileHover={{ scale: 1.1 }}
            >
              <path
                d="M24 4C24 4 28 12 28 18C28 22 26 24 24 26C22 24 20 22 20 18C20 12 24 4 24 4Z"
                fill="#FF6B35"
              />
              <path
                d="M24 10C24 10 32 20 32 28C32 36 28 40 24 44C20 40 16 36 16 28C16 20 24 10 24 10Z"
                fill="#C8A96E"
              />
              <path
                d="M24 20C24 20 28 26 28 32C28 36 26 38 24 40C22 38 20 36 20 32C20 26 24 20 24 20Z"
                fill="#FF6B35"
              />
            </motion.svg>
            <span className="font-sans font-bold text-xl text-[#1C1917]">
              Arambh
            </span>
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? "bg-[#FF6B35] text-white"
                      : "bg-[#E7E5E4] text-[#78716C]"
                  }`}
                  animate={{ scale: step === s ? 1.1 : 1 }}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </motion.div>
                {s < 2 && (
                  <div
                    className={`w-16 h-1 rounded-full ${
                      step > s ? "bg-[#FF6B35]" : "bg-[#E7E5E4]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8">
            <motion.h1
              className="text-3xl font-bold text-[#1C1917] mb-2"
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {step === 1 ? "Create your account" : "A few more details"}
            </motion.h1>
            <motion.p
              className="text-[#78716C]"
              key={`desc-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {step === 1
                ? "Register to join your team on Arambh"
                : "Help us set up your profile"}
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            key={`form-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {step === 1 ? (
              <>
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1C1917]">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Name"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1C1917]">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@company.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1C1917]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Create a strong password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < passwordStrength()
                                ? strengthColors[passwordStrength() - 1]
                                : "bg-[#E7E5E4]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#78716C]">
                        Password strength:{" "}
                        <span
                          className={
                            passwordStrength() > 2
                              ? "text-green-600"
                              : "text-orange-500"
                          }
                        >
                          {strengthLabels[passwordStrength() - 1] || "Too weak"}
                        </span>
                      </p>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1C1917]">
                    Phone number{" "}
                    <span className="text-xs text-[#A8A29E]">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1C1917]">
                    Department{" "}
                    <span className="text-xs text-[#A8A29E]">(optional)</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all appearance-none"
                    >
                      <option value="">Select department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Design">Design</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E7E5E4] bg-orange-50/50 p-4">
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    After you register, your account will need to be{" "}
                    <span className="font-semibold text-[#FF6B35]">
                      approved by an administrator
                    </span>{" "}
                    before you can log in. You&apos;ll receive access once
                    approved.
                  </p>
                </div>
              </>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF6B35] hover:bg-[#E85520] text-white font-semibold rounded-xl transition-all disabled:opacity-70"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {step === 1 ? "Continue" : "Register"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-[#78716C] font-medium hover:text-[#1C1917] transition-colors"
              >
                Back
              </button>
            )}

            {step === 1 && (
              <p className="text-xs text-center text-[#78716C]">
                By creating an account, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-[#FF6B35] hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#FF6B35] hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            )}
          </motion.form>

          {/* Sign in link */}
          <motion.p
            className="mt-8 text-center text-[#78716C]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#FF6B35] font-medium hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right - Visual Section */}
      <div className="hidden lg:flex flex-1 relative bg-[#1C1917] overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B35]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C8A96E]/20 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Join your team on
              <br />
              Arambh
            </h2>

            <div className="space-y-4 mb-8">
              {[
                "Access training videos & SOPs",
                "AI-powered instant search",
                "Track your learning progress",
                "Earn XP and badges",
              ].map((benefit, i) => (
                <motion.div
                  key={benefit}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#FF6B35]" />
                  </div>
                  <span className="text-[#A8A29E]">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-white/80 text-sm mb-4">
                &ldquo;Arambh reduced our onboarding time from 2 weeks to 3
                days. The AI search is incredibly helpful.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#C8A96E]" />
                <div>
                  <div className="text-white font-medium text-sm">
                    Priya Sharma
                  </div>
                  <div className="text-[#78716C] text-xs">
                    HR Director, TechCorp
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
