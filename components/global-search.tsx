"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowDown, ArrowUp, User, LayoutGrid, Play } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useApp } from "@/lib/store"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type SearchResult = {
  id: string
  label: string
  description?: string
  href: string
  type: "lesson" | "category" | "user"
}

const RECENT_KEY = "arambh_recent_searches"

export function GlobalSearch() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [recent, setRecent] = useState<string[]>([])

  const isOpen = state.isSearchOpen

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
      if (Array.isArray(stored)) {
        setRecent(stored.slice(0, 5))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (isMetaK) {
        event.preventDefault()
        dispatch({ type: "SET_SEARCH_OPEN", payload: true })
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [dispatch])

  const results: SearchResult[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const lessonResults: SearchResult[] = state.lessons.map((lesson) => ({
      id: `lesson-${lesson.id}`,
      label: lesson.title,
      description: lesson.description,
      href: `/learn/content/${lesson.id}`,
      type: "lesson",
    }))

    const categoryResults: SearchResult[] = state.categories.map((cat) => ({
      id: `category-${cat.id}`,
      label: cat.name,
      description: cat.description,
      href: `/learn/categories/${cat.id}`,
      type: "category",
    }))

    const userResults: SearchResult[] =
      state.currentUser?.role === "ADMIN"
        ? state.users.map((user) => ({
            id: `user-${user.id}`,
            label: user.name,
            description: user.email,
            href: `/dashboard/users?focus=${user.id}`,
            type: "user",
          }))
        : []

    const all = [...lessonResults, [...categoryResults], ...userResults].flat()
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)),
    )
  }, [query, state.categories, state.currentUser?.role, state.lessons, state.users])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query, results.length])

  const close = () => {
    dispatch({ type: "SET_SEARCH_OPEN", payload: false })
    setQuery("")
  }

  const persistRecent = (value: string) => {
    if (!value.trim()) return
    const updated = [value.trim(), ...recent.filter((r) => r !== value.trim())].slice(0, 5)
    setRecent(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    }
  }

  const runNavigation = (result: SearchResult) => {
    persistRecent(query || result.label)
    close()
    router.push(result.href)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIdx((prev) => (prev + 1) % Math.max(results.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIdx((prev) =>
        prev - 1 < 0 ? Math.max(results.length - 1, 0) : prev - 1,
      )
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results.length && results[selectedIdx]) {
        runNavigation(results[selectedIdx])
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      close()
    }
  }

  const renderIcon = (type: SearchResult["type"]) => {
    if (type === "lesson") return <Play className="h-3.5 w-3.5" />
    if (type === "category") return <LayoutGrid className="h-3.5 w-3.5" />
    return <User className="h-3.5 w-3.5" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-lg border border-[#E7E5E4] bg-[#FAF9F7] p-0 shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-[#E7E5E4] px-4 py-2.5">
          <Search className="h-4 w-4 text-[#78716C]" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, categories, people..."
            className="h-8 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
          <kbd className="ml-auto inline-flex items-center gap-0.5 rounded-md border border-[#D6D3D1] bg-[#F5F5F4] px-1.5 py-0.5 text-[10px] font-medium text-[#57534E]">
            ⌘/Ctrl K
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-hidden">
          {query && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <p className="text-sm font-medium text-[#44403C]">
                No results for &quot;{query}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  close()
                  router.push("/learn/ai-chat")
                }}
                className="text-xs font-semibold text-[#FF6B35] hover:text-[#EA580C]"
              >
                Try Arambh AI
              </button>
            </div>
          ) : (
            <>
              {results.length > 0 && (
                <div className="px-3 pt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#A8A29E]">
                  Results
                </div>
              )}
              <div className="mt-1 space-y-0.5 px-1 pb-2">
                <AnimatePresence initial={false}>
                  {results.slice(0, 10).map((result, index) => (
                    <motion.button
                      key={result.id}
                      type="button"
                      onClick={() => runNavigation(result)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, delay: index * 0.025 }}
                      className={`flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-xs ${
                        index === selectedIdx ? "bg-[#E7E5E4]" : "hover:bg-[#F3F0EA]"
                      }`}
                    >
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E7E5E4] text-[#44403C]">
                        {renderIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-semibold text-[#1C1917] line-clamp-1">
                          {result.label}
                        </p>
                        {result.description && (
                          <p className="mt-0.5 text-[10px] text-[#78716C] line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {!query && recent.length > 0 && (
            <div className="border-t border-[#E7E5E4] px-4 py-2.5">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A8A29E]">
                  Recent searches
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="rounded-full bg-[#E7E5E4] px-2.5 py-1 text-[10px] text-[#44403C] hover:bg-[#D6D3D1]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#E7E5E4] px-4 py-1.5 text-[10px] text-[#A8A29E]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5">
              <ArrowDown className="h-3 w-3" /> <ArrowUp className="h-3 w-3" /> move
            </span>
            <span className="inline-flex items-center gap-0.5">
              <kbd className="rounded border border-[#D6D3D1] bg-[#F5F5F4] px-1">Enter</kbd>{" "}
              select
            </span>
          </div>
          <span>Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

