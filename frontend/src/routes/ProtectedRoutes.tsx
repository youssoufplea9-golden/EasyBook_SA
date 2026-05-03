import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// ── Generic auth guard ─────────────────────────────────────────

export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

// ── Admin guard ───────────────────────────────────────────────

export function RequireAdmin({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/unauthorized" replace />

  return children ? <>{children}</> : <Outlet />
}

// ── Editor guard (with pending/rejected handling) ─────────────

export function RequireEditor({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (user.role !== 'EDITOR' && user.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />
  }

  // Show the waiting screen for pending/rejected editors
  if (user.role === 'EDITOR' && user.status === 'PENDING') {
    return <Navigate to="/editor/pending" replace />
  }
  if (user.role === 'EDITOR' && user.status === 'REJECTED') {
    return <Navigate to="/editor/rejected" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

// ── Client guard ──────────────────────────────────────────────

export function RequireClient({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  // Editors with pending/rejected status cannot access client routes either
  if (user.role === 'EDITOR' && user.status === 'PENDING') {
    return <Navigate to="/editor/pending" replace />
  }
  if (user.role === 'EDITOR' && user.status === 'REJECTED') {
    return <Navigate to="/editor/rejected" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

// ── Redirect authenticated users away from auth pages ─────────

export function RedirectIfAuthenticated() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) return <Outlet />

  // Route based on role
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (user.role === 'EDITOR') {
    if (user.status === 'PENDING') return <Navigate to="/editor/pending" replace />
    if (user.status === 'REJECTED') return <Navigate to="/editor/rejected" replace />
    return <Navigate to="/editor" replace />
  }
  return <Navigate to="/catalog" replace />
}
