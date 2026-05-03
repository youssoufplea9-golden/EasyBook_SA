import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Shield, PenLine, BookMarked, Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/services/api'
import type { User } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'badge-success',
  PENDING:   'badge-warning',
  REJECTED:  'badge-danger',
  SUSPENDED: 'badge-neutral',
}
const ROLE_ICONS: Record<string, React.ElementType> = {
  ADMIN: Shield, EDITOR: PenLine, CLIENT: BookMarked,
}

// ── Confirm Delete Modal ──────────────────────────────────────
function DeleteModal({
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  user: User
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative card p-6 w-full max-w-md shadow-2xl animate-slide-down">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 btn-ghost p-1.5 text-content-muted"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-content">Delete User</h2>
            <p className="text-sm text-content-muted">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-content-muted mb-6">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-content">{user.full_name}</span>{' '}
          (<span className="text-content">{user.email}</span>)?
        </p>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
              : <><Trash2 className="w-4 h-4" /> Delete User</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [users, setUsers]         = useState<User[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [toDelete, setToDelete]   = useState<User | null>(null)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    adminApi.allUsers(0, 200)
      .then(r => { setUsers(r.data.items); setTotal(r.data.total) })
      .catch(() => toast.error(t('errors.networkError')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.deleteUser(toDelete.id)
      setUsers(prev => prev.filter(u => u.id !== toDelete.id))
      setTotal(prev => prev - 1)
      toast.success(`${toDelete.full_name} has been deleted.`)
      setToDelete(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t('errors.unknownError'))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-6 max-w-5xl">
      {toDelete && (
        <DeleteModal
          user={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title mb-1">{t('admin.allUsers')}</h1>
          <p className="text-content-muted">{total} {t('common.results')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search') + '...'}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-overlay">
                {[t('common.name'), t('common.email'), t('common.role'), t('common.status'), 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(user => {
                const RoleIcon = ROLE_ICONS[user.role] ?? BookMarked
                const isAdmin  = user.role === 'ADMIN'
                return (
                  <tr key={user.id} className="hover:bg-surface-overlay transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-content text-sm">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-content-muted">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm text-content">
                        <RoleIcon className="w-3.5 h-3.5 text-content-muted" />
                        {t(`common.${user.role.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', STATUS_COLORS[user.status] ?? 'badge-neutral')}>
                        {t(`common.${user.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-content-muted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setToDelete(user)}
                        disabled={isAdmin}
                        title={isAdmin ? 'Cannot delete admin accounts' : 'Delete user'}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isAdmin
                            ? 'text-content-subtle cursor-not-allowed opacity-40'
                            : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600'
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-content-muted">{t('admin.noUsers')}</div>
        )}
      </div>
    </div>
  )
}
