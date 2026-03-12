"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { MessageSquare, Search, FileText, Shield, Sparkles } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Ask in plain language",
    description: "No complex search queries needed. Just ask questions like you'd ask a colleague.",
    query: "How do I handle a customer refund?",
    response: "Based on your Refund Policy document: Process refunds within 7 business days. For amounts over ₹5000, manager approval is required.",
  },
  {
    icon: Search,
    title: "AI searches only your content",
    description: "Our AI only references your uploaded materials. No internet results, just your trusted knowledge base.",
    query: "What's our pricing structure?",
    response: "From your Sales Playbook: Base tier starts at ₹999/user/month. Enterprise pricing is custom with volume discounts starting at 50+ users.",
  },
  {
    icon: FileText,
    title: "Sources always shown",
    description: "Every AI response comes with source citations. Your team can always verify and dive deeper.",
    query: "What's the onboarding checklist?",
    response: "From HR Onboarding Guide v3.2: Day 1 - System access, Day 2-3 - Product training, Day 4-5 - Shadowing, Day 6-7 - First solo tasks.",
  },
  {
    icon: Shield,
    title: "Role-filtered answers",
    description: "AI responses are filtered based on user roles. Sensitive information stays protected.",
    query: "Show me salary benchmarks",
    response: "Based on your access level, you can view salary benchmarks for your department. For company-wide data, please contact HR.",
  },
]

export function AIShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })
  
  // Update active index based on scroll
  const handleScroll = () => {
    const progress = scrollYProgress.get()
    const newIndex = Math.min(Math.floor(progress * features.length), features.length - 1)
    if (newIndex !== activeIndex && newIndex >= 0) {
      setActiveIndex(newIndex)
    }
  }
  
  scrollYProgress.on("change", handleScroll)

  return (
    <section className="bg-[#FAF9F7] py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-mono text-sm text-[#FF6B35] tracking-widest uppercase">
            AI Powered
          </span>
          <h2 className="mt-4 font-sans font-extrabold text-4xl md:text-5xl text-[#1C1917] tracking-tight text-balance">
            Your knowledge, supercharged
            <br />
            <span className="text-[#78716C]">with AI</span>
          </h2>
        </motion.div>

        <div ref={containerRef} className="relative min-h-[200vh]">
          <div className="sticky top-24 grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Feature list */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeIndex === index
                      ? 'bg-white border-2 border-[#FF6B35] shadow-lg'
                      : 'bg-white/50 border border-[#E7E5E4]'
                  }`}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeIndex === index ? 'bg-[#FF6B35]' : 'bg-[#FAF9F7]'
                    }`}>
                      <feature.icon className={activeIndex === index ? 'text-white' : 'text-[#FF6B35]'} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-lg text-[#1C1917]">{feature.title}</h3>
                      <p className="text-sm text-[#78716C] mt-1">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Demo terminal */}
            <motion.div
              className="bg-[#1C1917] rounded-2xl overflow-hidden border border-white/10 sticky top-24"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Terminal header */}
              <div className="flex items-center gap-2 p-4 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-white/50 font-mono">arambh-ai</span>
              </div>

              {/* Terminal content */}
              <div className="p-6 space-y-6 min-h-[400px]">
                {/* User query */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C8A96E] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    U
                  </div>
                  <motion.div
                    key={`query-${activeIndex}`}
                    className="bg-[#2C2723] rounded-2xl rounded-tl-none px-4 py-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-white text-sm">{features[activeIndex].query}</p>
                  </motion.div>
                </div>

                {/* AI thinking indicator */}
                <motion.div
                  key={`thinking-${activeIndex}`}
                  className="flex items-center gap-2 text-[#FF6B35] text-sm"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#FF6B35]"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      boxShadow: ["0 0 0 0 rgba(255,107,53,0)", "0 0 0 10px rgba(255,107,53,0.2)", "0 0 0 0 rgba(255,107,53,0)"]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <Sparkles size={14} />
                  Searching your knowledge base...
                </motion.div>

                {/* AI response */}
                <motion.div
                  key={`response-${activeIndex}`}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="space-y-3">
                    <motion.div
                      className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-2xl rounded-tl-none px-4 py-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <p className="text-white/90 text-sm">{features[activeIndex].response}</p>
                    </motion.div>
                    
                    {/* Source badge */}
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 }}
                    >
                      <div className="px-3 py-1.5 bg-[#2C2723] rounded-lg border border-white/10 flex items-center gap-2">
                        <FileText size={14} className="text-[#C8A96E]" />
                        <span className="text-xs text-white/60">Source document verified</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Glowing border effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{
                  boxShadow: ["0 0 0 0 rgba(255,107,53,0)", "0 0 30px 0 rgba(255,107,53,0.3)", "0 0 0 0 rgba(255,107,53,0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
