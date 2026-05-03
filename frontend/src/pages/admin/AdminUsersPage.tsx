import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Shield, PenLine, BookMarked } from 'lucide-react'
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

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [users, setUsers]         = useState<User[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')

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

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-6 max-w-5xl">
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
                {[t('common.name'), t('common.email'), t('common.role'), t('common.status'), 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(user => {
                const RoleIcon = ROLE_ICONS[user.role] ?? BookMarked
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
