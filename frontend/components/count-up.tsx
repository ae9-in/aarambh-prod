'use client'

import React, { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  value: number
  durationMs?: number
  className?: string
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

export function CountUp({ value, durationMs = 1500, className }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!ref.current || hasAnimated) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const start = performance.now()
    const from = 0
    const to = value

    let frameId: number

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / durationMs)
      const eased = easeOutExpo(progress)
      const current = from + (to - from) * eased
      setDisplayValue(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [hasAnimated, value, durationMs])

  return (
    <span ref={ref} className={className}>
      {Math.round(displayValue).toLocaleString()}
    </span>
  )
}

