import { Clock, Mail, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle, PaletteSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { BookOpen } from 'lucide-react'

export default function PendingPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-600" />
          <span className="font-display text-lg">{t('app.name')}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <PaletteSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-slide-up">
          {/* Icon */}
          <div className="w-24 h-24 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>

          {/* Text */}
          <h1 className="text-3xl font-display text-content mb-3">
            {t('pending.title')}
          </h1>
          <p className="text-lg text-content-muted mb-2">{t('pending.subtitle')}</p>
          <p className="text-sm text-content-subtle leading-relaxed mb-6">
            {t('pending.description')}
          </p>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-medium text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {t('pending.status')}
          </div>

          {/* User info */}
          {user && (
            <div className="card p-4 mb-6 text-left">
              <p className="text-xs text-content-muted mb-1">Registered as</p>
              <p className="font-semibold text-content">{user.full_name}</p>
              <p className="text-sm text-content-muted">{user.email}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:support@easybook.io" className="btn-secondary gap-2">
              <Mail className="w-4 h-4" />
              {t('pending.contactSupport')}
            </a>
            <button onClick={logout} className="btn-ghost gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="w-4 h-4" />
              {t('pending.logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
