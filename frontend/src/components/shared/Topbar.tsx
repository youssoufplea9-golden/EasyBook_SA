import { BookOpen, LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ThemeToggle, PaletteSwitcher } from './ThemeSwitcher'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useAuthStore } from '@/store/authStore'

interface TopbarProps {
  sidebarToggle?: () => void
}

export function Topbar({ sidebarToggle }: TopbarProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()

  const roleBadgeColor = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    EDITOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    CLIENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }[user?.role ?? 'CLIENT']

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow-sm">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-lg text-content hidden sm:block">
          {t('app.name')}
        </span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Controls */}
      <LanguageSwitcher />
      <PaletteSwitcher />
      <ThemeToggle />

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-content leading-none">{user.full_name}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${roleBadgeColor}`}>
              {t(`common.${user.role.toLowerCase()}`)}
            </span>
          </div>
          <button
            onClick={logout}
            className="btn-ghost p-2"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  )
}
