"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Head of Training",
    company: "TechCorp India",
    quote: "Arambh reduced our onboarding time by 65%. New hires are productive from day one now.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "HR Director",
    company: "GrowthHub",
    quote: "The AI assistant is incredible. Our team finds answers in seconds instead of searching through folders.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Operations Manager",
    company: "RetailX",
    quote: "We've saved over ₹15 lakhs in training costs since switching to Arambh. Best investment we made.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "L&D Specialist",
    company: "BuildFast",
    quote: "Finally, all our SOPs in one place. The category system is exactly what we needed.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "CEO",
    company: "HireRight",
    quote: "Arambh transformed how we share knowledge. Our 200+ employee team operates like a well-oiled machine.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Training Manager",
    company: "CloudBase",
    quote: "The analytics help us understand exactly where our team needs more support. Game changer.",
    rating: 5,
  },
]

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4] min-w-[350px] card-lift mx-4"
      whileHover={{ y: -8, boxShadow: "0 25px 50px rgba(0,0,0,0.1)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
          >
            <Star className="w-5 h-5 fill-[#C8A96E] text-[#C8A96E]" />
          </motion.div>
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-[#1C1917] mb-6 text-pretty">&ldquo;{testimonial.quote}&rdquo;</p>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold text-lg">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-semibold text-[#1C1917]">{testimonial.name}</div>
          <div className="text-sm text-[#78716C]">{testimonial.role}, {testimonial.company}</div>
        </div>
      </div>
    </motion.div>
  )
}

export function Testimonials() {
  const row1 = testimonials.slice(0, 3)
  const row2 = testimonials.slice(3)
  
  // Duplicate for infinite scroll
  const duplicatedRow1 = [...row1, ...row1, ...row1, ...row1]
  const duplicatedRow2 = [...row2, ...row2, ...row2, ...row2]

  return (
    <section id="testimonials" className="py-24 bg-[#FAF9F7] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-mono text-sm text-[#FF6B35] tracking-widest uppercase">
            Testimonials
          </span>
          <h2 className="mt-4 font-sans font-extrabold text-4xl md:text-5xl text-[#1C1917] tracking-tight text-balance">
            Loved by teams
            <br />
            <span className="text-[#78716C]">across India</span>
          </h2>
        </motion.div>
      </div>

      {/* 3D Perspective Container */}
      <div className="perspective-1000">
        <div 
          className="space-y-6"
          style={{ transform: 'rotateX(10deg)', transformOrigin: 'center top' }}
        >
          {/* Row 1 - Scrolls Left */}
          <div className="marquee-container">
            <div className="marquee-content">
              {duplicatedRow1.map((testimonial, i) => (
                <TestimonialCard key={i} testimonial={testimonial} index={i % 3} />
              ))}
            </div>
          </div>
          
          {/* Row 2 - Scrolls Right */}
          <div className="marquee-container">
            <div className="marquee-content-reverse">
              {duplicatedRow2.map((testimonial, i) => (
                <TestimonialCard key={i} testimonial={testimonial} index={i % 3} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
