"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export type RealtimeNotification = {
  id: string
  user_id: string
  org_id: string
  title: string
  message: string
  type: string | null
  is_read: boolean
  created_at: string
}

export function useRealtimeNotifications(userId?: string | null) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function loadInitial() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) {
          console.error("notifications initial fetch error:", error)
          return
        }
        if (!cancelled && data) {
          setNotifications(data as RealtimeNotification[])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitial()

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const notif = payload.new as RealtimeNotification
          setNotifications(prev => [notif, ...prev])
          toast.info(notif.title || "New notification", {
            description: notif.message,
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markRead = async (id?: string) => {
    if (!userId) return

    try {
      if (id) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, is_read: true } : n)),
        )
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id)
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId)
      }
    } catch (e) {
      console.error("markRead error:", e)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
  }
}

