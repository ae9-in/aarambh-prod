"use client"

import { useState, useEffect } from "react"
import { X, MessageCircle } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type ContactSalesModalProps = {
  open: boolean
  onClose: () => void
}

type TeamSizeOption = "1-10" | "11-50" | "51-200" | "200+"

export function ContactSalesModal({ open, onClose }: ContactSalesModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [teamSize, setTeamSize] = useState<TeamSizeOption>("1-10")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) {
      setName("")
      setEmail("")
      setPhone("")
      setCompany("")
      setTeamSize("1-10")
      setMessage("")
      setIsSubmitting(false)
      setError(null)
      setSuccess(false)
    }
  }, [open])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !phone) {
      setError("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          teamSize,
          message: message || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "Something went wrong. Please try again.")
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      setIsSubmitting(false)
    } catch (err) {
      console.error("enquiry submit error", err)
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[480px] rounded-[24px] border-0 p-0 shadow-2xl bg-transparent"
      >
        <div className="relative rounded-[24px] bg-white p-8">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F3EF] text-[#78716C] hover:bg-[#E7E5E4] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {!success ? (
            <>
              {/* Icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF9B50] text-white shadow-lg">
                <MessageCircle className="h-6 w-6" />
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-semibold text-[#1C1917]">
                Talk to our Sales Team
              </h2>
              <p className="mt-1 text-sm text-[#78716C]">
                We&apos;ll get back to you within 2 hours.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#44403C]">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[12px] border border-[#F0EDE8] bg-white px-4 py-3 text-sm text-[#1C1917] focus:border-[#FF6B35] focus:outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#44403C]">
                    Work Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[12px] border border-[#F0EDE8] bg-white px-4 py-3 text-sm text-[#1C1917] focus:border-[#FF6B35] focus:outline-none"
                    placeholder="you@company.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#44403C]">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-[12px] border border-[#F0EDE8] bg-white px-3 py-1.5 focus-within:border-[#FF6B35]">
                    <span className="px-2 text-sm text-[#78716C] border-r border-[#F0EDE8] mr-2">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 flex-1 border-0 bg-transparent px-1 text-sm text-[#1C1917] outline-none"
                      placeholder="98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#44403C]">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-[12px] border border-[#F0EDE8] bg-white px-4 py-3 text-sm text-[#1C1917] focus:border-[#FF6B35] focus:outline-none"
                    placeholder="Your company"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#44403C]">
                    Team Size
                  </label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value as TeamSizeOption)}
                    className="w-full rounded-[12px] border border-[#F0EDE8] bg-white px-4 py-3 text-sm text-[#1C1917] focus:border-[#FF6B35] focus:outline-none"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#44403C]">
                    Message <span className="text-xs text-[#A8A29E]">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-[12px] border border-[#F0EDE8] bg-white px-4 py-3 text-sm text-[#1C1917] focus:border-[#FF6B35] focus:outline-none resize-none"
                    placeholder="Tell us a bit about your team and what you&apos;re looking for."
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-[999px] bg-gradient-to-r from-[#FF6B35] to-[#FF9B50] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6B35]/40 transition disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Enquiry →"}
                </button>

                <p className="mt-2 text-center text-xs text-[#78716C]">
                  🔒 Your data is safe with us
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white animate-pulse">
                  ✓
                </div>
              </div>
              <h2 className="text-xl font-semibold text-[#14532D]">
                Thank you! We&apos;ll contact you soon 🎉
              </h2>
              <p className="mt-2 text-sm text-[#166534]">
                Our team has received your enquiry. This window will close automatically.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

