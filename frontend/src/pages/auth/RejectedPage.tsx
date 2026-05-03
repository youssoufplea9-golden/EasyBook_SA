// RejectedPage.tsx
import { XCircle, Mail, LogOut, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle, PaletteSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'

export default function RejectedPage() {
  const { t } = useTranslation()
  const { logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-600" />
          <span className="font-display text-lg">{t('app.name')}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher /><PaletteSwitcher /><ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-24 h-24 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-3xl font-display text-content mb-3">{t('rejected.title')}</h1>
          <p className="text-lg text-content-muted mb-2">{t('rejected.subtitle')}</p>
          <p className="text-sm text-content-subtle leading-relaxed mb-8">
            {t('rejected.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:support@easybook.io" className="btn-secondary gap-2">
              <Mail className="w-4 h-4" />
              {t('rejected.contactSupport')}
            </a>
            <button onClick={logout} className="btn-ghost gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="w-4 h-4" />
              {t('rejected.logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
