"use client"

import { motion } from "framer-motion"

const companies = [
  "TechCorp India",
  "GrowthHub",
  "RetailX",
  "BuildFast",
  "HireRight",
  "CloudBase",
  "SalesEdge",
  "OpsPro",
]

const stats = [
  "500+ Teams",
  "10,000+ Employees Trained",
  "98% Satisfaction",
  "60% Faster Onboarding",
  "₹12L+ Saved in Training Costs",
]

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const duplicatedItems = [...items, ...items, ...items, ...items]
  
  return (
    <div className="marquee-container py-4">
      <div className={reverse ? 'marquee-content-reverse' : 'marquee-content'}>
        {duplicatedItems.map((item, i) => (
          <span key={i} className="flex items-center">
            <motion.span
              className="text-lg md:text-xl font-medium text-[#78716C] px-6 whitespace-nowrap hover:text-[#1C1917] transition-colors cursor-default"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {item}
            </motion.span>
            <span className="text-[#FF6B35] px-4">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function SocialProof() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Gradient transition from dark to light */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #1C1917 0%, #FAF9F7 100%)',
        }}
      />
      
      <div className="relative z-10">
        <MarqueeRow items={companies} />
        <MarqueeRow items={stats} reverse />
      </div>
    </section>
  )
}
