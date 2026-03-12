"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"

export function BadgeEarnedSheet() {
  const {
    state: { badgeEarnedData },
    dispatch,
  } = useApp()

  const onClose = useCallback(() => {
    dispatch({ type: "HIDE_BADGE_EARNED" })
  }, [dispatch])

  if (!badgeEarnedData.show || !badgeEarnedData.badge) return null

  const { badge } = badgeEarnedData

  return (
    <div className="pointer-events-none fixed inset-0 z-[65] flex items-end justify-center">
      <motion.div
        className="pointer-events-auto mb-2 w-full max-w-md rounded-t-3xl border border-[#292524] bg-[#0C0A09] px-5 pb-8 pt-4 shadow-[0_-24px_80px_rgba(0,0,0,0.85)]"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <button
          type="button"
          onClick={onClose}
          className="mx-auto mb-4 block h-1 w-12 rounded-full bg-[#44403C]"
          aria-label="Close badge sheet"
        />

        <div className="flex items-center gap-4">
          <motion.div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${badge.color}22` }}
            initial={{ scale: 0.8, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl border border-white/10"
              animate={{ boxShadow: [`0 0 0 0 ${badge.color}55`, `0 0 0 18px transparent`] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span className="text-3xl">{badge.icon}</span>
          </motion.div>

          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              New badge unlocked
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#F9FAFB]">{badge.name}</h3>
            <p className="mt-1 text-sm text-[#A8A29E] line-clamp-2">
              {badge.description}
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(248,113,113,0.45)] hover:bg-[#EA580C] transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          View all badges
        </motion.button>
      </motion.div>
    </div>
  )
}

