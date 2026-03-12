"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Search, LayoutGrid } from "lucide-react"
import { useInteractivity, fadeInUp } from "@/lib/interactivity-helpers"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const easeExpo = [0.16, 1, 0.3, 1]

type ApiCategory = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  lesson_count?: number | null
  completion_percent?: number | null
}

type Category = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  lessonCount: number
  completionPercent: number
}

const mapApiCategory = (c: ApiCategory): Category => ({
  id: c.id,
  name: c.name,
  description: c.description ?? "",
  icon: c.icon ?? "📁",
  color: c.color ?? "#FF6B35",
  lessonCount: typeof c.lesson_count === "number" ? c.lesson_count : 0,
  completionPercent:
    typeof c.completion_percent === "number" ? c.completion_percent : 0,
})

// Add New Category Modal
function AddCategoryModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (values: {
    name: string
    description: string
    color: string
    file: File | null
    imageUrl: string
  }) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#FF6B35")
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }

    try {
      setIsSubmitting(true)
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        color: color.trim() || "#FF6B35",
        file,
        imageUrl: imageUrl.trim(),
      })
      setName("")
      setDescription("")
      setColor("#FF6B35")
      setFile(null)
      setImageUrl("")
      onClose()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <motion.div
            className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 30 }}
          >
            <h2 className="text-xl font-bold text-[#1C1917] mb-4">
              Add New Category
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#1C1917]">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sales Training"
                  className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1C1917]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for this category"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1C1917]">
                  Thumbnail
                </label>
                <p className="text-xs text-[#78716C] mb-2">Upload a file or paste an image URL</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    setFile(f)
                    if (f) setImageUrl("")
                  }}
                  className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#FF6B35]/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-[#FF6B35]"
                />
                {file && (
                  <p className="mt-1 text-xs text-[#78716C] truncate">
                    {file.name}
                  </p>
                )}
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-[#E7E5E4]" />
                  <span className="text-xs text-[#A8A29E]">OR</span>
                  <div className="flex-1 h-px bg-[#E7E5E4]" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value)
                    if (e.target.value.trim()) setFile(null)
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none text-sm"
                />
                {(file || imageUrl.trim()) && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-[#E7E5E4] h-24 bg-[#FAF9F7] flex items-center justify-center">
                    <img
                      src={file ? URL.createObjectURL(file) : imageUrl.trim()}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[#1C1917]">
                  Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-[48px] w-full rounded-lg border border-[#E7E5E4] bg-white px-2"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg border border-[#E7E5E4] text-[#1C1917] font-medium hover:bg-[#FAF9F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-lg bg-[#FF6B35] text-white font-medium hover:bg-[#E55A24] disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function CategoriesPage() {
  const { user } = useAuth()
  const { navigateTo } = useInteractivity()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = async () => {
    if (!user?.orgId) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/categories?orgId=${encodeURIComponent(user.orgId)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to load categories.")
      }
      const data = await res.json()
      const apiCategories: ApiCategory[] = data.categories ?? []
      setCategories(apiCategories.map(mapApiCategory))
      setError(null)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load categories.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    void loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.orgId])

  const handleCategoryClick = (categoryId: string) => {
    navigateTo(`/dashboard/categories/${categoryId}`)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to delete category.")
      }
      setCategories((prev) => prev.filter((c) => c.id !== categoryId))
      toast.success("Category deleted")
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to delete category")
    }
  }

  const handleCreateCategory = async (values: {
    name: string
    description: string
    color: string
    file: File | null
    imageUrl: string
  }) => {
    if (!user?.orgId || !user.id) {
      throw new Error("You must be logged in as an admin to create categories.")
    }

    let iconValue: string | null = null

    if (values.imageUrl) {
      iconValue = values.imageUrl
    } else if (values.file) {
      try {
        const formData = new FormData()
        formData.append("file", values.file)
        formData.append("orgId", user.orgId)

        const uploadRes = await fetch("/api/upload/category-image", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => null)
          throw new Error(data?.error || "Failed to upload category image.")
        }

        const uploadData = await uploadRes.json()
        iconValue = uploadData.imageUrl ?? null
      } catch (e: any) {
        console.error("Category thumbnail upload failed:", e)
        toast.error(e?.message || "Thumbnail upload failed.")
      }
    }

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orgId: user.orgId,
        name: values.name,
        description: values.description || null,
        icon: iconValue,
        color: values.color || null,
        createdBy: user.id,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || "Failed to create category.")
    }

    const data = await res.json()
    const apiCategory: ApiCategory | undefined = data.category
    if (apiCategory) {
      setCategories((prev) => [mapApiCategory(apiCategory), ...prev])
    } else {
      // Fallback: reload list
      await loadCategories()
    }

    toast.success(`Category "${values.name}" created successfully!`)
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalLessons = categories.reduce((acc, cat) => acc + cat.lessonCount, 0)
  const avgCompletion =
    categories.length === 0
      ? 0
      : Math.round(
          categories.reduce((a, c) => a + c.completionPercent, 0) /
            categories.length
        )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: easeExpo }}
      >
        <div>
          <h1 className="text-3xl font-bold text-[#1C1917]">Categories</h1>
          <p className="text-[#78716C] mt-1">Manage your training categories</p>
        </div>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white rounded-xl font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Add Category
        </motion.button>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Total Categories", value: categories.length },
          { label: "Total Lessons", value: totalLessons },
          { label: "Avg. Completion", value: `${avgCompletion}%` },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl border border-[#E7E5E4] p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <p className="text-sm text-[#78716C]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1C1917] mt-1">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-12 pr-4 py-3 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none"
        />
      </motion.div>

      {/* Error / Loading */}
      {loading && (
        <div className="text-sm text-[#78716C]">Loading categories…</div>
      )}
      {error && !loading && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {!loading &&
            filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                className="bg-white rounded-2xl border border-[#E7E5E4] cursor-pointer group hover:shadow-lg transition-all overflow-hidden"
                onClick={() => handleCategoryClick(category.id)}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden">
                  {category.icon?.startsWith("http") ||
                  category.icon?.startsWith("data:") ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-5xl"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      {category.icon || "📁"}
                    </div>
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)",
                    }}
                  />
                  {/* Action buttons overlaid on image */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.info("Edit feature coming soon")
                      }}
                      className="p-1.5 bg-white/90 backdrop-blur rounded-lg hover:bg-white"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleDeleteCategory(category.id)
                      }}
                      className="p-1.5 bg-white/90 backdrop-blur rounded-lg hover:bg-white text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#1C1917] mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[#78716C] mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#78716C]">
                        {category.lessonCount} lessons
                      </span>
                      <span className="font-semibold text-[#1C1917]">
                        {category.completionPercent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#E7E5E4] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${category.completionPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && !error && filteredCategories.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <LayoutGrid size={48} className="mx-auto text-[#E7E5E4] mb-4" />
          <h3 className="text-xl font-bold text-[#1C1917] mb-2">
            No categories found
          </h3>
          <p className="text-[#78716C] mb-6">
            {searchQuery
              ? "Try a different search"
              : "Create your first category to get started"}
          </p>
          {!searchQuery && (
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Category
            </motion.button>
          )}
        </motion.div>
      )}

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCategory}
      />
    </div>
  )
}
