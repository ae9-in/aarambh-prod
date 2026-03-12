"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"
import { toast } from "sonner"

type VideoPlayerProps = {
  url: string
  title: string
  userId: string
  orgId: string
  contentId: string
  lastPositionSeconds?: number
  onProgress?: (percent: number) => void
  onComplete?: () => void
}

export function VideoPlayer({
  url,
  title,
  userId,
  orgId,
  contentId,
  lastPositionSeconds = 0,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [hasCompleted, setHasCompleted] = useState(false)

  // Resume from last position
  useEffect(() => {
    if (videoRef.current && lastPositionSeconds > 0) {
      videoRef.current.currentTime = lastPositionSeconds
    }
  }, [lastPositionSeconds])

  // Periodic progress tracking
  useEffect(() => {
    if (!videoRef.current) return
    let interval: NodeJS.Timeout | undefined

    function startInterval() {
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        if (!videoRef.current) return
        const current = videoRef.current.currentTime
        const total = videoRef.current.duration || 1
        const pct = (current / total) * 100
        setProgress(pct)
        onProgress?.(pct)

        // Auto mark complete at 90%
        if (!hasCompleted && pct >= 90) {
          setHasCompleted(true)
          handleComplete(current, pct)
        } else {
          // send heartbeat progress
          void sendProgress(current, pct, "IN_PROGRESS")
        }
      }, 10_000)
    }

    if (isPlaying) {
      startInterval()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, hasCompleted, userId, orgId, contentId, onProgress])

  const sendProgress = async (
    currentSeconds: number,
    pct: number,
    status: "IN_PROGRESS" | "COMPLETED",
  ) => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          contentId,
          orgId,
          status,
          progressPercent: Math.round(pct),
          timeSpentMinutes: Math.ceil(currentSeconds / 60),
          lastPositionSeconds: Math.round(currentSeconds),
        }),
      })
    } catch (e) {
      console.error("Video progress error:", e)
    }
  }

  const handleComplete = async (currentSeconds: number, pct: number) => {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          contentId,
          orgId,
          status: "COMPLETED",
          progressPercent: Math.round(pct || 100),
          timeSpentMinutes: Math.ceil(currentSeconds / 60),
          lastPositionSeconds: Math.round(currentSeconds),
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data) {
        throw new Error(data?.error || "Failed to mark complete")
      }

      if (data.xpEarned) {
        toast.success(`✅ +${data.xpEarned} XP earned!`)
      }
      if (data.leveledUp) {
        toast.success(`⚡ Level up! You are now ${data.newLevel}`)
      }
      if (Array.isArray(data.newBadges)) {
        data.newBadges.forEach((badge: any) => {
          toast.success(`🏆 New badge: ${badge.name}`)
        })
      }

      onComplete?.()
    } catch (e) {
      console.error("Video complete error:", e)
      toast.error("Could not mark lesson complete. Please try again.")
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration || 1
    const pct = (current / total) * 100
    setProgress(pct)
    onProgress?.(pct)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration || 0)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().catch(() => {
        toast.error("Unable to play video.")
      })
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const skip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime += seconds
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const pct = Number(e.target.value)
    const newTime = (pct / 100) * (videoRef.current.duration || 1)
    videoRef.current.currentTime = newTime
    setProgress(pct)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1C1917]">
      <div
        className="relative aspect-video w-full"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={() => setShowControls(true)}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false)
            if (!hasCompleted && videoRef.current) {
              const current = videoRef.current.currentTime
              const total = videoRef.current.duration || 1
              const pct = (current / total) * 100
              setHasCompleted(true)
              void handleComplete(current, pct)
            }
          }}
        />

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/10 to-black/40 p-4"
            >
              {/* Top bar */}
              <div className="pointer-events-auto flex items-center justify-between text-xs text-white/80">
                <span className="line-clamp-1 text-[11px] font-medium">{title}</span>
              </div>

              {/* Bottom controls */}
              <div className="pointer-events-auto space-y-3">
                {/* Progress bar */}
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={progress}
                    onChange={handleSeek}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20"
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 h-1 rounded-full bg-[#FF6B35]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/80">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => skip(-10)}
                      className="text-white/80 hover:text-white"
                    >
                      <SkipBack className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => skip(10)}
                      className="text-white/80 hover:text-white"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </button>
                    <span className="ml-1 text-[11px]">
                      {videoRef.current ? formatTime(videoRef.current.currentTime) : "0:00"} /{" "}
                      {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="text-white/80 hover:text-white"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const el = videoRef.current
                        if (!el) return
                        if (document.fullscreenElement) {
                          document.exitFullscreen().catch(() => undefined)
                        } else {
                          el.requestFullscreen().catch(() => undefined)
                        }
                      }}
                      className="text-white/80 hover:text-white"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

