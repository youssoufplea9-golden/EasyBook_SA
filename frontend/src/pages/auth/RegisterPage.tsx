import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Mail, Lock, User, Eye, EyeOff, BookMarked, PenLine } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api'
import { ThemeToggle, PaletteSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { cn } from '@/utils/cn'

type Role = 'client' | 'editor'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [role, setRole]         = useState<Role>('client')
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error(t('errors.passwordMin')); return
    }
    setLoading(true)
    try {
      const fn = role === 'client' ? authApi.registerClient : authApi.registerEditor
      await fn({ email, full_name: fullName, password })
      toast.success(t('auth.registerSuccess'))
      navigate('/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t('errors.unknownError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <h2 className="text-3xl font-display text-content mb-2">{t('auth.register')}</h2>
            <p className="text-content-muted">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                {t('auth.login')}
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="label mb-3">{t('auth.chooseRole')}</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'client' as const, icon: BookMarked, label: t('auth.roleClient'), desc: t('auth.roleClientDesc') },
                { id: 'editor' as const, icon: PenLine,    label: t('auth.roleEditor'), desc: t('auth.roleEditorDesc') },
              ]).map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200',
                    role === id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                      : 'border-border hover:border-primary-300 hover:bg-surface-overlay'
                  )}
                >
                  <Icon className={cn('w-6 h-6', role === id ? 'text-primary-600' : 'text-content-muted')} />
                  <span className={cn('font-semibold text-sm', role === id ? 'text-primary-700 dark:text-primary-300' : 'text-content')}>
                    {label}
                  </span>
                  <span className="text-xs text-content-muted">{desc}</span>
                </button>
              ))}
            </div>
            {role === 'editor' && (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                ⚠️ Editor accounts require admin approval before access is granted.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle hover:text-content"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
