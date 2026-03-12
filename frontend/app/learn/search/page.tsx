"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Mic,
  BookOpen,
  FileText,
  Video,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react"

// Mock search data
const recentSearches = [
  "Safety protocols",
  "Emergency procedures",
  "Quality control",
  "Customer service",
]

const trendingTopics = [
  { id: 1, title: "Fire Safety", searchCount: "1.2k searches" },
  { id: 2, title: "Product Training", searchCount: "890 searches" },
  { id: 3, title: "Communication Skills", searchCount: "756 searches" },
  { id: 4, title: "First Aid", searchCount: "543 searches" },
]

const allContent = [
  { id: 1, title: "Shop Floor Safety Rules", category: "Safety Training", type: "video", duration: "12 min" },
  { id: 2, title: "Fire Emergency Procedures", category: "Safety Training", type: "document", duration: "5 min" },
  { id: 3, title: "Customer Service Excellence", category: "Soft Skills", type: "video", duration: "18 min" },
  { id: 4, title: "Quality Check Process", category: "Operations", type: "quiz", duration: "10 min" },
  { id: 5, title: "Product Knowledge A-Z", category: "Products", type: "video", duration: "25 min" },
  { id: 6, title: "Communication Best Practices", category: "Soft Skills", type: "document", duration: "8 min" },
  { id: 7, title: "Safety Equipment Usage", category: "Safety Training", type: "video", duration: "15 min" },
  { id: 8, title: "Leadership Fundamentals", category: "Leadership", type: "video", duration: "20 min" },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video
    case "document":
      return FileText
    case "quiz":
      return Target
    default:
      return BookOpen
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof allContent>([])
  const [showAIResults, setShowAIResults] = useState(false)
  const router = useRouter()

  // Simulated search
  useEffect(() => {
    if (query.length >= 2) {
      const filtered = allContent.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
      setShowAIResults(true)
    } else {
      setSearchResults([])
      setShowAIResults(false)
    }
  }, [query])

  const handleVoiceSearch = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice search is not supported in your browser")
      return
    }

    const SpeechRecognition = 
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition || 
      window.SpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false

    setIsListening(true)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-[#1C1917] mb-4">Search</h1>

          {/* Search Input */}
          <div className={`relative transition-all ${isFocused ? "shadow-lg" : "shadow-sm"}`}>
            <Search
              size={20}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                isFocused ? "text-[#FF6B35]" : "text-[#78716C]"
              }`}
            />
            <input
              type="text"
              placeholder="Search lessons, quizzes, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="w-full pl-12 pr-20 py-4 bg-white rounded-2xl border border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => setQuery("")}
                  className="p-2 rounded-full text-[#78716C] hover:bg-[#E7E5E4]"
                >
                  <X size={18} />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition-colors ${
                  isListening ? "bg-[#FF6B35] text-white" : "text-[#78716C] hover:bg-[#E7E5E4]"
                }`}
              >
                <Mic size={18} className={isListening ? "animate-pulse" : ""} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* AI CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6 cursor-pointer"
          onClick={() => router.push("/learn/ai-chat")}
        >
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#FF6B35]/30 bg-gradient-to-br from-[#1C1917] to-[#2A211C] px-4 py-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316]/20">
                <Sparkles className="h-4 w-4 text-[#C8A96E]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#C8A96E]">
                  ✨ Ask Arambh AI
                </p>
                <p className="text-[11px] text-white/60">
                  Get instant answers from your training content.
                </p>
              </div>
            </div>
            <button className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E85520] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
              Ask →
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {query.length < 2 ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Recent Searches */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#1C1917] flex items-center gap-2">
                    <Clock size={16} className="text-[#78716C]" />
                    Recent Searches
                  </h2>
                  <button className="text-xs text-[#FF6B35] font-medium">Clear all</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setQuery(search)}
                      className="px-4 py-2 bg-white rounded-full border border-[#E7E5E4] text-sm text-[#1C1917] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <h2 className="text-sm font-semibold text-[#1C1917] flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-[#FF6B35]" />
                  Trending Topics
                </h2>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <motion.button
                      key={topic.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setQuery(topic.title)}
                      className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-[#E7E5E4] hover:border-[#FF6B35] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-xs font-bold text-[#FF6B35]">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-[#1C1917]">{topic.title}</span>
                      </div>
                      <span className="text-xs text-[#78716C]">{topic.searchCount}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* AI Quick Answer */}
              {showAIResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-br from-[#FF6B35]/10 to-[#FF8C5A]/10 rounded-2xl border border-[#FF6B35]/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-[#FF6B35]" />
                    <span className="text-xs font-semibold text-[#FF6B35]">AI Quick Answer</span>
                  </div>
                  <p className="text-sm text-[#1C1917]">
                    Based on your search for &quot;{query}&quot;, we found {searchResults.length} relevant
                    {searchResults.length === 1 ? " lesson" : " lessons"}. 
                    {searchResults.length > 0 && ` The top result is "${searchResults[0].title}" in ${searchResults[0].category}.`}
                  </p>
                </motion.div>
              )}

              {/* Search Results */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#1C1917]">
                  Results ({searchResults.length})
                </h2>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((result, index) => {
                    const TypeIcon = getTypeIcon(result.type)
                    return (
                      <Link key={result.id} href={`/learn/content/${result.id}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E7E5E4] hover:border-[#FF6B35] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                            <TypeIcon size={20} className="text-[#FF6B35]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-[#1C1917] truncate">
                              {result.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#78716C]">{result.category}</span>
                              <span className="w-1 h-1 rounded-full bg-[#78716C]" />
                              <span className="text-xs text-[#78716C]">{result.duration}</span>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-[#78716C]" />
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-[#E7E5E4] mx-auto mb-4 flex items-center justify-center">
                    <Search size={24} className="text-[#78716C]" />
                  </div>
                  <p className="text-[#78716C]">No results found</p>
                  <p className="text-sm text-[#A8A29E] mt-1">Try different keywords</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
