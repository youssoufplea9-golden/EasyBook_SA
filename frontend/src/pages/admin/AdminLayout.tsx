import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Users, BookOpen, ShieldCheck } from 'lucide-react'
import { Topbar } from '@/components/shared/Topbar'

export default function AdminLayout() {
  const { t } = useTranslation()

  const links = [
    { to: '/admin',       icon: LayoutDashboard, label: t('admin.dashboard'),      end: true },
    { to: '/admin/users', icon: Users,            label: t('admin.allUsers') },
    { to: '/admin/books', icon: BookOpen,         label: t('admin.allBooks') },
  ]

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Topbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-surface-raised flex flex-col p-4 gap-1 hidden md:flex">
          <div className="flex items-center gap-2 px-4 py-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-sm text-content">Admin Panel</span>
          </div>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
