"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'spark' | 'curtain' | 'done'>('logo')

  useEffect(() => {
    const timeline = async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
      setPhase('spark')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPhase('curtain')
      await new Promise(resolve => setTimeout(resolve, 800))
      setPhase('done')
      onComplete()
    }
    timeline()
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <>
          {/* Main loading screen with logo and spark */}
          <motion.div
            className="loading-screen"
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: phase === 'curtain' ? 0 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: phase === 'logo' || phase === 'spark' ? 1 : 0, 
                scale: 1 
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[#FAF9F7] font-sans font-extrabold text-5xl tracking-tight">
                  Arambh
                </span>
                {/* Spark/Flame Icon */}
                <motion.svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ 
                    opacity: phase === 'spark' || phase === 'curtain' ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.path
                    d="M24 4C24 4 28 12 28 18C28 22 26 24 24 26C22 24 20 22 20 18C20 12 24 4 24 4Z"
                    fill="#FF6B35"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: phase === 'spark' ? 1 : 0,
                      opacity: phase === 'spark' || phase === 'curtain' ? 1 : 0
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M24 10C24 10 32 20 32 28C32 36 28 40 24 44C20 40 16 36 16 28C16 20 24 10 24 10Z"
                    fill="#C8A96E"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: phase === 'spark' ? 1 : 0,
                      opacity: phase === 'spark' || phase === 'curtain' ? 1 : 0
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                  <motion.path
                    d="M24 20C24 20 28 26 28 32C28 36 26 38 24 40C22 38 20 36 20 32C20 26 24 20 24 20Z"
                    fill="#FF6B35"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: phase === 'spark' ? 1 : 0,
                      opacity: phase === 'spark' || phase === 'curtain' ? 1 : 0
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                    className="animate-glow-pulse"
                  />
                </motion.svg>
              </div>
              
              {/* Loading bar */}
              <motion.div 
                className="w-48 h-1 bg-[#2C2723] rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FF6B35] to-[#C8A96E]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    background: i % 2 === 0 ? '#FF6B35' : '#C8A96E',
                  }}
                  initial={{ 
                    y: '100vh',
                    opacity: 0,
                    scale: Math.random() * 2 + 0.5
                  }}
                  animate={{ 
                    y: '-100vh',
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Curtain wipe effect */}
          <motion.div
            className="loading-curtain"
            initial={{ y: 0 }}
            animate={{ 
              y: phase === 'curtain' ? '-100%' : '0%'
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.65, 0, 0.35, 1] 
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}
