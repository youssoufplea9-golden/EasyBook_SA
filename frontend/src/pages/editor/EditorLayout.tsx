import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, BookPlus, Library, PenLine } from 'lucide-react'
import { Topbar } from '@/components/shared/Topbar'

export default function EditorLayout() {
  const { t } = useTranslation()

  const links = [
    { to: '/editor',           icon: LayoutDashboard, label: t('editor.dashboard'), end: true },
    { to: '/editor/books/new', icon: BookPlus,        label: t('editor.createBook') },
  ]

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Topbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-surface-raised flex flex-col p-4 gap-1 hidden md:flex">
          <div className="flex items-center gap-2 px-4 py-3 mb-2">
            <PenLine className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-sm text-content">Editor Panel</span>
          </div>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
