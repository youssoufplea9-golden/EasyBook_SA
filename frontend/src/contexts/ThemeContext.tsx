import React, { createContext, useContext, useEffect, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark'
export type ColorPalette = 'blue' | 'emerald' | 'rose' | 'purple' | 'amber'

export interface PaletteOption {
  id: ColorPalette
  label: string
  swatch: string  // Tailwind bg class for preview
}

export const PALETTE_OPTIONS: PaletteOption[] = [
  { id: 'blue',    label: 'Ocean Blue', swatch: 'bg-blue-500' },
  { id: 'emerald', label: 'Emerald',    swatch: 'bg-emerald-500' },
  { id: 'rose',    label: 'Rose',       swatch: 'bg-rose-500' },
  { id: 'purple',  label: 'Purple',     swatch: 'bg-purple-500' },
  { id: 'amber',   label: 'Amber',      swatch: 'bg-amber-500' },
]

interface ThemeContextValue {
  mode: ThemeMode
  palette: ColorPalette
  toggleMode: () => void
  setPalette: (palette: ColorPalette) => void
}

// ── Context ───────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────

const LS_MODE    = 'easybook:theme:mode'
const LS_PALETTE = 'easybook:theme:palette'

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(LS_MODE)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialPalette(): ColorPalette {
  const stored = localStorage.getItem(LS_PALETTE)
  const valid: ColorPalette[] = ['blue', 'emerald', 'rose', 'purple', 'amber']
  if (stored && valid.includes(stored as ColorPalette)) return stored as ColorPalette
  return 'blue'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode]       = useState<ThemeMode>(getInitialMode)
  const [palette, setPaletteState] = useState<ColorPalette>(getInitialPalette)

  // Apply mode to <html> element (enables Tailwind `dark:` utilities)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    localStorage.setItem(LS_MODE, mode)
  }, [mode])

  // Apply palette to <html> via data attribute (CSS vars switch in globals.css)
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
    localStorage.setItem(LS_PALETTE, palette)
  }, [palette])

  const toggleMode = () =>
    setMode(prev => (prev === 'light' ? 'dark' : 'light'))

  const setPalette = (p: ColorPalette) => setPaletteState(p)

  return (
    <ThemeContext.Provider value={{ mode, palette, toggleMode, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
