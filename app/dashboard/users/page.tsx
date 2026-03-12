"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CountUp from "react-countup"
import { toast } from "sonner"

const easeExpo = [0.16, 1, 0.3, 1]

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending" | string
  department: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/users", { credentials: "include" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to load users.")
      }
      const data = await res.json()
      const list: any[] = data.users ?? []
      setUsers(
        list.map((u) => ({
          id: u.id,
          name: u.name ?? "",
          email: u.email ?? "",
          role: u.role ?? "EMPLOYEE",
          status: (u.status ?? "active") as UserRow["status"],
          department: u.department ?? null,
        })),
      )
      setError(null)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load users.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" ||
        user.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.status === "active").length
    const inactive = users.filter((u) => u.status === "inactive").length
    const pending = users.filter((u) => u.status === "pending").length
    return { total, active, inactive, pending }
  }, [users])

  const updateUser = async (id: string, payload: { status?: string; role?: string }) => {
    try {
      setUpdatingId(id)
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
      const body = await res.json().catch(() => null)
      const updated = body?.user ?? body
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                role: updated?.role ?? u.role,
                status: (updated?.status ?? u.status) as UserRow["status"],
              }
            : u,
        ),
      )
      toast.success("User updated.")
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to update user.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChange = (user: UserRow) => {
    const order: UserRow["status"][] = ["active", "inactive", "pending"]
    const idx = order.indexOf(user.status as any)
    const next = order[(idx + 1 + order.length) % order.length]
    void updateUser(user.id, { status: next })
  }

  if (isLoading) return <div className="space-y-6"><div className="h-8 bg-[#E7E5E4] rounded-lg w-1/3 animate-pulse" /></div>

  return (
    <div className="space-y-6">
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <div><h1 className="text-3xl font-bold text-[#1C1917]">Users & Roles</h1><p className="text-[#78716C] mt-1">Manage real team members from Supabase</p></div>
      </motion.div>

      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {[{ label: "Total Users", value: stats.total }, { label: "Active", value: stats.active }, { label: "Inactive", value: stats.inactive }, { label: "Pending", value: stats.pending }].map((stat, i) => (
          <motion.div key={stat.label} className="bg-white rounded-xl border border-[#E7E5E4] p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ y: -2 }}>
            <p className="text-sm text-[#78716C]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1C1917] mt-1"><CountUp end={stat.value} duration={1} /></p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="flex flex-col sm:flex-row gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]" /><input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 outline-none" /></div>
        <div className="flex gap-2">{["all", "active", "inactive", "pending"].map((status) => (<motion.button key={status} onClick={() => setStatusFilter(status as any)} className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === status ? "bg-[#FF6B35] text-white" : "bg-white border border-[#E7E5E4]"}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}</motion.button>))}</div>
      </motion.div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E7E5E4]">
            <tr><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Name</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Email</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Role</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Status</th><th className="text-right text-xs font-semibold text-[#78716C] px-6 py-4">Actions</th></tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user, idx) => (
                <motion.tr key={user.id} className="border-b border-[#E7E5E4] hover:bg-[#F9FAFB] group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} exit={{ opacity: 0, y: -10 }}>
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div><span className="font-medium text-[#1C1917]">{user.name}</span></div></td>
                  <td className="px-6 py-4 text-sm text-[#78716C]">{user.email}</td>
                  <td className="px-6 py-4">
                    <Select
                      value={user.role}
                      onValueChange={(role) =>
                        void updateUser(user.id, { role })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"].map(
                          (r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4">
                    <motion.button
                      onClick={() => handleStatusChange(user)}
                      disabled={updatingId === user.id}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </motion.button>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-[#78716C]">
                    {user.department || "—"}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
