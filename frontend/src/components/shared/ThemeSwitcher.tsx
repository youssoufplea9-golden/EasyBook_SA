import { Moon, Sun, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme, PALETTE_OPTIONS, type ColorPalette } from '@/contexts/ThemeContext'
import { cn } from '@/utils/cn'
import { useState } from 'react'

// ── Light/Dark Toggle ─────────────────────────────────────────

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  const { t } = useTranslation()

  return (
    <button
      onClick={toggleMode}
      className="btn-ghost p-2.5"
      title={mode === 'dark' ? t('common.lightMode') : t('common.darkMode')}
      aria-label="Toggle theme"
    >
      {mode === 'dark'
        ? <Sun className="w-5 h-5 text-amber-400" />
        : <Moon className="w-5 h-5" />}
    </button>
  )
}

// ── Color Palette Switcher ────────────────────────────────────

export function PaletteSwitcher() {
  const { palette, setPalette } = useTheme()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-ghost p-2.5"
        title={t('common.palette')}
        aria-label="Switch color palette"
      >
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-48 card p-2 shadow-card-hover animate-slide-down">
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wider px-2 mb-2">
              {t('common.palette')}
            </p>
            {PALETTE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => { setPalette(opt.id as ColorPalette); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors',
                  palette === opt.id
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-medium'
                    : 'hover:bg-surface-overlay text-content'
                )}
              >
                <span className={cn('w-4 h-4 rounded-full flex-shrink-0', opt.swatch)} />
                <span>{t(`common.${opt.id}`, opt.label)}</span>
                {palette === opt.id && (
                  <span className="ml-auto text-primary-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
