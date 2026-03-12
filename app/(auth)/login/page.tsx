"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }))
      return
    }
    if (!password || password.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }))
      return
    }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      const data = await res.json().catch(() => null)
      const profile = data?.profile ?? data?.user ?? data
      const role = profile?.role ?? "EMPLOYEE"

      toast.success("Login successful!")

      if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") {
        router.push("/dashboard")
      } else {
        router.push("/learn")
      }
    } catch {
      router.push("/learn")
    }
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
              <path d="M24 4C24 4 28 12 28 18C28 22 26 24 24 26C22 24 20 22 20 18C20 12 24 4 24 4Z" fill="#FF6B35"/>
              <path d="M24 10C24 10 32 20 32 28C32 36 28 40 24 44C20 40 16 36 16 28C16 20 24 10 24 10Z" fill="#C8A96E"/>
              <path d="M24 20C24 20 28 26 28 32C28 36 26 38 24 40C22 38 20 36 20 32C20 26 24 20 24 20Z" fill="#FF6B35"/>
            </motion.svg>
            <span className="font-sans font-bold text-xl text-[#1C1917]">Arambh</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <motion.h1
              className="text-3xl font-bold text-[#1C1917] mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome back
            </motion.h1>
            <motion.p
              className="text-[#78716C]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Sign in to continue to your dashboard
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1917]">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:border-[#FF6B35] transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-200" : "border-[#E7E5E4] focus:ring-[#FF6B35]/20"
                  }`}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#1C1917]">Password</label>
                <Link href="/forgot-password" className="text-sm text-[#FF6B35] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:border-[#FF6B35] transition-all ${
                    errors.password ? "border-red-500 focus:ring-red-200" : "border-[#E7E5E4] focus:ring-[#FF6B35]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-[#E7E5E4]" />
              <span className="text-sm text-[#78716C]">Remember me</span>
            </label>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B35] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#E55A24] disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Sign Up Link */}
          <p className="text-center text-[#78716C] mt-8">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#FF6B35] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Illustration Section */}
      <div className="flex-1 hidden lg:flex items-center justify-center bg-gradient-to-br from-[#1C1917] to-[#2A2A2A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4 text-balance">
            Your Team's Brain. Always On.
          </h2>
          <p className="text-[#A8A29E] max-w-sm text-balance">
            Arambh centralizes every SOP, training video, and company process — so every employee knows exactly what to do.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
