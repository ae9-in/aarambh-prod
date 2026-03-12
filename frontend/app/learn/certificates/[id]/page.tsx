"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Award,
  Calendar,
  Star,
} from "lucide-react"

// Mock certificate data
const certificateData = {
  id: 1,
  employeeName: "Rahul Kumar",
  courseName: "Safety Training Certification",
  category: "Workplace Safety",
  completedDate: "December 20, 2024",
  score: 92,
  certificateId: "ARMB-2024-SF-001",
  validUntil: "December 20, 2025",
  issuedBy: "Arambh Training System",
  managerName: "Priya Sharma",
  managerTitle: "Training Manager",
}

export default function CertificatePage() {
  const certificateRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    window.print()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${certificateData.courseName} Certificate`,
        text: `I just completed ${certificateData.courseName} on Arambh with a score of ${certificateData.score}%!`,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-lg border-b border-[#E7E5E4] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/learn/profile" className="flex items-center gap-2 text-[#1C1917]">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2 rounded-full text-[#78716C] hover:bg-[#E7E5E4]"
            >
              <Share2 size={20} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.print()}
              className="p-2 rounded-full text-[#78716C] hover:bg-[#E7E5E4]"
            >
              <Printer size={20} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Certificate Preview */}
        <motion.div
          ref={certificateRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Certificate Content */}
          <div className="relative p-8 md:p-12">
            {/* Decorative Border */}
            <div className="absolute inset-4 border-4 border-[#C8A96E]/30 rounded-xl pointer-events-none" />
            <div className="absolute inset-6 border border-[#C8A96E]/20 rounded-lg pointer-events-none" />

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <path
                  d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z"
                  fill="#C8A96E"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div className="absolute top-4 right-4 w-16 h-16 rotate-90">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <path
                  d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z"
                  fill="#C8A96E"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 w-16 h-16 -rotate-90">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <path
                  d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z"
                  fill="#C8A96E"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div className="absolute bottom-4 right-4 w-16 h-16 rotate-180">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <path
                  d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z"
                  fill="#C8A96E"
                  opacity="0.3"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="relative text-center py-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 4C24 4 28 12 28 20C28 28 24 36 24 44C24 36 20 28 20 20C20 12 24 4 24 4Z"
                    fill="#FF6B35"
                  />
                  <path
                    d="M24 8C24 8 30 14 32 22C34 30 30 38 24 44C30 38 34 30 32 22C30 14 24 8 24 8Z"
                    fill="#FF8C5A"
                    opacity="0.8"
                  />
                </svg>
                <span className="text-2xl font-bold text-[#1C1917]">Arambh</span>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="font-serif text-3xl md:text-4xl text-[#C8A96E] mb-2">
                  Certificate of Completion
                </h1>
                <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#C8A96E] to-transparent mx-auto" />
              </motion.div>

              {/* Body Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 space-y-4"
              >
                <p className="text-[#78716C] text-sm">This certifies that</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1917]">
                  {certificateData.employeeName}
                </h2>
                <p className="text-[#78716C] text-sm">has successfully completed</p>
                <h3 className="text-xl md:text-2xl font-semibold text-[#FF6B35]">
                  {certificateData.courseName}
                </h3>
                <p className="text-[#78716C] text-sm">
                  with a performance score of
                </p>
              </motion.div>

              {/* Score Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex justify-center my-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C8A96E] to-[#A08050] flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-[#1C1917]">
                        {certificateData.score}%
                      </span>
                      <span className="text-[10px] text-[#78716C]">SCORE</span>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Star size={24} className="text-[#C8A96E]" fill="#C8A96E" />
                  </div>
                </div>
              </motion.div>

              {/* Date */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 text-sm text-[#78716C]"
              >
                <Calendar size={16} />
                <span>Completed on {certificateData.completedDate}</span>
              </motion.div>

              {/* Signatures */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center gap-16 mt-12"
              >
                <div className="text-center">
                  <div className="w-32 h-12 border-b-2 border-[#1C1917] mb-2 flex items-end justify-center">
                    <span className="font-serif italic text-[#78716C] text-lg pb-1">
                      {certificateData.managerName}
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C]">{certificateData.managerTitle}</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-12 border-b-2 border-[#1C1917] mb-2 flex items-end justify-center">
                    <span className="font-serif italic text-[#78716C] text-lg pb-1">
                      Arambh
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C]">System Verification</p>
                </div>
              </motion.div>

              {/* Certificate ID */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-4 border-t border-[#E7E5E4]"
              >
                <p className="text-xs text-[#A8A29E]">
                  Certificate ID: {certificateData.certificateId}
                </p>
                <p className="text-xs text-[#A8A29E]">
                  Valid until: {certificateData.validUntil}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-3 mt-6 print:hidden"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex-1 py-3.5 bg-[#FF6B35] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex-1 py-3.5 bg-[#1C1917] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Share on LinkedIn
          </motion.button>
        </motion.div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
