"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock, ArrowRight, Filter } from "lucide-react"

type Enquiry = {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  team_size: string | null
  message: string | null
  status: "new" | "contacted" | "closed"
  notes: string | null
  created_at: string
}

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function StatusBadge({ status }: { status: Enquiry["status"] }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"

  if (status === "new") {
    return (
      <span className={`${base} bg-orange-50 text-orange-700`}>
        <Clock className="mr-1 h-3 w-3" /> New
      </span>
    )
  }
  if (status === "contacted") {
    return (
      <span className={`${base} bg-blue-50 text-blue-700`}>
        Contacted
      </span>
    )
  }
  return (
    <span className={`${base} bg-emerald-50 text-emerald-700`}>
      <CheckCircle2 className="mr-1 h-3 w-3" /> Closed
    </span>
  )
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<"all" | Enquiry["status"]>(
    "all",
  )

  const loadEnquiries = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/enquiries")
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to load enquiries.")
      }
      const data = await res.json()
      setEnquiries(data.enquiries ?? [])
      setError(null)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load enquiries.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEnquiries()
  }, [])

  const stats = useMemo(() => {
    const base = { new: 0, contacted: 0, closed: 0 }
    for (const e of enquiries) {
      if (e.status === "new") base.new++
      if (e.status === "contacted") base.contacted++
      if (e.status === "closed") base.closed++
    }
    return base
  }, [enquiries])

  const filtered = useMemo(() => {
    if (statusFilter === "all") return enquiries
    return enquiries.filter((e) => e.status === statusFilter)
  }, [enquiries, statusFilter])

  const updateEnquiry = async (id: string, payload: Partial<Enquiry>) => {
    try {
      setUpdatingId(id)
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to update enquiry.")
      }
      await loadEnquiries()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#1C1917]">
            Sales Enquiries
          </h1>
          <p className="text-sm text-[#78716C]">
            Track and manage all inbound sales conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#78716C]" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | Enquiry["status"])
            }
            className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-1.5 text-xs text-[#44403C] focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E7E5E4]">
          <p className="text-xs font-medium text-[#78716C] mb-1">
            New enquiries
          </p>
          <p className="text-2xl font-semibold text-[#1C1917]">{stats.new}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E7E5E4]">
          <p className="text-xs font-medium text-[#78716C] mb-1">
            Contacted
          </p>
          <p className="text-2xl font-semibold text-[#1C1917]">
            {stats.contacted}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E7E5E4]">
          <p className="text-xs font-medium text-[#78716C] mb-1">Closed</p>
          <p className="text-2xl font-semibold text-[#1C1917]">
            {stats.closed}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white shadow-sm">
        <div className="grid grid-cols-[1.5fr,1.7fr,1.3fr,1.2fr,1fr,1.2fr,1.8fr] gap-4 border-b border-[#E7E5E4] bg-[#F5F3EF] px-4 py-3 text-xs font-semibold text-[#57534E]">
          <div>Name</div>
          <div>Contact</div>
          <div>Company</div>
          <div>Team Size</div>
          <div>Date</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-[#78716C]">
            Loading enquiries…
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#78716C]">
            No enquiries yet.
          </div>
        ) : (
          <div className="divide-y divide-[#F5F3EF]">
            {filtered.map((enquiry) => (
              <div
                key={enquiry.id}
                className="grid grid-cols-[1.5fr,1.7fr,1.3fr,1.2fr,1fr,1.2fr,1.8fr] gap-4 px-4 py-3 text-xs items-start"
              >
                <div>
                  <p className="font-medium text-[#1C1917]">{enquiry.name}</p>
                  {enquiry.message && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-[#78716C]">
                      {enquiry.message}
                    </p>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[#1C1917]">{enquiry.email}</p>
                  <p className="text-[11px] text-[#78716C]">{enquiry.phone}</p>
                </div>
                <div className="text-xs text-[#1C1917]">
                  {enquiry.company || "—"}
                </div>
                <div className="text-xs text-[#1C1917]">
                  {enquiry.team_size || "—"}
                </div>
                <div className="text-xs text-[#78716C]">
                  {formatDate(enquiry.created_at)}
                </div>
                <div>
                  <StatusBadge status={enquiry.status} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {enquiry.status !== "contacted" && (
                      <button
                        type="button"
                        disabled={updatingId === enquiry.id}
                        onClick={() =>
                          void updateEnquiry(enquiry.id, {
                            status: "contacted",
                          })
                        }
                        className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {enquiry.status !== "closed" && (
                      <button
                        type="button"
                        disabled={updatingId === enquiry.id}
                        onClick={() =>
                          void updateEnquiry(enquiry.id, { status: "closed" })
                        }
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                      >
                        Mark Closed
                      </button>
                    )}
                  </div>
                  <div className="flex w-full items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add note…"
                      value={notesDraft[enquiry.id] ?? enquiry.notes ?? ""}
                      onChange={(e) =>
                        setNotesDraft((prev) => ({
                          ...prev,
                          [enquiry.id]: e.target.value,
                        }))
                      }
                      className="h-8 flex-1 rounded-lg border border-[#E7E5E4] bg-white px-2 text-[11px] text-[#44403C] focus:border-[#FF6B35] focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={updatingId === enquiry.id}
                      onClick={() =>
                        void updateEnquiry(enquiry.id, {
                          notes: notesDraft[enquiry.id] ?? enquiry.notes ?? "",
                        })
                      }
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-[#FF6B35] px-2 text-[11px] font-semibold text-white hover:bg-[#E85520] disabled:opacity-60"
                    >
                      Save
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

