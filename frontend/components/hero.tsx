"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ChevronDown, Check, Play, Sparkles, Layers, Cpu } from "lucide-react"
import { useRouter } from "next/navigation"
import { DemoVideoModal } from "@/components/demo-video-modal"

function NumberTicker({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{count}{suffix}</span>
}

function FloatingParticle({ delay, size, x, color }: { delay: number; size: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        background: color,
        filter: 'blur(1px)',
      }}
      initial={{ y: '100vh', opacity: 0 }}
      animate={{ 
        y: '-100vh',
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: "linear"
      }}
    />
  )
}

export function Hero() {
  const router = useRouter()
  const [showDemo, setShowDemo] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    })
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen bg-[#1C1917] overflow-hidden flex items-center justify-center pt-20 pb-14"
      onMouseMove={handleMouseMove}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Background beams */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] bg-gradient-to-b from-transparent via-[#FF6B35] to-transparent opacity-20"
              style={{
                left: `${15 + i * 10}%`,
                height: '200%',
                top: '-50%',
              }}
              animate={{
                y: ['-100%', '100%'],
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
        
        {/* Floating orbs - more dramatic with deeper colors */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.25) 0%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,169,110,0.2) 0%, transparent 70%)',
            top: '20%',
            right: '-5%',
            filter: 'blur(50px)',
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(60,50,45,0.4) 0%, transparent 70%)',
            bottom: '10%',
            left: '30%',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -40, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Enhanced floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={Math.random() * 5}
              size={Math.random() * 4 + 2}
              x={Math.random() * 100}
              color={i % 3 === 0 ? '#FF6B35' : i % 3 === 1 ? '#C8A96E' : '#FAF9F7'}
            />
          ))}
        </div>
        
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FAF9F7 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Noise texture */}
        <div className="noise-overlay" />
      </div>
      
      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-6 w-full"
        style={{ y, opacity }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

          {/* LEFT — Text block */}
          <div className="flex-1 flex flex-col items-start text-left">
            {/* Eyebrow Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(200,169,110,0.1))',
                border: '1px solid rgba(255,107,53,0.3)',
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚡
              </motion.span>
              <span className="text-xs text-[#FAF9F7]/80">
                Now with AI Search · India&apos;s #1 Training Platform
              </span>
            </motion.div>

            {/* H1 - 80px as requested */}
            <motion.h1
              className="font-sans font-extrabold text-4xl md:text-5xl lg:text-[72px] text-[#FAF9F7] tracking-tight leading-[1.05] mb-5"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            >
              <span className="text-balance">Your Team&apos;s Brain.</span>
              <br />
              <span className="text-[#FF6B35]">Always On.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-base md:text-lg text-[#FAF9F7]/65 max-w-lg mb-8 text-pretty"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
            >
              Arambh centralizes every SOP, training video, and company process — so every employee knows exactly what to do, from day one.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-3 mb-5"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.36 }}
            >
              <motion.button
                className="relative bg-[#FF6B35] text-white px-7 py-3 rounded-full text-base font-semibold overflow-hidden btn-scale group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/register")}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>

              <motion.button
                className="flex items-center gap-2 px-7 py-3 rounded-full text-base font-semibold text-white border-2 border-white/20 hover:bg-white hover:text-[#1C1917] transition-all duration-300 btn-scale"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDemo(true)}
              >
                <Play size={20} />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Micro text */}
            <motion.div
              className="flex flex-wrap items-center gap-3 text-xs text-[#FAF9F7]/50"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
            >
              {["Free 14 days", "No card required", "Setup in 10 mins"].map((text, i) => (
                <motion.span
                  key={text}
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Check size={14} className="text-[#FF6B35]" />
                  {text}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — 3D Dashboard Mockup */}
          <div className="flex-1 w-full">
        {/* Enhanced 3D Dashboard Mockup */}
        <motion.div
          className="relative perspective-1000"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.48 }}
        >
          <motion.div
            className="relative mx-auto max-w-4xl preserve-3d"
            animate={{
              y: [0, -12, 0],
              rotateX: mousePosition.y * 0.3,
              rotateY: mousePosition.x * 0.3,
            }}
            transition={{
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              rotateX: { duration: 0.1 },
              rotateY: { duration: 0.1 },
            }}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Main Dashboard Card */}
            <div 
              className="relative rounded-2xl p-1 overflow-hidden card-spotlight"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,53,0.3), rgba(200,169,110,0.2))',
                boxShadow: '0 40px 120px rgba(255,107,53,0.3), 0 0 60px rgba(255,107,53,0.1)',
              }}
            >
              <div className="bg-[#2C2723] rounded-xl p-6 min-h-[400px]">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                    <div className="w-4 h-4 rounded bg-[#FF6B35]/30" />
                    <span className="text-xs text-white/50">Arambh Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="flex gap-6">
                  {/* Sidebar */}
                  <div className="w-48 space-y-2">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Categories</div>
                    {[
                      { name: "Sales Training", count: 24, active: true },
                      { name: "Product Docs", count: 18 },
                      { name: "HR Policies", count: 12 },
                      { name: "Tech Guides", count: 31 },
                      { name: "Onboarding", count: 8 },
                    ].map((item, i) => (
                      <motion.div
                        key={item.name}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          item.active ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-white/60 hover:bg-white/5'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <span>{item.name}</span>
                        <span className="text-xs opacity-60">{item.count}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Main Content Area */}
                  <div className="flex-1 space-y-4">
                    {/* Search Bar */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <Sparkles size={18} className="text-[#FF6B35]" />
                      <span className="text-white/40 text-sm">Ask AI anything about your training content...</span>
                    </div>
                    
                    {/* Content Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: "Sales Pitch Template", type: "PDF", progress: 85 },
                        { title: "Product Demo Video", type: "VIDEO", progress: 100 },
                        { title: "Customer FAQ", type: "DOC", progress: 60 },
                        { title: "Onboarding Checklist", type: "LIST", progress: 45 },
                      ].map((item, i) => (
                        <motion.div
                          key={item.title}
                          className="p-3 bg-white/5 rounded-lg border border-white/5"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF6B35]">
                              {item.type}
                            </span>
                            <span className="text-xs text-white/40">{item.progress}%</span>
                          </div>
                          <p className="text-sm text-white/80 truncate">{item.title}</p>
                          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[#FF6B35]"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* AI Response Preview */}
                    <motion.div
                      className="p-4 bg-gradient-to-r from-[#FF6B35]/10 to-transparent rounded-xl border border-[#FF6B35]/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0">
                          <Cpu size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80 mb-2">
                            Based on your training materials, here&apos;s how to handle objections...
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-white/10 rounded text-white/50">
                              Source: Sales Training v2.3
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Mini Cards */}
            <motion.div
              className="absolute -top-8 -left-12 bg-[#2C2723] rounded-xl p-4 border border-white/10"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                transform: 'translateZ(60px)',
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [-2, 2, -2],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Layers size={20} className="text-[#FF6B35] mb-2" />
              <div className="text-2xl font-bold text-white">
                <NumberTicker value={12} />
              </div>
              <div className="text-xs text-white/50">Categories</div>
            </motion.div>
            
            <motion.div
              className="absolute -top-4 -right-8 bg-gradient-to-br from-[#FF6B35] to-[#E85520] rounded-xl px-4 py-3"
              style={{
                boxShadow: '0 20px 40px rgba(255,107,53,0.3)',
                transform: 'translateZ(80px)',
              }}
              animate={{
                y: [0, -8, 0],
                rotate: [2, -2, 2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">AI Ready</span>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#2C2723] rounded-xl p-4 border border-white/10"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                transform: 'translateZ(40px)',
              }}
              animate={{
                y: [0, -6, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">
                    <NumberTicker value={58} />
                  </div>
                  <div className="text-xs text-white/50">Lessons</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-[#C8A96E]">98%</div>
                  <div className="text-xs text-white/50">Completion</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
          </div>{/* end RIGHT column */}
        </div>{/* end flex row */}
      </motion.div>

      <DemoVideoModal open={showDemo} onClose={() => setShowDemo(false)} />
      
      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.span
          className="text-sm text-[#FAF9F7]/40"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll to explore
        </motion.span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="text-[#FF6B35]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
