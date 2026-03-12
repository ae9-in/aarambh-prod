"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export type ContentRow = {
  id: string
  org_id: string
  category_id: string | null
  title: string | null
  type: string
  file_url: string | null
  firebase_path: string | null
  file_size: number | null
  duration_minutes?: number | null
  is_published?: boolean | null
  completion_count?: number | null
  created_at?: string
}

export function useRealtimeContent(orgId?: string | null) {
  const [content, setContent] = useState<ContentRow[]>([])

  useEffect(() => {
    if (!orgId) return

    let cancelled = false

    async function loadInitial() {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("content initial fetch error:", error)
        return
      }
      if (!cancelled && data) {
        setContent(data as ContentRow[])
      }
    }

    loadInitial()

    const channel = supabase
      .channel(`content-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "content",
          filter: `org_id=eq.${orgId}`,
        },
        payload => {
          const row = payload.new as ContentRow
          setContent(prev => [row, ...prev])
          if (row.title) {
            toast.info(`📚 New content available: ${row.title}`)
          }
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [orgId])

  return { content, setContent }
}

