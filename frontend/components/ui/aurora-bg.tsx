"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import * as React from "react"

type AuroraBgProps = React.HTMLAttributes<HTMLDivElement>

export function AuroraBg({ className, children, ...props }: AuroraBgProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-[#1C1917]",
        className,
      )}
      {...props}
    >
      {/* Blobs */}
      <motion.div
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 blur-[80px] opacity-60 mix-blend-screen"
        style={{ background: "#FF6B35" }}
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 blur-[80px] opacity-60 mix-blend-screen"
        style={{ background: "#C8A96E" }}
        animate={{ rotate: -360, scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-28 bottom-[-5rem] h-72 w-72 blur-[80px] opacity-60 mix-blend-screen"
        style={{ background: "#E85520" }}
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 blur-[80px] opacity-60 mix-blend-screen"
        style={{ background: "#1C1917" }}
        animate={{ rotate: -360, scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  )
}

