import { ShieldOff, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function UnauthorizedPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md text-center animate-slide-up">
        <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-display text-content mb-3">403 – Forbidden</h1>
        <p className="text-content-muted mb-8">{t('errors.forbidden')}</p>
        <button onClick={() => navigate(-1)} className="btn-primary gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      </div>
    </div>
  )
}
