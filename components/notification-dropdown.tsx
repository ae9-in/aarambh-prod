"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { useRealtimeNotifications } from "@/lib/hooks/use-realtime-notifications"
import { toast } from "sonner"

export function NotificationDropdown() {
  const router = useRouter()
  const { user } = useAuth()
  const { notifications, unreadCount, markRead } = useRealtimeNotifications(user?.id)

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [notifications],
  )

  const handleMarkAll = async () => {
    if (!unreadCount) return
    await markRead()
    toast.success("All notifications marked as read")
  }

  const navigateByType = (notif: typeof sorted[number]) => {
    const type = notif.type ?? ""
    if (type === "content" && (notif as any).content_id) {
      router.push(`/learn/content/${(notif as any).content_id}`)
    } else if (type === "quiz" && (notif as any).quiz_id) {
      router.push(`/learn/quiz/${(notif as any).quiz_id}`)
    } else if (type === "badge") {
      router.push("/learn/profile")
    } else if (type === "assignment") {
      router.push("/learn/categories")
    }
  }

  const handleItemClick = async (notif: typeof sorted[number]) => {
    await markRead(notif.id)
    navigateByType(notif)
  }

  const resolveTypeColor = (type: string | null) => {
    switch (type) {
      case "success":
      case "achievement":
        return "bg-emerald-500/80"
      case "warning":
        return "bg-amber-400"
      case "error":
        return "bg-rose-500"
      default:
        return "bg-sky-500"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8E6E1] text-[#1C1917] transition-colors hover:bg-[#D6D3D1]"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
                className="absolute -top-0.5 -right-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_0_0_2px_rgba(245,243,240,1)]"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[320px] border-none bg-[#1C1917] p-0 text-xs text-[#E7E5E4]"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Notifications</p>
            <p className="text-[11px] text-[#A8A29E]">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAll}
            className="text-[11px] font-medium text-[#F97316] hover:text-[#FDBA74] disabled:opacity-40"
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </div>

        {sorted.length === 0 || (unreadCount === 0 && sorted.every((n) => n.is_read)) ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-center">
            <span className="text-lg">✓</span>
            <p className="text-sm font-semibold text-emerald-300">All caught up!</p>
            <p className="text-[11px] text-[#A8A29E]">No new notifications right now.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[320px]">
            <div className="divide-y divide-white/5">
              {sorted.slice(0, 5).map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleItemClick(notif)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                    !notif.is_read ? "border-l-[3px] border-amber-400/90 pl-[13px]" : "pl-4"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-7 w-7 flex-shrink-0 rounded-full ${resolveTypeColor(
                      notif.type,
                    )} flex items-center justify-center text-[11px] font-semibold text-white`}
                  >
                    {notif.type === "success" && "✓"}
                    {notif.type === "warning" && "!"}
                    {notif.type === "error" && "!"}
                    {!notif.type && "i"}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white line-clamp-1">
                      {notif.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[#D6D3D1]">
                      {notif.message}
                    </p>
                    <p className="mt-1 text-[10px] text-[#A8A29E]">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}

