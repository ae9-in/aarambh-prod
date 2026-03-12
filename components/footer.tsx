"use client"

import { motion } from "framer-motion"
import { Twitter, Linkedin, Youtube, Instagram, Mail } from "lucide-react"

const links = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "AI Assistant", href: "#" },
    { name: "Integrations", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
  ],
  resources: [
    { name: "Documentation", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "API", href: "#" },
    { name: "Status", href: "#" },
  ],
  legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Security", href: "#" },
  ],
}

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Instagram, href: "#", label: "Instagram" },
]

export function Footer() {
  return (
    <footer className="bg-[#1C1917] pt-20 pb-8 relative overflow-hidden">
      {/* Top gradient border */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, #FF6B35, transparent)',
        }}
      />
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4 group">
              <span className="font-sans font-extrabold text-2xl text-white tracking-tight">
                Arambh
              </span>
              <svg
                width="28"
                height="28"
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
            <p className="text-[#78716C] text-sm mb-6 max-w-xs">
              India&apos;s premium Training & Knowledge Management System for teams that want to scale.
            </p>
            
            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF6B35] transition-colors"
              />
              <motion.button
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-semibold relative overflow-hidden"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10">
                  <Mail size={18} />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-[#78716C] hover:text-white underline-animation transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-[#78716C] hover:text-white underline-animation transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-[#78716C] hover:text-white underline-animation transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-[#78716C] hover:text-white underline-animation transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#78716C]">
            © {new Date().getFullYear()} Arambh. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#78716C] hover:text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
