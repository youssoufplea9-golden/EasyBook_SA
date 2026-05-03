import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, BookOpen, Clock, CheckCircle, Check, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi, booksApi } from '@/services/api'
import type { User } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Stats {
  totalUsers: number
  totalBooks: number
  pendingCount: number
  activeEditors: number
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [pendingEditors, setPendingEditors] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalBooks: 0, pendingCount: 0, activeEditors: 0 })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchData() {
    try {
      const [editorsRes, usersRes, booksRes] = await Promise.all([
        adminApi.pendingEditors(),
        adminApi.allUsers(),
        booksApi.search({}),
      ])
      const pending: User[] = editorsRes.data
      const allUsers: User[] = usersRes.data.items ?? []
      setPendingEditors(pending)
      setStats({
        totalUsers: usersRes.data.total,
        totalBooks: booksRes.data.total,
        pendingCount: pending.length,
        activeEditors: allUsers.filter(u => u.role === 'EDITOR' && u.status === 'ACTIVE').length,
      })
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleApprove(id: string) {
    if (!confirm(t('admin.actions.approveConfirm'))) return
    setActionLoading(id)
    try {
      await adminApi.approveEditor(id)
      toast.success(t('admin.actions.approved'))
      fetchData()
    } catch { toast.error(t('errors.unknownError')) }
    finally { setActionLoading(null) }
  }

  async function handleReject(id: string) {
    if (!confirm(t('admin.actions.rejectConfirm'))) return
    setActionLoading(id + '_reject')
    try {
      await adminApi.rejectEditor(id)
      toast.success(t('admin.actions.rejected'))
      fetchData()
    } catch { toast.error(t('errors.unknownError')) }
    finally { setActionLoading(null) }
  }

  const statCards = [
    { label: t('admin.stats.totalUsers'),      value: stats.totalUsers,    icon: Users,       color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: t('admin.stats.totalBooks'),      value: stats.totalBooks,    icon: BookOpen,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: t('admin.stats.pendingApprovals'), value: stats.pendingCount, icon: Clock,       color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: t('admin.stats.activeEditors'),   value: stats.activeEditors, icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  ]

  if (loading) return (
    <div className="flex justify-center pt-20"><LoadingSpinner size="lg" /></div>
  )

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="page-title mb-1">{t('admin.dashboard')}</h1>
        <p className="text-content-muted">Manage editors, books, and users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-content">{value}</p>
            <p className="text-sm text-content-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Editors */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="section-title">{t('admin.pendingEditors')}</h2>
          {pendingEditors.length > 0 && (
            <span className="badge-warning">{pendingEditors.length}</span>
          )}
        </div>

        {pendingEditors.length === 0 ? (
          <div className="card p-10 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-content-muted">{t('admin.noPending')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingEditors.map(editor => (
              <div key={editor.id} className="card p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm flex-shrink-0">
                  {editor.full_name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content truncate">{editor.full_name}</p>
                  <p className="text-sm text-content-muted truncate">{editor.email}</p>
                  <p className="text-xs text-content-subtle mt-0.5">
                    Registered: {new Date(editor.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Status */}
                <span className="badge-warning hidden sm:inline-flex">{t('common.pending')}</span>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(editor.id)}
                    disabled={actionLoading === editor.id}
                    className="btn-primary py-2 px-3 text-xs gap-1.5"
                  >
                    {actionLoading === editor.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Check className="w-3 h-3" />}
                    {t('admin.actions.approve')}
                  </button>
                  <button
                    onClick={() => handleReject(editor.id)}
                    disabled={actionLoading === editor.id + '_reject'}
                    className="btn-danger py-2 px-3 text-xs gap-1.5"
                  >
                    {actionLoading === editor.id + '_reject'
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <X className="w-3 h-3" />}
                    {t('admin.actions.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
