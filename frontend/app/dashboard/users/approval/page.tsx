"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Users,
  Filter,
  Loader2,
} from "lucide-react"

type UserProfile = {
  id: string
  name: string
  email: string
  phone: string | null
  department: string | null
  role: string
  status: "active" | "inactive" | "pending"
  created_at: string
  organizations?: { id: string; name: string } | null
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

function StatusBadge({ status }: { status: UserProfile["status"] }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"

  if (status === "pending") {
    return (
      <span className={`${base} bg-orange-50 text-orange-700`}>
        <Clock className="mr-1 h-3 w-3" /> Pending
      </span>
    )
  }
  if (status === "active") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700`}>
        <CheckCircle2 className="mr-1 h-3 w-3" /> Active
      </span>
    )
  }
  return (
    <span className={`${base} bg-red-50 text-red-700`}>
      <XCircle className="mr-1 h-3 w-3" /> Inactive
    </span>
  )
}

export default function UserApprovalPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "active" | "inactive"
  >("pending")

  const loadUsers = async () => {
    try {
      setLoading(true)
      const url =
        statusFilter === "all"
          ? "/api/users"
          : `/api/users?status=${statusFilter}`
      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to load users.")
      }
      const data = await res.json()
      setUsers(data.users ?? [])
      setError(null)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [statusFilter])

  const stats = useMemo(() => {
    const base = { pending: 0, active: 0, inactive: 0 }
    for (const u of users) {
      if (u.status === "pending") base.pending++
      if (u.status === "active") base.active++
      if (u.status === "inactive") base.inactive++
    }
    return base
  }, [users])

  const updateUser = async (
    id: string,
    payload: { status?: string; role?: string; org_id?: string },
  ) => {
    try {
      setProcessingId(id)
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to update user.")
      }
      await loadUsers()
    } catch (e) {
      console.error(e)
    } finally {
      setProcessingId(null)
    }
  }

  const approveUser = async (user: UserProfile) => {
    await updateUser(user.id, {
      status: "active",
      role: "EMPLOYEE",
    })
  }

  const rejectUser = async (user: UserProfile) => {
    await updateUser(user.id, {
      status: "inactive",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#1C1917]">
            User Approvals
          </h1>
          <p className="text-sm text-[#78716C]">
            Review and approve employee registrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#78716C]" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "pending" | "active" | "inactive",
              )
            }
            className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-1.5 text-xs text-[#44403C] focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E7E5E4]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#78716C]">
                Pending Approval
              </p>
              <p className="text-2xl font-semibold text-[#1C1917]">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E7E5E4]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <UserCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#78716C]">
                Active Users
              </p>
              <p className="text-2xl font-semibold text-[#1C1917]">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E7E5E4]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <UserX className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#78716C]">
                Rejected/Inactive
              </p>
              <p className="text-2xl font-semibold text-[#1C1917]">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white shadow-sm">
        <div className="grid grid-cols-[1.5fr,2fr,1fr,1fr,1.2fr,1.5fr] gap-4 border-b border-[#E7E5E4] bg-[#F5F3EF] px-4 py-3 text-xs font-semibold text-[#57534E]">
          <div>Name</div>
          <div>Email</div>
          <div>Department</div>
          <div>Status</div>
          <div>Registered</div>
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#78716C]" />
            <p className="mt-2 text-sm text-[#78716C]">Loading users...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Users className="mx-auto h-8 w-8 text-[#D6D3D1]" />
            <p className="mt-2 text-sm text-[#78716C]">
              {statusFilter === "pending"
                ? "No pending registrations."
                : "No users found."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F3EF]">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.5fr,2fr,1fr,1fr,1.2fr,1.5fr] gap-4 px-4 py-3 text-xs items-center"
              >
                <div>
                  <p className="font-medium text-[#1C1917]">{user.name}</p>
                  {user.phone && (
                    <p className="text-[11px] text-[#78716C] mt-0.5">
                      {user.phone}
                    </p>
                  )}
                </div>
                <div className="text-[#1C1917] truncate">{user.email}</div>
                <div className="text-[#78716C]">{user.department || "—"}</div>
                <div>
                  <StatusBadge status={user.status} />
                </div>
                <div className="text-[#78716C]">
                  {formatDate(user.created_at)}
                </div>
                <div className="flex justify-end gap-2">
                  {user.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={processingId === user.id}
                        onClick={() => void approveUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                      >
                        {processingId === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={processingId === user.id}
                        onClick={() => void rejectUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </button>
                    </>
                  )}
                  {user.status === "inactive" && (
                    <button
                      type="button"
                      disabled={processingId === user.id}
                      onClick={() =>
                        void updateUser(user.id, { status: "active" })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                    >
                      Reactivate
                    </button>
                  )}
                  {user.status === "active" && (
                    <button
                      type="button"
                      disabled={processingId === user.id}
                      onClick={() =>
                        void updateUser(user.id, { status: "inactive" })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F3EF] px-3 py-1.5 text-[11px] font-semibold text-[#78716C] hover:bg-[#E7E5E4] disabled:opacity-60"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
