"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Brain, FolderTree, Shield, BarChart3, Upload, Zap, MessageSquare, User } from "lucide-react"

function useNumberAnimation(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * (end - start) + start))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, end, start, duration])

  return { count, ref }
}

function TypewriterEffect({ messages }: { messages: { role: string; text: string }[] }) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  
  useEffect(() => {
    if (currentMessage >= messages.length) {
      setTimeout(() => {
        setCurrentMessage(0)
        setDisplayText("")
      }, 2000)
      return
    }
    
    const message = messages[currentMessage]
    let charIndex = 0
    setIsTyping(true)
    
    const typeInterval = setInterval(() => {
      if (charIndex <= message.text.length) {
        setDisplayText(message.text.slice(0, charIndex))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
        setTimeout(() => setCurrentMessage(prev => prev + 1), 1500)
      }
    }, 30)
    
    return () => clearInterval(typeInterval)
  }, [currentMessage, messages])
  
  const currentRole = messages[currentMessage]?.role || messages[0]?.role
  
  return (
    <div className="space-y-3">
      {messages.slice(0, currentMessage + 1).map((msg, i) => (
        <motion.div
          key={i}
          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {msg.role === 'ai' && (
            <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0">
              <Brain size={16} className="text-white" />
            </div>
          )}
          <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
            msg.role === 'user' 
              ? 'bg-[#3C3632] text-white' 
              : 'bg-[#FF6B35]/10 text-white border border-[#FF6B35]/20'
          }`}>
            <p className="text-sm">
              {i === currentMessage ? displayText : msg.text}
              {i === currentMessage && isTyping && (
                <span className="inline-block w-2 h-4 bg-[#FF6B35] ml-1 animate-pulse" />
              )}
            </p>
          </div>
          {msg.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-[#C8A96E] flex items-center justify-center shrink-0">
              <User size={16} className="text-white" />
            </div>
          )}
        </motion.div>
      ))}
      {currentRole === 'ai' && isTyping && (
        <motion.div 
          className="flex items-center gap-2 text-[#FF6B35] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-[#FF6B35]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          AI is thinking...
        </motion.div>
      )}
    </div>
  )
}

function CircularProgress({ value, label }: { value: number; label: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const circumference = 2 * Math.PI * 40
  
  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(255,107,53,0.1)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isInView ? circumference - (value / 100) * circumference : circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <span className="text-2xl font-bold text-[#1C1917] -mt-16">{value}%</span>
      <span className="text-sm text-[#78716C] mt-10">{label}</span>
    </div>
  )
}

const fileTypes = [
  { icon: "PDF", color: "#FF6B35" },
  { icon: "MP4", color: "#C8A96E" },
  { icon: "PPT", color: "#E85520" },
  { icon: "MP3", color: "#78716C" },
  { icon: "PNG", color: "#1C1917" },
]

export function Features() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const { count: speedCount, ref: speedRef } = useNumberAnimation(60)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
      <section id="features" ref={sectionRef} className="py-20 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-mono text-sm text-[#FF6B35] tracking-widest uppercase">
            Features
          </span>
          <h2 className="mt-3 font-sans font-extrabold text-3xl md:text-4xl text-[#1C1917] tracking-tight text-balance">
            Everything your team needs.
            <br />
            <span className="text-[#78716C]">Nothing they don&apos;t.</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Card 1 - AI Knowledge Assistant (Large) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 lg:row-span-2 bg-[#1C1917] rounded-2xl p-6 overflow-hidden card-spotlight feature-card-glow perspective-1000"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-[#FF6B35]" />
              <h3 className="font-sans font-bold text-xl text-white">AI Knowledge Assistant</h3>
            </div>
            <div className="h-[calc(100%-60px)] overflow-hidden">
              <TypewriterEffect
                messages={[
                  { role: 'user', text: 'How to handle a difficult shop owner?' },
                  { role: 'ai', text: 'Based on your Sales Training v2.3: Start with empathy, acknowledge their concerns, then present data showing how our product helped similar businesses increase revenue by 35%.' },
                ]}
              />
            </div>
          </motion.div>

          {/* Card 2 - Organized Categories (Tall) */}
          <motion.div
            variants={itemVariants}
            className="lg:row-span-2 bg-white rounded-2xl p-6 border border-[#E7E5E4] card-spotlight feature-card-glow perspective-1000"
          >
            <div className="flex items-center gap-2 mb-4">
              <FolderTree className="text-[#FF6B35]" />
              <h3 className="font-sans font-bold text-lg text-[#1C1917]">Organized Categories</h3>
            </div>
            <div className="space-y-2">
              {["Dictionary", "Website", "Video Tutorial", "Notes", "SOPs"].map((folder, i) => (
                <motion.div
                  key={folder}
                  className="flex items-center gap-3 p-3 bg-[#FAF9F7] rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center"
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <FolderTree size={16} className="text-[#FF6B35]" />
                  </motion.div>
                  <span className="text-sm font-medium text-[#1C1917]">{folder}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 3 - Role-Based Access */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 border border-[#E7E5E4] card-spotlight feature-card-glow perspective-1000"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-[#FF6B35]" />
              <h3 className="font-sans font-bold text-lg text-[#1C1917]">Role-Based Access</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Admin", "Manager", "Trainer", "Employee", "Viewer"].map((role, i) => (
                <motion.span
                  key={role}
                  className="px-3 py-1.5 bg-[#FAF9F7] rounded-full text-sm font-medium text-[#78716C] border border-[#E7E5E4]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                >
                  {role}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Card 4 - Progress Tracking */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E7E5E4] card-spotlight feature-card-glow perspective-1000"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-[#FF6B35]" />
              <h3 className="font-sans font-bold text-lg text-[#1C1917]">Progress Tracking</h3>
            </div>
            <div className="flex justify-around">
              <CircularProgress value={92} label="Rahul" />
              <CircularProgress value={78} label="Priya" />
              <CircularProgress value={65} label="Amit" />
            </div>
          </motion.div>

          {/* Card 5 - Upload Any Format */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 border border-[#E7E5E4] card-spotlight feature-card-glow perspective-1000 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <Upload className="text-[#FF6B35]" />
              <h3 className="font-sans font-bold text-lg text-[#1C1917]">Upload Any Format</h3>
            </div>
            <div className="relative h-20 flex items-center justify-center">
              {fileTypes.map((file, i) => (
                <motion.div
                  key={file.icon}
                  className="absolute w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: file.color }}
                  animate={{
                    rotate: 360,
                    x: Math.cos((i / fileTypes.length) * Math.PI * 2) * 40,
                    y: Math.sin((i / fileTypes.length) * Math.PI * 2) * 30,
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    x: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                  }}
                >
                  {file.icon}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 6 - Fast Onboarding */}
          <motion.div
            ref={speedRef}
            variants={itemVariants}
            className="bg-gradient-to-br from-[#FF6B35] to-[#E85520] rounded-2xl p-6 text-white card-spotlight feature-card-glow perspective-1000"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-white" />
              <h3 className="font-sans font-bold text-lg">Fast Onboarding</h3>
            </div>
            <div className="text-5xl font-extrabold">
              {speedCount}%
            </div>
            <p className="text-white/80 text-sm mt-2">faster employee onboarding</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
