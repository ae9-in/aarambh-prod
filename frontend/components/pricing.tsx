"use client"

import { motion, AnimatePresence, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Check, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import * as Switch from "@radix-ui/react-switch"

const plans = [
  {
    name: "Starter",
    monthlyPrice: 999,
    yearlyPrice: 799,
    description: "Perfect for small teams getting started",
    features: [
      "Up to 10 users",
      "5 GB storage",
      "Basic categories",
      "Email support",
      "Mobile app access",
    ],
    popular: false,
  },
  {
    name: "Professional",
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    description: "For growing teams that need more power",
    features: [
      "Up to 50 users",
      "50 GB storage",
      "AI Knowledge Assistant",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Role-based access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    description: "For large organizations with custom needs",
    features: [
      "Unlimited users",
      "Unlimited storage",
      "Advanced AI features",
      "Custom integrations",
      "Dedicated support",
      "SSO / SAML",
      "Audit logs",
      "SLA guarantee",
    ],
    popular: false,
  },
]

function AnimatedPrice({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [isInView, value])

  return <span ref={ref}>₹{displayValue.toLocaleString()}</span>
}

export function Pricing() {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 bg-[#1C1917] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-50">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)',
            top: '-20%',
            right: '-10%',
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-mono text-sm text-[#FF6B35] tracking-widest uppercase">
            Pricing
          </span>
          <h2 className="mt-4 font-sans font-extrabold text-4xl md:text-5xl text-white tracking-tight text-balance">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-[#78716C] max-w-xl mx-auto">
            Start free for 14 days. No credit card required.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-white/50'}`}>
            Monthly
          </span>
          <Switch.Root
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="w-12 h-6 bg-[#2C2723] rounded-full relative data-[state=checked]:bg-[#FF6B35] transition-colors"
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-6" />
          </Switch.Root>
          <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-white/50'}`}>
            Yearly
            <span className="ml-2 text-xs text-[#C8A96E]">Save 20%</span>
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl p-6 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#FF6B35]/10 to-transparent border-2 border-[#FF6B35]/50'
                  : 'bg-white/[0.04] border border-white/10'
              } card-lift`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
              whileHover={{ 
                borderColor: plan.popular ? 'rgba(255,107,53,0.8)' : 'rgba(255,107,53,0.3)',
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <motion.div
                    className="flex items-center gap-1 px-4 py-1.5 bg-[#FF6B35] rounded-full text-white text-sm font-semibold"
                    animate={{ boxShadow: ["0 0 20px rgba(255,107,53,0.3)", "0 0 40px rgba(255,107,53,0.5)", "0 0 20px rgba(255,107,53,0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles size={14} />
                    Most Popular
                  </motion.div>
                </div>
              )}

              <div className="mb-6 pt-4">
                <h3 className="font-sans font-bold text-xl text-white">{plan.name}</h3>
                <p className="text-sm text-white/50 mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isYearly ? 'yearly' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="font-sans font-extrabold text-4xl text-white">
                      <AnimatedPrice value={isYearly ? plan.yearlyPrice : plan.monthlyPrice} />
                    </span>
                    <span className="text-white/50 text-sm">/user/month</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-white/80"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <motion.div
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                    >
                      <Check className="text-[#FF6B35] shrink-0" size={16} />
                    </motion.div>
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                className={`w-full py-3 rounded-xl font-semibold transition-all btn-scale ${
                  plan.popular
                    ? 'bg-[#FF6B35] text-white hover:bg-[#E85520]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/register")}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
