"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Upload, FolderOpen, Users, Sparkles, Play, ArrowRight, Check, Search, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const chapters = [
  {
    chapter: "Chapter 1",
    title: "The Knowledge Problem",
    subtitle: "Every company faces it",
    description: "Your best employee leaves. That new hire asks the same question for the fifth time. Critical processes live only in someone's head. Sound familiar?",
    visual: "problem",
    color: "#FF6B35",
  },
  {
    chapter: "Chapter 2",
    title: "Upload Everything",
    subtitle: "All your knowledge, one home",
    description: "Drag and drop your SOPs, training videos, PDFs, and documents. We support all major file formats. Your scattered knowledge finally has a home.",
    visual: "upload",
    color: "#FF6B35",
  },
  {
    chapter: "Chapter 3",
    title: "AI Organizes It",
    subtitle: "Smart categorization",
    description: "Our AI reads, understands, and organizes your content automatically. Create logical categories and let AI suggest the best structure for your team.",
    visual: "organize",
    color: "#C8A96E",
  },
  {
    chapter: "Chapter 4",
    title: "Team Learns Instantly",
    subtitle: "Knowledge on demand",
    description: "Your team gets instant access. Track progress, get AI-powered answers, and watch onboarding time drop by 60%. Questions answered in seconds, not days.",
    visual: "learn",
    color: "#10B981",
  },
]

function ProblemVisual() {
  const scattered = [
    { icon: "doc", label: "SOP.pdf", x: 10, y: 15, rotate: -15 },
    { icon: "video", label: "Training.mp4", x: 70, y: 10, rotate: 10 },
    { icon: "email", label: "Process Email", x: 20, y: 60, rotate: 5 },
    { icon: "doc", label: "Guide.docx", x: 65, y: 70, rotate: -8 },
    { icon: "brain", label: "In someone's head", x: 40, y: 40, rotate: 0 },
  ]

  return (
    <div className="relative h-full w-full p-6">
      {scattered.map((item, i) => (
        <motion.div
          key={item.label}
          className="absolute flex items-center gap-2 px-3 py-2 bg-[#2C2723] rounded-lg border border-white/10 text-xs text-white/70"
          style={{ left: `${item.x}%`, top: `${item.y}%`, rotate: `${item.rotate}deg` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -5, 0],
          }}
          transition={{ 
            delay: i * 0.15,
            y: { duration: 2 + i * 0.3, repeat: Infinity }
          }}
        >
          {item.icon === "brain" && <Sparkles size={14} className="text-[#FF6B35]" />}
          {item.icon === "doc" && <div className="w-3 h-4 bg-blue-400 rounded-sm" />}
          {item.icon === "video" && <Play size={14} className="text-red-400" />}
          {item.icon === "email" && <div className="w-3 h-3 bg-yellow-400 rounded-full" />}
          {item.label}
        </motion.div>
      ))}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-4xl text-white/20 font-bold">?</span>
      </motion.div>
    </div>
  )
}

function UploadVisual() {
  const [uploaded, setUploaded] = useState(0)
  
  return (
    <div className="relative h-full flex flex-col items-center justify-center gap-4 p-6">
      <motion.div
        className="w-full max-w-xs h-32 border-2 border-dashed border-[#FF6B35]/40 rounded-2xl flex flex-col items-center justify-center bg-[#2C2723]/50 cursor-pointer"
        animate={{ 
          borderColor: ["rgba(255,107,53,0.4)", "rgba(255,107,53,0.8)", "rgba(255,107,53,0.4)"],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setUploaded(u => Math.min(u + 1, 3))}
      >
        <Upload className="text-[#FF6B35] mb-2" size={32} />
        <span className="text-sm text-white/60">Click or drag files here</span>
        <span className="text-xs text-white/40 mt-1">PDF, Video, Audio, Docs</span>
      </motion.div>
      
      {/* Uploaded files */}
      <div className="w-full max-w-xs space-y-2">
        {[
          { name: "Onboarding Guide.pdf", size: "2.4 MB" },
          { name: "Sales Process.mp4", size: "45 MB" },
          { name: "Company Policies.docx", size: "156 KB" },
        ].slice(0, uploaded).map((file, i) => (
          <motion.div
            key={file.name}
            className="flex items-center gap-3 p-2 bg-[#2C2723] rounded-lg border border-green-500/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Check size={16} className="text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{file.name}</div>
              <div className="text-xs text-white/40">{file.size}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function OrganizeVisual() {
  const categories = [
    { name: "Sales Training", count: 12, color: "#FF6B35" },
    { name: "HR Onboarding", count: 8, color: "#C8A96E" },
    { name: "Product Knowledge", count: 15, color: "#10B981" },
  ]
  
  return (
    <div className="h-full p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[#C8A96E]" />
        <span className="text-xs text-[#C8A96E]">AI Organizing...</span>
      </div>
      <div className="space-y-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            className="group relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2, type: "spring" }}
          >
            <div className="flex items-center gap-3 p-3 bg-[#2C2723] rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
              <motion.div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}20` }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              >
                <FolderOpen size={18} style={{ color: cat.color }} />
              </motion.div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{cat.name}</div>
                <div className="text-xs text-white/40">{cat.count} files</div>
              </div>
              <ArrowRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function LearnVisual() {
  const [query, setQuery] = useState("")
  const fullQuery = "How do I handle returns?"
  
  return (
    <div className="h-full p-6 flex flex-col">
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <motion.input
          type="text"
          value={query}
          readOnly
          placeholder="Ask anything..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#2C2723] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none"
        />
        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Zap size={16} className="text-[#FF6B35]" />
        </motion.div>
      </div>
      
      {/* Typewriter effect */}
      <motion.div
        onAnimationComplete={() => {}}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {fullQuery.split("").map((char, i) => (
          <motion.span
            key={i}
            className="text-sm text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            onAnimationComplete={() => {
              if (i === fullQuery.length - 1) {
                setTimeout(() => setQuery(fullQuery), 100)
              }
            }}
          />
        ))}
      </motion.div>
      
      {/* AI Response */}
      <motion.div
        className="flex-1 bg-gradient-to-br from-[#FF6B35]/10 to-[#C8A96E]/10 rounded-xl p-4 border border-[#FF6B35]/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#C8A96E] flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-xs text-white/60">AI Assistant</span>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">
          Based on our Returns Policy document, customers can return items within 30 days. Here are the steps...
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-[#C8A96E]">
          <span>Source: Returns_Policy.pdf</span>
        </div>
      </motion.div>
    </div>
  )
}

function ChapterCard({ chapter, index }: { chapter: typeof chapters[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const isEven = index % 2 === 0

  const visuals: Record<string, JSX.Element> = {
    problem: <ProblemVisual />,
    upload: <UploadVisual />,
    organize: <OrganizeVisual />,
    learn: <LearnVisual />,
  }

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col lg:flex-row items-center gap-12 ${isEven ? "" : "lg:flex-row-reverse"}`}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Text */}
      <div className={`flex-1 ${isEven ? "lg:text-left" : "lg:text-right"}`}>
        <motion.span
          className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-wider mb-4"
          style={{ backgroundColor: `${chapter.color}20`, color: chapter.color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {chapter.chapter}
        </motion.span>
        <h3 className="font-sans font-bold text-3xl lg:text-4xl text-white mb-2">{chapter.title}</h3>
        <p className="text-lg text-[#C8A96E] mb-4">{chapter.subtitle}</p>
        <p className="text-[#78716C] text-lg leading-relaxed max-w-lg">{chapter.description}</p>
      </div>

      {/* Visual */}
      <div className="flex-1 w-full">
        <motion.div
          className="relative h-80 bg-[#1C1917] rounded-3xl border border-white/10 overflow-hidden"
          style={{ boxShadow: `0 0 60px ${chapter.color}10` }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {/* Glow */}
          <div 
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px]"
            style={{ backgroundColor: `${chapter.color}30` }}
          />
          {visuals[chapter.visual]}
        </motion.div>
      </div>
    </motion.div>
  )
}

export function HowItWorks() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"])

  return (
    <section id="how-it-works" ref={containerRef} className="relative py-32 bg-[#0F0E0D] overflow-hidden">
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-sm font-medium mb-6">
            The Story
          </span>
          <h2 className="font-sans font-extrabold text-4xl md:text-6xl text-white tracking-tight mb-6">
            From chaos to clarity
          </h2>
          <p className="text-xl text-[#78716C] max-w-2xl mx-auto">
            See how Arambh transforms scattered company knowledge into an organized, searchable brain for your entire team.
          </p>
        </motion.div>

        {/* Timeline line */}
        <div className="absolute left-1/2 top-[400px] bottom-48 w-px bg-white/5 -translate-x-1/2 hidden lg:block">
          <motion.div
            className="w-full bg-gradient-to-b from-[#FF6B35] via-[#C8A96E] to-[#10B981]"
            style={{ height: lineHeight }}
          />
        </div>

        {/* Chapters */}
        <div className="space-y-32">
          {chapters.map((chapter, index) => (
            <ChapterCard key={chapter.chapter} chapter={chapter} index={index} />
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          className="mt-32 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">Ready to write your success story?</h3>
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] text-white font-semibold rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/register")}
          >
            Start Free Trial
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
