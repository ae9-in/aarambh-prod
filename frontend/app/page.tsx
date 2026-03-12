"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { ScrollProgress } from "@/components/scroll-progress"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { DashboardScrollDemo } from "@/components/dashboard-scroll-demo"
import { AIShowcase } from "@/components/ai-showcase"
import { Stats } from "@/components/stats"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    // Check if user has already seen the loading screen this session
    const hasSeenLoader = sessionStorage.getItem('arambh_loader_shown')
    if (!hasSeenLoader) {
      setShowLoader(true)
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem('arambh_loader_shown', 'true')
    setIsLoading(false)
  }

  return (
    <>
      {/* Loading Screen - only show on first visit in session */}
      {showLoader && isLoading && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}
      
      {/* Main Content */}
      {!isLoading && (
        <main className="relative">
          {/* Scroll Progress Bar */}
          <ScrollProgress />
          
          {/* Floating Navigation */}
          <Navbar />
          
          {/* Hero Section - Dark with dramatic effects */}
          <Hero />
          
          {/* Social Proof Ticker */}
          <SocialProof />
          
          {/* Features Bento Grid */}
          <Features />
          
          {/* How It Works - Parallax Timeline */}
          <HowItWorks />
          
          {/* Dashboard Scroll Animation Demo */}
          <DashboardScrollDemo />
          
          {/* AI Feature Showcase - Sticky Scroll */}
          <AIShowcase />
          
          {/* Stats Counter Section */}
          <Stats />
          
          {/* Testimonials - 3D Perspective Marquee */}
          <Testimonials />
          
          {/* Pricing Section */}
          <Pricing />
          
          {/* Final CTA - Orange Background */}
          <FinalCTA />
          
          {/* Footer */}
          <Footer />
        </main>
      )}
    </>
  )
}
