"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Upload, Send } from "lucide-react"
import { useApp } from "@/lib/store"
import { useInteractivity } from "@/lib/interactivity-helpers"
import { toast } from "sonner"
import confetti from "canvas-confetti"

const easeExpo = [0.16, 1, 0.3, 1]

export default function OnboardingPage() {
  const { state, dispatch } = useApp()
  const { addCategory, addUser, addContent } = useInteractivity()
  const [step, setStep] = useState(1)
  const [stepData, setStepData] = useState({ companyName: "", logo: "", categories: [{emoji: "📚", name: "", color: "#FF6B35"}, {emoji: "🎯", name: "", color: "#C8A96E"}, {emoji: "⚡", name: "", color: "#10B981"}], emails: [{email: "", role: "EMPLOYEE"}] })

  const handleNext = () => {
    if (step === 1) {
      if (!stepData.companyName.trim()) { toast.error("Enter company name"); return }
      localStorage.setItem("arambh_company", JSON.stringify({ name: stepData.companyName, logo: stepData.logo }))
      setStep(2)
    } else if (step === 2) {
      const cats = stepData.categories.filter(c => c.name.trim())
      if (cats.length === 0) { toast.error("Add at least 1 category"); return }
      cats.forEach((cat, i) => addCategory({ id: Date.now() + i, ...cat, lessonCount: 0 }))
      setStep(3)
    } else if (step === 3) {
      stepData.emails.forEach(e => { if (e.email.includes("@")) addUser({ id: Date.now(), name: e.email.split("@")[0], email: e.email, role: e.role, status: "Pending", xp: 0, level: "Fresher", streak: 0, score: 0 }) })
      setStep(4)
    } else if (step === 4) {
      setStep(5)
    } else if (step === 5) {
      confetti({ particleCount: 200, spread: 80, colors: ["#FF6B35", "#C8A96E", "#10B981"] })
      setTimeout(() => window.location.href = "/dashboard", 1000)
    }
  }

  const progressWidth = ((step - 1) / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C1917] to-[#2C2723] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <motion.div className="h-1 bg-[#E7E5E4] rounded-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="h-full bg-[#FF6B35]" animate={{ width: `${progressWidth}%` }} transition={{ duration: 0.5 }} />
          </motion.div>
          <p className="text-sm text-[#A8A29E] mt-2">Step {step} of 5</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" className="text-center" initial={{ opacity: 0, x: 50 }} exit={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <motion.div className="text-6xl font-bold text-[#FF6B35] mb-4 inline-block animate-bounce">🔥</motion.div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome to Arambh!</h1>
              <p className="text-[#A8A29E] mb-8">Let's set up your organization</p>
              <input type="text" placeholder="Company Name" value={stepData.companyName} onChange={(e) => setStepData({...stepData, companyName: e.target.value})} className="w-full px-4 py-3 bg-[#2C2723] border border-[#3C3733] rounded-lg text-white mb-4" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" className="text-center" initial={{ opacity: 0, x: 50 }} exit={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold text-white mb-2">Create Categories</h1>
              <p className="text-[#A8A29E] mb-8">Set up your first categories</p>
              <div className="space-y-3">
                {stepData.categories.map((cat, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" placeholder="Category name" value={cat.name} onChange={(e) => { const updated = [...stepData.categories]; updated[i].name = e.target.value; setStepData({...stepData, categories: updated}) }} className="flex-1 px-3 py-2 bg-[#2C2723] border border-[#3C3733] rounded-lg text-white" />
                    <input type="color" value={cat.color} onChange={(e) => { const updated = [...stepData.categories]; updated[i].color = e.target.value; setStepData({...stepData, categories: updated}) }} className="w-10 h-10 rounded-lg cursor-pointer" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" className="text-center" initial={{ opacity: 0, x: 50 }} exit={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold text-white mb-2">Invite Team</h1>
              <p className="text-[#A8A29E] mb-8">Add your team members</p>
              <div className="space-y-3">
                {stepData.emails.map((e, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="email" placeholder="Email" value={e.email} onChange={(ev) => { const updated = [...stepData.emails]; updated[i].email = ev.target.value; setStepData({...stepData, emails: updated}) }} className="flex-1 px-3 py-2 bg-[#2C2723] border border-[#3C3733] rounded-lg text-white" />
                    <select value={e.role} onChange={(ev) => { const updated = [...stepData.emails]; updated[i].role = ev.target.value; setStepData({...stepData, emails: updated}) }} className="px-3 py-2 bg-[#2C2723] border border-[#3C3733] rounded-lg text-white"><option>ADMIN</option><option>MANAGER</option><option>EMPLOYEE</option></select>
                  </div>
                ))}
                <button onClick={() => setStepData({...stepData, emails: [...stepData.emails, {email: "", role: "EMPLOYEE"}]})} className="w-full py-2 border border-dashed border-[#3C3733] rounded-lg text-[#FF6B35] font-medium">+ Add Another</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" className="text-center" initial={{ opacity: 0, x: 50 }} exit={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold text-white mb-2">Upload Content</h1>
              <p className="text-[#A8A29E] mb-8">Add your first training content</p>
              <div className="border-2 border-dashed border-[#3C3733] rounded-lg p-12 text-center cursor-pointer hover:border-[#FF6B35] transition-colors">
                <Upload size={40} className="text-[#FF6B35] mx-auto mb-3" />
                <p className="text-white font-medium">Drop files here or click to upload</p>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" className="text-center" initial={{ opacity: 0, scale: 0.8 }} exit={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">✅</motion.div>
              <h1 className="text-4xl font-bold text-white mb-4">You're All Set!</h1>
              <div className="space-y-3 text-left bg-[#2C2723] rounded-lg p-6 mb-8">
                <p className="text-[#10B981]">✓ Company created</p>
                <p className="text-[#10B981]">✓ Categories added</p>
                <p className="text-[#10B981]">✓ Team invited</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <motion.button onClick={() => setStep(step - 1)} className="flex-1 py-3 border border-[#3C3733] text-white rounded-lg font-medium hover:bg-[#3C3733]" whileHover={{ scale: 1.02 }}>
              Back
            </motion.button>
          )}
          {step < 5 && (
            <motion.button onClick={handleNext} className="flex-1 py-3 bg-[#FF6B35] text-white rounded-lg font-medium" whileHover={{ scale: 1.02 }}>
              {step === 4 ? "Skip" : "Next"}
            </motion.button>
          )}
          {step === 5 && (
            <motion.button onClick={() => window.location.href = "/dashboard"} className="flex-1 py-3 bg-[#FF6B35] text-white rounded-lg font-medium" whileHover={{ scale: 1.02 }}>
              Go to Dashboard
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
