"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, Download, Share2, Calendar, ExternalLink } from "lucide-react"
import { toast } from "sonner"

const easeExpo = [0.16, 1, 0.3, 1]

const certificates = [
  { id: "1", title: "Sales Process Mastery", completedDate: "Mar 5, 2024", issuer: "Arambh Learning", credentialId: "CERT-2024-001", image: "https://bizconsultancy.iid.org.in/basepath/thumbnail/courses-industry/31b6684f-6efe-41bf-8d92-ddb9afafd84d.jpg" },
  { id: "2", title: "Customer Service Excellence", completedDate: "Feb 28, 2024", issuer: "Arambh Learning", credentialId: "CERT-2024-002", image: "https://media.licdn.com/dms/image/v2/D4D12AQEeytTj0cDWpA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1676263729343?e=2147483647&v=beta&t=CS9xmWsQ2cnG99LpDZen1An40MkRgiNjbAKYmze9etM" },
  { id: "3", title: "Product Knowledge Fundamentals", completedDate: "Feb 15, 2024", issuer: "Arambh Learning", credentialId: "CERT-2024-003", image: "https://img.freepik.com/free-photo/online-marketing_53876-176744.jpg?semt=ais_hybrid&w=740&q=80" },
]

export default function CertificatesPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 400)
  }, [])

  const handleDownload = (title: string) => {
    toast.success(`Downloading "${title}" certificate...`)
  }

  const handleShare = (title: string) => {
    toast.success(`Share link copied for "${title}"`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6 max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-[#F0EDE8] rounded animate-pulse" />
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-[#F0EDE8] rounded-3xl animate-pulse" />)}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <h1 className="text-2xl font-bold text-[#1C1917]">My Certificates</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">{certificates.length} certificates earned</p>
      </motion.div>

      {/* Certificates List */}
      <div className="space-y-4">
        {certificates.map((cert, idx) => (
          <motion.div
            key={cert.id}
            className="bg-white rounded-3xl border border-[#F0EDE8] overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, ease: easeExpo }}
            whileHover={{ y: -2, boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}
          >
            {/* Certificate Preview */}
            <div className="relative h-32 overflow-hidden rounded-t-2xl">
              <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <p className="text-[10px] text-[#FF6B35] font-mono uppercase tracking-wider">Certificate of Completion</p>
                <h3 className="text-lg font-bold text-white mt-1">{cert.title}</h3>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-5">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wide">Issued By</p>
                  <p className="font-medium text-[#1C1917]">{cert.issuer}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wide">Date</p>
                  <p className="font-medium text-[#1C1917] flex items-center gap-1">
                    <Calendar size={12} /> {cert.completedDate}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wide">Credential ID</p>
                  <p className="font-mono text-xs text-[#1C1917]">{cert.credentialId}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-5 pt-5 border-t border-[#F0EDE8]">
                <motion.button
                  onClick={() => handleDownload(cert.title)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E85520] text-white text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} /> Download
                </motion.button>
                <motion.button
                  onClick={() => handleShare(cert.title)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-[#F0EDE8] text-[#1C1917] text-sm font-medium hover:border-[#FF6B35] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={16} /> Share
                </motion.button>
                <motion.button
                  className="w-10 h-10 rounded-xl border border-[#F0EDE8] flex items-center justify-center text-[#6B7280] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {certificates.length === 0 && (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center">
            <Award size={32} className="text-[#FF6B35]" />
          </div>
          <h3 className="text-lg font-bold text-[#1C1917]">No certificates yet</h3>
          <p className="text-sm text-[#9CA3AF] mt-2">Complete courses to earn certificates</p>
        </motion.div>
      )}
    </div>
  )
}
