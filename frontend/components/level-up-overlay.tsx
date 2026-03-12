"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useApp } from "@/lib/store"

export function LevelUpOverlay() {
  const {
    state: { levelUpData },
    dispatch,
  } = useApp()

  useEffect(() => {
    if (!levelUpData.show) return
    const timer = setTimeout(() => {
      dispatch({ type: "HIDE_LEVEL_UP" })
    }, 2500)
    return () => clearTimeout(timer)
  }, [levelUpData.show, dispatch])

  if (!levelUpData.show || !levelUpData.newLevel) return null

  const handleDismiss = () => {
    dispatch({ type: "HIDE_LEVEL_UP" })
  }

  return (
    <AnimatePresence>
      {levelUpData.show && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
        >
          <motion.div
            className="relative mx-4 max-w-sm rounded-3xl bg-gradient-to-b from-[#1C1917] to-black px-8 py-10 text-center text-white shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#FF6B35] via-[#F97316] to-[#FEF3C7] shadow-[0_0_60px_rgba(251,146,60,0.75)]" />
            <div className="relative mt-6">
              <p className="text-xs font-semibold tracking-[0.2em] text-amber-200/90">
                LEVEL UP
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">LEVEL UP!</h2>
              <p className="mt-2 text-sm text-zinc-300">
                You&apos;re now{" "}
                <span className="font-semibold text-amber-300">{levelUpData.newLevel}</span>!
              </p>
            </div>

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="animate-[ping_1.8s_ease-out_infinite] absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full border border-amber-400/40" />
              <div className="animate-[ping_2.2s_ease-out_infinite] absolute -bottom-6 left-10 h-10 w-10 rounded-full border border-amber-500/20" />
              <div className="animate-[ping_2.5s_ease-out_infinite] absolute -bottom-10 right-6 h-16 w-16 rounded-full border border-orange-400/25" />
            </div>

            <p className="relative mt-6 text-xs text-zinc-400">
              Tap anywhere to continue
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

