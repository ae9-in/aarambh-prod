"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

type DemoVideoModalProps = {
  open: boolean
  onClose: () => void
}

export function DemoVideoModal({ open, onClose }: DemoVideoModalProps) {
  const router = useRouter()
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    if (!open) {
      setVideoError(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[900px] bg-transparent border-0 p-0 shadow-none"
      >
        <div className="relative max-h-[90vh] overflow-hidden rounded-2xl bg-[#020617]/95 text-white shadow-2xl">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <h2 className="text-sm font-semibold tracking-wide">
              Arambh Demo
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 px-5 pb-5 pt-4">
            <div className="relative w-full overflow-hidden rounded-xl bg-black">
              {!videoError ? (
                <video
                  className="h-full w-full"
                  controls
                  autoPlay
                  onError={() => setVideoError(true)}
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
              ) : (
                <iframe
                  src="/demo-placeholder.html"
                  title="Demo Coming Soon"
                  className="h-[260px] w-full border-0 bg-black"
                />
              )}
            </div>

            <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm md:flex-row md:items-center">
              <p className="text-xs text-white/80">
                🚀 Ready to get started?
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  router.push("/register")
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#FF6B35] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#E85520]"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

