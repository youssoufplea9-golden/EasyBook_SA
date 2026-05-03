import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'

import '@/i18n'
import '@/styles/globals.css'

import { ThemeProvider } from '@/contexts/ThemeContext'
import AppRouter from '@/routes/AppRouter'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgb(var(--color-surface-raised))',
            color: 'rgb(var(--color-content))',
            border: '1px solid rgb(var(--color-border))',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            boxShadow: '0 4px 16px -2px rgb(0 0 0 / 0.12)',
          },
          success: {
            iconTheme: {
              primary: 'rgb(16 185 129)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'rgb(239 68 68)',
              secondary: 'white',
            },
          },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>
)
