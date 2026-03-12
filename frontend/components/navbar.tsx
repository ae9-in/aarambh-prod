"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Testimonials", href: "#testimonials" },
]

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()
  
  const scale = useTransform(scrollY, [0, 100], [1, 0.95])
  const shadow = useTransform(scrollY, [0, 100], ["0 0 0 rgba(0,0,0,0)", "0 10px 40px rgba(0,0,0,0.1)"])

  return (
    <motion.nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      style={{ scale }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="glass px-4 py-1.5 rounded-full flex items-center gap-5"
        style={{ boxShadow: shadow }}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-1.5 group">
          <span className="font-sans font-extrabold text-base text-[#1C1917] tracking-tight">
            Arambh
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            fill="none"
            className="group-hover:animate-flicker"
          >
            <path
              d="M24 4C24 4 28 12 28 18C28 22 26 24 24 26C22 24 20 22 20 18C20 12 24 4 24 4Z"
              fill="#FF6B35"
            />
            <path
              d="M24 10C24 10 32 20 32 28C32 36 28 40 24 44C20 40 16 36 16 28C16 20 24 10 24 10Z"
              fill="#C8A96E"
            />
            <path
              d="M24 20C24 20 28 26 28 32C28 36 26 38 24 40C22 38 20 36 20 32C20 26 24 20 24 20Z"
              fill="#FF6B35"
            />
          </svg>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-medium text-[#78716C] hover:text-[#1C1917] underline-animation transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          className="hidden md:flex items-center gap-1 bg-[#FF6B35] text-white px-3.5 py-1 rounded-full text-xs font-semibold relative overflow-hidden btn-scale"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/register")}
        >
          <span className="relative z-10">Get Started</span>
          <motion.div
            className="absolute inset-0 shimmer-button"
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden glass mt-2 rounded-2xl overflow-hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isOpen ? "auto" : 0, 
          opacity: isOpen ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <button
            className="bg-[#FF6B35] text-white px-5 py-2 rounded-full text-sm font-semibold btn-scale"
            onClick={() => {
              setIsOpen(false)
              router.push("/register")
            }}
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </motion.nav>
  )
}
