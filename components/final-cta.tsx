"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ContactSalesModal } from "@/components/contact-sales-modal"

export function FinalCTA() {
  const router = useRouter()
  const [showContact, setShowContact] = useState(false)
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Orange background */}
      <div 
        className="absolute inset-0"
        style={{ background: '#FF6B35' }}
      />
      
      {/* Background beams */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"
            style={{
              left: `${10 + i * 12}%`,
              height: '200%',
              top: '-50%',
            }}
            animate={{
              y: ['-50%', '50%'],
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
      
      {/* Floating orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
          style={{
            left: `${20 + i * 30}%`,
            top: `${20 + (i % 2) * 40}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Noise texture */}
      <div className="noise-overlay opacity-[0.05]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6 text-balance"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Ready to build your company&apos;s brain?
        </motion.h2>
        
        <motion.p
          className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          Join 500+ teams across India who&apos;ve transformed how they train and share knowledge.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <motion.button
            className="bg-white text-[#1C1917] px-8 py-4 rounded-full text-lg font-semibold btn-scale shadow-lg"
            whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/register")}
          >
            Start Free Trial
          </motion.button>
          
          <motion.button
            className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold btn-scale hover:bg-white hover:text-[#FF6B35] transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowContact(true)}
          >
            Talk to Sales
          </motion.button>
        </motion.div>
      </div>

      <ContactSalesModal open={showContact} onClose={() => setShowContact(false)} />
    </section>
  )
}
