"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Save,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  access: {
    allowed_roles: string[]
    allowed_user_ids: string[]
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar_url: string | null
}

const ROLES = [
  { id: 'SUPER_ADMIN', label: 'Super Admin', color: '#FF6B35' },
  { id: 'ADMIN', label: 'Admin', color: '#10B981' },
  { id: 'MANAGER', label: 'Manager', color: '#3B82F6' },
  { id: 'EMPLOYEE', label: 'Employee', color: '#8B5CF6' },
  { id: 'VIEWER', label: 'Viewer', color: '#6B7280' },
]

export default function AccessControlPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState("")

  useEffect(() => {
    if (!user?.orgId) return

    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load categories with access rules
        const catRes = await fetch(`/api/access-control?orgId=${user.orgId}`)
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData.categories || [])
        }

        // Load users
        const userRes = await fetch(`/api/users?orgId=${user.orgId}`)
        if (userRes.ok) {
          const userData = await userRes.json()
          setUsers(userData.users || [])
        }
      } catch (e) {
        console.error(e)
        toast.error("Failed to load access control data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.orgId])

  const handleToggleRole = (categoryId: string, role: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        const currentRoles = cat.access?.allowed_roles || []
        const newRoles = currentRoles.includes(role)
          ? currentRoles.filter((r) => r !== role)
          : [...currentRoles, role]
        return {
          ...cat,
          access: {
            ...cat.access,
            allowed_roles: newRoles,
          },
        }
      })
    )
  }

  const handleToggleUser = (categoryId: string, userId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        const currentUsers = cat.access?.allowed_user_ids || []
        const newUsers = currentUsers.includes(userId)
          ? currentUsers.filter((id) => id !== userId)
          : [...currentUsers, userId]
        return {
          ...cat,
          access: {
            ...cat.access,
            allowed_user_ids: newUsers,
          },
        }
      })
    )
  }

  const handleSave = async (categoryId: string) => {
    if (!user?.orgId) return

    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    try {
      setSaving(categoryId)
      const res = await fetch('/api/access-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          orgId: user.orgId,
          allowedRoles: category.access?.allowed_roles || [],
          allowedUserIds: category.access?.allowed_user_ids || [],
        }),
      })

      if (!res.ok) throw new Error('Failed to save')
      toast.success(`Access rules saved for ${category.name}`)
    } catch (e) {
      toast.error('Failed to save access rules')
    } finally {
      setSaving(null)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-[#1C1917]">Access Control</h1>
        <p className="text-[#78716C] mt-1">
          Manage which users and roles can access each category
        </p>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-start gap-3"
      >
        <Shield size={20} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[#1C1917]">
            <strong>How it works:</strong> If no roles or users are selected for a category,{' '}
            <strong>everyone</strong> can access it. Once you add access rules, only those
            roles/users will see the category.
          </p>
        </div>
      </motion.div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E7E5E4]">
            <Shield size={48} className="mx-auto text-[#E7E5E4] mb-4" />
            <h3 className="text-lg font-semibold text-[#1C1917]">No categories yet</h3>
            <p className="text-[#78716C]">Create categories first to set access control</p>
          </div>
        ) : (
          categories.map((category, index) => {
            const isExpanded = expandedCategory === category.id
            const hasRules =
              (category.access?.allowed_roles?.length || 0) > 0 ||
              (category.access?.allowed_user_ids?.length || 0) > 0

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden"
              >
                {/* Category Header */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF9F7] transition-colors"
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category.color || '#FF6B35'}20` }}
                    >
                      {category.icon || '📚'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1C1917]">{category.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {hasRules ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                            Restricted Access
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                            Open to All
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasRules && (
                      <div className="flex items-center gap-1 text-sm text-[#78716C]">
                        <Users size={14} />
                        <span>
                          {(category.access?.allowed_roles?.length || 0) +
                            (category.access?.allowed_user_ids?.length || 0)}{' '}
                          rules
                        </span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-[#78716C]" />
                    ) : (
                      <ChevronDown size={20} className="text-[#78716C]" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#E7E5E4]"
                  >
                    <div className="p-5 space-y-6">
                      {/* Roles Section */}
                      <div>
                        <h4 className="font-medium text-[#1C1917] mb-3 flex items-center gap-2">
                          <Shield size={16} />
                          Allowed Roles
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {ROLES.map((role) => {
                            const isSelected =
                              category.access?.allowed_roles?.includes(role.id) || false
                            return (
                              <motion.button
                                key={role.id}
                                onClick={() => handleToggleRole(category.id, role.id)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-[#1C1917] text-white'
                                    : 'bg-[#F5F5F4] text-[#78716C] hover:bg-[#E7E5E4]'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {isSelected ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  <XCircle size={14} />
                                )}
                                {role.label}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Users Section */}
                      <div>
                        <h4 className="font-medium text-[#1C1917] mb-3 flex items-center gap-2">
                          <Users size={16} />
                          Specific Users
                        </h4>
                        <div className="relative mb-3">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]"
                          />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-[#E7E5E4] rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredUsers.map((u) => {
                            const isSelected =
                              category.access?.allowed_user_ids?.includes(u.id) || false
                            return (
                              <motion.button
                                key={u.id}
                                onClick={() => handleToggleUser(category.id, u.id)}
                                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all text-left ${
                                  isSelected
                                    ? 'bg-[#1C1917] text-white'
                                    : 'bg-[#F5F5F4] hover:bg-[#E7E5E4]'
                                }`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isSelected ? 'bg-white/20' : 'bg-white'
                                  }`}
                                >
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{u.name}</p>
                                  <p
                                    className={`text-xs truncate ${
                                      isSelected ? 'text-white/70' : 'text-[#78716C]'
                                    }`}
                                  >
                                    {u.email} • {u.role}
                                  </p>
                                </div>
                                {isSelected && <CheckCircle2 size={16} />}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Save Button */}
                      <motion.button
                        onClick={() => handleSave(category.id)}
                        disabled={saving === category.id}
                        className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#E55A24] transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Save size={18} />
                        {saving === category.id ? 'Saving...' : 'Save Access Rules'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
