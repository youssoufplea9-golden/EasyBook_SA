import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle, PaletteSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import type { User } from '@/store/authStore'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.loginFn({ email, password })
      const { access_token, refresh_token } = res.data
      setTokens(access_token, refresh_token)

      const meRes = await authApi.me()
      const user: User = meRes.data
      setUser(user)
      toast.success(t('auth.loginSuccess'))

      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'EDITOR') {
        if (user.status === 'PENDING') navigate('/editor/pending')
        else if (user.status === 'REJECTED') navigate('/editor/rejected')
        else navigate('/editor')
      } else navigate('/catalog')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      if (detail?.includes('pending')) {
        navigate('/editor/pending')
      } else if (detail?.includes('rejected')) {
        navigate('/editor/rejected')
      } else {
        toast.error(detail ?? t('errors.unknownError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl text-white">{t('app.name')}</span>
          </div>
          <h1 className="text-5xl font-display text-white leading-tight mb-6">
            Your world of<br />
            <span className="italic">stories awaits.</span>
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-sm">
            {t('app.tagline')} — discover, manage, and share the books that matter to you.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex gap-4">
            {['📚', '✍️', '🌍'].map((emoji, i) => (
              <div key={i} className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 lg:hidden">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <span className="font-display text-lg">{t('app.name')}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <PaletteSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-display text-content mb-2">{t('auth.login')}</h2>
              <p className="text-content-muted">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                  {t('auth.register')}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
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
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle hover:text-content transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>

            {/* Demo hint */}
            <div className="mt-6 p-4 rounded-xl bg-surface-overlay border border-border text-sm text-content-muted">
              <strong className="text-content">Demo admin:</strong> admin@easybook.io / Admin@1234
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
