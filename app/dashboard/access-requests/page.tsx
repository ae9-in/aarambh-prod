"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  Check,
  X,
  MessageSquare,
  Filter,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface AccessRequest {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  review_note: string | null
  created_at: string
  reviewed_at: string | null
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  responder?: {
    name: string
  }
}

export default function AccessRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.orgId) return

    const loadRequests = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/access-requests?orgId=${user.orgId}`)
        if (!res.ok) throw new Error('Failed to load requests')
        
        const data = await res.json()
        setRequests(data.requests || [])
      } catch (e) {
        console.error(e)
        toast.error('Failed to load access requests')
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [user?.orgId])

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return

    try {
      setProcessingId(requestId)
      
      const res = await fetch(`/api/access-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          adminReason: responseMessage || 'Access granted',
          reviewedBy: user.id,
        }),
      })

      if (!res.ok) throw new Error('Failed to approve request')

      toast.success('Access request approved')
      
      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'approved', reviewed_at: new Date().toISOString() }
            : req
        )
      )
      setSelectedRequest(null)
      setResponseMessage("")
    } catch (e) {
      toast.error('Failed to approve request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!user?.id) return

    try {
      setProcessingId(requestId)
      
      const res = await fetch(`/api/access-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          adminReason: responseMessage || 'Access denied',
          reviewedBy: user.id,
        }),
      })

      if (!res.ok) throw new Error('Failed to reject request')

      toast.success('Access request rejected')
      
      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'rejected', reviewed_at: new Date().toISOString() }
            : req
        )
      )
      setSelectedRequest(null)
      setResponseMessage("")
    } catch (e) {
      toast.error('Failed to reject request')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredRequests = requests.filter((req) =>
    filter === 'all' ? true : req.status === filter
  )

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#E7E5E4] rounded-lg w-1/3 animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-[#E7E5E4] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-[#1C1917]">Access Requests</h1>
        <p className="text-[#78716C] mt-1">
          Manage employee requests for category access
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4"
      >
        {[
          { label: 'Total', value: requests.length, color: '#78716C' },
          { label: 'Pending', value: pendingCount, color: '#F59E0B' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: '#10B981' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: '#EF4444' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl border border-[#E7E5E4] p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <p className="text-sm text-[#78716C]">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 flex-wrap"
      >
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              filter === f
                ? 'bg-[#FF6B35] text-white'
                : 'bg-white border border-[#E7E5E4] text-[#1C1917] hover:bg-[#F5F5F4]'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded">
                {pendingCount}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E7E5E4]">
            <Clock size={48} className="mx-auto text-[#E7E5E4] mb-4" />
            <h3 className="text-lg font-semibold text-[#1C1917]">No requests found</h3>
            <p className="text-[#78716C]">
              {filter === 'pending'
                ? 'No pending access requests at the moment'
                : `No ${filter} requests found`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-[#E7E5E4] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-[#FF6B35]" />
                  </div>

                  <div>
                    {/* User Info */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1C1917]">
                        {request.user.name}
                      </h3>
                      <span className="text-xs text-[#78716C] px-2 py-0.5 rounded-full bg-[#E7E5E4]">
                        {request.user.role}
                      </span>
                    </div>
                    <p className="text-sm text-[#78716C]">{request.user.email}</p>

                    {/* Category Info */}
                    <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-[#FAF9F7]">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${request.category.color || '#FF6B35'}20` }}
                      >
                        {request.category.icon || '📚'}
                      </div>
                      <span className="font-medium text-sm text-[#1C1917]">
                        {request.category.name}
                      </span>
                      <BookOpen size={14} className="text-[#78716C] ml-2" />
                    </div>

                    {/* Request Message */}
                    {request.reason && (
                      <div className="mt-3 flex items-start gap-2">
                        <MessageSquare size={14} className="text-[#78716C] mt-0.5" />
                        <p className="text-sm text-[#78716C]">{request.reason}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-4 mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          request.status === 'pending'
                            ? 'bg-[#FEF3C7] text-[#D97706]'
                            : request.status === 'approved'
                            ? 'bg-[#D1FAE5] text-[#059669]'
                            : 'bg-[#FEE2E2] text-[#DC2626]'
                        }`}
                      >
                        {request.status === 'pending' ? (
                          <Clock size={12} />
                        ) : request.status === 'approved' ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      <span className="text-xs text-[#A8A29E]">
                        Requested {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Admin Response */}
                    {request.review_note && (
                      <div className="mt-2 text-sm">
                        <span className="text-[#78716C]">Response: </span>
                        <span className="text-[#1C1917]">{request.review_note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex flex-col gap-2">
                    {selectedRequest === request.id ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Rejection reason (optional for approve)..."
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          className="w-48 p-2 text-sm border border-[#E7E5E4] rounded-lg resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            className="flex-1 py-2 rounded-lg bg-[#10B981] text-white text-sm font-medium flex items-center justify-center gap-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Check size={14} />
                            {processingId === request.id ? '...' : 'Approve'}
                          </motion.button>
                          <motion.button
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium flex items-center justify-center gap-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <X size={14} />
                            Reject
                          </motion.button>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedRequest(null)
                            setResponseMessage("")
                          }}
                          className="text-xs text-[#78716C] hover:text-[#1C1917]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => setSelectedRequest(request.id)}
                        className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Review
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
