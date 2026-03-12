"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  BookOpen,
  ChevronRight,
  Lock,
  Clock,
  Send,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  lesson_count: number
  hasAccess: boolean
  requestStatus?: 'pending' | 'approved' | 'rejected' | null
  rejectionReason?: string | null
}

function getThumbnailSrc(icon: string | null): string | null {
  if (!icon) return null
  const val = icon.trim()
  if (
    val.startsWith("http://") ||
    val.startsWith("https://") ||
    val.startsWith("data:")
  ) {
    return val
  }
  return null
}

export default function CategoriesPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [requestModalCategory, setRequestModalCategory] = useState<Category | null>(null)
  const [requestReason, setRequestReason] = useState("")

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    if (!user.orgId || !user.id) {
      setLoading(false)
      return
    }

    const loadCategories = async () => {
      try {
        setLoading(true)
        const allRes = await fetch(`/api/categories?orgId=${user.orgId}`)
        
        if (!allRes.ok) {
          const errorData = await allRes.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to load categories')
        }
        
        const allData = await allRes.json()
        const allCategories = allData.categories || []

        if (allCategories.length === 0) {
          setCategories([])
          setLoading(false)
          return
        }

        const res = await fetch(
          `/api/categories?orgId=${user.orgId}&userId=${user.id}&userRole=${user.role}`
        )
        
        const data = await res.json()
        const accessibleCategories = data.categories || []

        let requests: any[] = []
        try {
          const requestsRes = await fetch(
            `/api/access-requests?orgId=${user.orgId}&userId=${user.id}`
          )
          if (requestsRes.ok) {
            const requestsData = await requestsRes.json()
            requests = requestsData.requests || []
          }
        } catch {
          // Optional call; categories still render without request states.
        }

        const combinedCategories = allCategories.map((cat: any) => {
          const hasAccess = accessibleCategories.some((c: any) => c.id === cat.id)
          const request = requests.find((r: any) => r.category_id === cat.id)
          
          return {
            ...cat,
            hasAccess,
            requestStatus: request?.status || null,
            rejectionReason: request?.review_note || null,
          }
        })

        setCategories(combinedCategories)
      } catch (e: any) {
        toast.error(e.message || 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [user, user?.orgId, user?.id, user?.role])

  const handleRequestAccess = async (categoryId: string, reason: string) => {
    if (!user?.orgId || !user?.id) return

    try {
      setRequestingId(categoryId)
      
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          userId: user.id,
          orgId: user.orgId,
          reason,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to request access')
      }

      toast.success('Access request sent! Admin will review it soon.')
      
      // Update local state
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, requestStatus: 'pending', rejectionReason: null }
            : cat
        )
      )
      setRequestModalCategory(null)
      setRequestReason("")
    } catch (e: any) {
      toast.error(e.message || 'Failed to send request')
    } finally {
      setRequestingId(null)
    }
  }

  const accessibleCategories = categories.filter((c) => c.hasAccess)
  const searchableAccessibleCategories = accessibleCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const lockedCategories = categories.filter((c) => !c.hasAccess)

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-[#FF6B35]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C1917] mb-3">
            Please Log In
          </h2>
          <p className="text-[#78716C] mb-6">
            You need to be logged in to view training categories and access your learning materials.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <motion.button
                className="px-6 py-3 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#E55A24] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Log In
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                className="px-6 py-3 bg-white border border-[#E7E5E4] text-[#1C1917] font-medium rounded-xl hover:bg-[#F5F5F4] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Register
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Missing orgId or id state
  if (user && (!user.orgId || !user.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C1917] mb-3">
            Session Expired
          </h2>
          <p className="text-[#78716C] mb-6">
            Your session is missing organization information. Please log out and log back in to fix this.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                window.location.href = '/login'
              }}
              className="px-6 py-3 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#E55A24] transition-colors"
            >
              Log Out
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-4">
        <div className="h-8 bg-[#E7E5E4] rounded-lg w-1/3 animate-pulse mb-6" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-[#E7E5E4] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-[#1C1917]">Categories</h1>
          <p className="text-sm text-[#78716C] mt-1">
            Browse all training categories
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]"
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-[#E7E5E4] text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
          />
        </motion.div>

        {/* Accessible Categories */}
        {searchableAccessibleCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#78716C] mb-3 uppercase tracking-wide">
              Available Categories
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {searchableAccessibleCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/learn/categories/${category.id}`}>
                      <motion.div
                        className="relative bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden"
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onHoverStart={() => setSelectedCategory(category.id)}
                        onHoverEnd={() => setSelectedCategory(null)}
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative h-36 overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${category.color || '#FF6B35'}20 0%, ${category.color || '#FF6B35'}40 100%)`,
                          }}
                        >
                          {getThumbnailSrc(category.icon) ? (
                            <img
                              src={getThumbnailSrc(category.icon)!}
                              alt={category.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen size={38} className="text-[#FF6B35]/70" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-[#1C1917] text-sm mb-1 line-clamp-1">
                            {category.name}
                          </h3>
                          <p className="text-[10px] text-[#78716C] mb-2 line-clamp-1">
                            {category.description || 'Explore this category'}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#78716C] flex items-center gap-1">
                              <BookOpen size={10} />
                              {category.lesson_count || 0} lessons
                            </span>
                            <motion.div
                              animate={{ x: selectedCategory === category.id ? 4 : 0 }}
                            >
                              <ChevronRight size={14} className="text-[#FF6B35]" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Locked Categories */}
        {!searchQuery && lockedCategories.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[#78716C] mb-3 uppercase tracking-wide">
              Locked Categories
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {lockedCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white/50 rounded-2xl border border-[#E7E5E4] overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    {category.requestStatus === "pending" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">
                        Pending
                      </span>
                    ) : category.requestStatus === "rejected" ? (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-medium text-red-700">
                        Rejected
                      </span>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1C1917]/80 flex items-center justify-center">
                        <Lock size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div
                    className="relative h-36 overflow-hidden opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${category.color || '#FF6B35'}10 0%, ${category.color || '#FF6B35'}20 100%)`,
                    }}
                  >
                    {getThumbnailSrc(category.icon) ? (
                      <img
                        src={getThumbnailSrc(category.icon)!}
                        alt={category.name}
                        className="h-full w-full object-cover grayscale"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen size={38} className="text-[#78716C]/70" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1C1917] text-sm mb-1 line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-[10px] text-[#78716C] mb-3 line-clamp-1">
                      {category.description || 'Request access to view'}
                    </p>

                    {/* Request Button */}
                    {category.requestStatus === 'pending' ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Clock size={12} />
                        Pending Approval
                      </button>
                    ) : category.requestStatus === 'rejected' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-red-600">
                          <XCircle size={12} />
                          <span>Rejected</span>
                        </div>
                        {category.rejectionReason && (
                          <p className="text-[10px] text-[#78716C] line-clamp-2">
                            {category.rejectionReason}
                          </p>
                        )}
                        <motion.button
                          onClick={() => setRequestModalCategory(category)}
                          disabled={requestingId === category.id}
                          className="w-full py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#E55A24] transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Send size={12} />
                          Request Again
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => setRequestModalCategory(category)}
                        disabled={requestingId === category.id}
                        className="w-full py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#E55A24] transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {requestingId === category.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            Request Access
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - No Categories At All */}
        {categories.length === 0 && !searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF6B35]/10 mx-auto mb-4 flex items-center justify-center">
              <BookOpen size={24} className="text-[#FF6B35]" />
            </div>
            <p className="text-[#1C1917] font-medium">No training categories available yet</p>
            <p className="text-sm text-[#78716C] mt-2 max-w-sm mx-auto">
              The admin hasn't created any training categories. Please check back later or contact your administrator.
            </p>
          </motion.div>
        )}

        {/* Empty State - Search Results */}
        {categories.length > 0 && !!searchQuery && searchableAccessibleCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-[#E7E5E4] mx-auto mb-4 flex items-center justify-center">
              <Search size={24} className="text-[#78716C]" />
            </div>
            <p className="text-[#78716C]">No categories found</p>
            <p className="text-sm text-[#A8A29E] mt-1">
              Search only shows categories you already have access to.
            </p>
          </motion.div>
        )}

        {/* Access Request Modal */}
        <AnimatePresence>
          {requestModalCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
              onClick={() => {
                if (!requestingId) {
                  setRequestModalCategory(null)
                  setRequestReason("")
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-[#1C1917]">Request Access</h3>
                <p className="mt-1 text-sm text-[#78716C]">
                  Tell admin why you need access to{" "}
                  <span className="font-medium text-[#1C1917]">{requestModalCategory.name}</span>.
                </p>

                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  rows={4}
                  placeholder="Example: I need this category for my current project tasks."
                  className="mt-4 w-full rounded-xl border border-[#E7E5E4] p-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                />

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!requestingId) {
                        setRequestModalCategory(null)
                        setRequestReason("")
                      }
                    }}
                    className="rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm text-[#78716C] hover:bg-[#F5F5F4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void handleRequestAccess(
                        requestModalCategory.id,
                        requestReason.trim() || "Need access for learning goals.",
                      )
                    }
                    disabled={requestingId === requestModalCategory.id}
                    className="rounded-lg bg-[#FF6B35] px-3 py-2 text-sm font-medium text-white hover:bg-[#E55A24] disabled:opacity-60"
                  >
                    {requestingId === requestModalCategory.id ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
