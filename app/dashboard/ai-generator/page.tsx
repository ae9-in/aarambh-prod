"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"
import { useInteractivity } from "@/lib/interactivity-helpers"
import { toast } from "sonner"
import { Copy, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const easeExpo = [0.16, 1, 0.3, 1]

export default function AIGeneratorPage() {
  const { state } = useApp()
  const { addContent } = useInteractivity()
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("professional")
  const [targetRole, setTargetRole] = useState("Employee")
  const [contentType, setContentType] = useState("training")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDoc, setGeneratedDoc] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [recent, setRecent] = useState<any[]>([])

  const MOCK_DOCS = {
    safety: `# Shop Floor Safety Rules\n\n## Overview\nSafety is our top priority.\n\n## Key Points\n- Identify hazards\n- Follow PPE protocols\n- Report incidents\n\n## Compliance\nAll workers must follow these rules.`,
    sales: `# Sales Pitch Mastery\n\n## Overview\nEffective selling starts with preparation.\n\n## 5-Step Pitch\n1. Build rapport\n2. Identify needs\n3. Present solution\n4. Handle objections\n5. Close the deal`,
    customer: `# Customer Service Excellence\n\n## Overview\nEvery interaction matters.\n\n## Key Principles\n- Active listening\n- Empathy first\n- Problem solving`,
    default: `# Professional Training Guide\n\n## Overview\nThis training covers essential topics.\n\n## Objectives\n- Understand the process\n- Apply best practices`
  }

  const getDoc = (t) => {
    if (t.toLowerCase().includes("safety")) return MOCK_DOCS.safety
    if (t.toLowerCase().includes("sales") || t.toLowerCase().includes("pitch")) return MOCK_DOCS.sales
    if (t.toLowerCase().includes("customer") || t.toLowerCase().includes("service")) return MOCK_DOCS.customer
    return MOCK_DOCS.default
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem("arambh_generations")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecent(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error("Enter a topic"); return }
    setIsGenerating(true)
    setGeneratedDoc("")
    toast.info("Generating content...")
    
    const doc = getDoc(topic)
    let i = 0
    const interval = setInterval(() => {
      i += 3
      setGeneratedDoc(doc.slice(0, i))
      setWordCount(doc.slice(0, i).split(" ").length)
      if (i >= doc.length) {
        clearInterval(interval)
        setIsGenerating(false)
        toast.success("Content generated!")
      }
    }, 20)
  }

  const handleSave = () => {
    if (!selectedCategory) { toast.error("Select a category"); return }
    addContent({ id: Date.now().toString(), title: topic || "AI Generated", type: "NOTE", categoryId: selectedCategory, description: generatedDoc.slice(0, 100), xpReward: 50, progress: 0, duration: "5 min", thumbnail: null })
    toast.success("Content saved!")
    const entry = { topic, timestamp: new Date().toISOString(), wordCount }
    setRecent(prev => {
      const updated = [entry, ...prev].slice(0, 5)
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("arambh_generations", JSON.stringify(updated))
        } catch {
          // ignore
        }
      }
      return updated
    })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <h1 className="text-3xl font-bold text-[#1C1917]">AI Content Generator</h1>
        <p className="text-[#78716C] mt-1">Generate training content instantly</p>
      </motion.div>

      <motion.div className="grid lg:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {/* Settings */}
        <motion.div className="lg:col-span-1 bg-white rounded-xl border border-[#E7E5E4] p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-bold text-[#1C1917] mb-4 flex items-center gap-2"><Zap size={20} className="text-[#FF6B35]" /> Settings</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg" />
            
            <div>
              <label className="text-xs font-medium text-[#78716C] mb-2 block">Tone</label>
              <div className="flex gap-2">{["professional", "casual", "formal"].map(t => (<button key={t} onClick={() => setTone(t)} className={`px-3 py-1 text-xs rounded-lg ${tone === t ? "bg-[#FF6B35] text-white" : "bg-[#E7E5E4]"}`}>{t}</button>))}</div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{state.categories.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>

            <motion.button onClick={handleGenerate} disabled={isGenerating} className="w-full py-2 bg-[#FF6B35] text-white rounded-lg font-medium disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {isGenerating ? "Generating..." : "Generate"}
            </motion.button>
          </div>
        </motion.div>

        {/* Editor */}
        <motion.div className="lg:col-span-2 bg-white rounded-xl border border-[#E7E5E4] p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1C1917]">Generated Content</h2>
            <div className="flex gap-2">
              {generatedDoc && <motion.button onClick={() => { navigator.clipboard.writeText(generatedDoc); toast.success("Copied!") }} className="p-2 hover:bg-[#E7E5E4] rounded-lg"><Copy size={18} /></motion.button>}
              {generatedDoc && <motion.button onClick={handleSave} className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium">Save</motion.button>}
            </div>
          </div>
          <textarea value={generatedDoc} readOnly className="w-full h-64 p-3 border border-[#E7E5E4] rounded-lg bg-[#FAF9F7] text-sm font-mono focus:ring-2 focus:ring-[#FF6B35]/20" />
          <div className="mt-2 text-xs text-[#78716C]">{wordCount} words</div>
        </motion.div>
      </motion.div>

      {/* Recent */}
      {recent.length > 0 && (
        <motion.div className="bg-white rounded-xl border border-[#E7E5E4] p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-bold text-[#1C1917] mb-3">Recent Generations</h2>
          <div className="grid gap-2">
            {recent.map((r, i) => (<motion.button key={i} onClick={() => setTopic(r.topic)} className="text-left p-3 hover:bg-[#F5F5F4] rounded-lg border border-[#E7E5E4]"><p className="font-medium text-[#1C1917]">{r.topic}</p><p className="text-xs text-[#78716C]">{r.wordCount} words</p></motion.button>))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
