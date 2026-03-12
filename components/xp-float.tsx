"use client"

import { createContext, useCallback, useContext, useId, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

type XPFloat = {
  id: string
  amount: number
}

type XPFloatContextValue = {
  triggerFloat: (amount: number) => void
}

const XPFloatContext = createContext<XPFloatContextValue | null>(null)

export function XPFloatProvider({ children }: { children: React.ReactNode }) {
  const [floats, setFloats] = useState<XPFloat[]>([])
  const baseId = useId()

  const triggerFloat = useCallback(
    (amount: number) => {
      if (!amount || amount <= 0) return
      const id = `${baseId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`
      setFloats((prev) => [...prev, { id, amount }])
      setTimeout(() => {
        setFloats((prev) => prev.filter((f) => f.id !== id))
      }, 1600)
    },
    [baseId],
  )

  return (
    <XPFloatContext.Provider value={{ triggerFloat }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
        <div className="relative">
          <AnimatePresence initial={false}>
            {floats.map((float, index) => (
              <motion.div
                key={float.id}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -80 - index * 24 }}
                exit={{ opacity: 0, y: -120 - index * 24 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 text-2xl font-extrabold text-[#F97316] drop-shadow-[0_0_30px_rgba(249,115,22,0.85)] select-none"
              >
                +{float.amount} XP
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </XPFloatContext.Provider>
  )
}

export function useXPFloat() {
  const ctx = useContext(XPFloatContext)
  if (!ctx) {
    throw new Error("useXPFloat must be used within XPFloatProvider")
  }
  return ctx
}

