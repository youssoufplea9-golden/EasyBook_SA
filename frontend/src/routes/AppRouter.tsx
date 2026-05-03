import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  RedirectIfAuthenticated,
  RequireAdmin,
  RequireClient,
  RequireEditor,
} from './ProtectedRoutes'

// ── Lazy-loaded pages ─────────────────────────────────────────

// Auth
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/auth/RegisterPage'))

// Status screens
const PendingPage        = lazy(() => import('@/pages/auth/PendingPage'))
const RejectedPage       = lazy(() => import('@/pages/auth/RejectedPage'))
const UnauthorizedPage   = lazy(() => import('@/pages/auth/UnauthorizedPage'))

// Admin
const AdminLayout        = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminDashboard     = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsersPage     = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminBooksPage     = lazy(() => import('@/pages/admin/AdminBooksPage'))

// Editor
const EditorLayout       = lazy(() => import('@/pages/editor/EditorLayout'))
const EditorDashboard    = lazy(() => import('@/pages/editor/EditorDashboard'))
const BookFormPage       = lazy(() => import('@/pages/editor/BookFormPage'))

// Client
const ClientLayout       = lazy(() => import('@/pages/client/ClientLayout'))
const CatalogPage        = lazy(() => import('@/pages/client/CatalogPage'))
const BookDetailPage     = lazy(() => import('@/pages/client/BookDetailPage'))

// ── Fallback ──────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <LoadingSpinner size="lg" />
    </div>
  )
}

// ── Router ────────────────────────────────────────────────────

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Root redirect ── */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Auth pages (redirect if already logged in) ── */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Editor status screens (no layout needed) ── */}
          <Route path="/editor/pending"  element={<PendingPage />} />
          <Route path="/editor/rejected" element={<RejectedPage />} />
          <Route path="/unauthorized"    element={<UnauthorizedPage />} />

          {/* ── Admin routes ── */}
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"        element={<AdminDashboard />} />
              <Route path="/admin/users"  element={<AdminUsersPage />} />
              <Route path="/admin/books"  element={<AdminBooksPage />} />
            </Route>
          </Route>

          {/* ── Editor routes ── */}
          <Route element={<RequireEditor />}>
            <Route element={<EditorLayout />}>
              <Route path="/editor"             element={<EditorDashboard />} />
              <Route path="/editor/books/new"   element={<BookFormPage />} />
              <Route path="/editor/books/:id"   element={<BookFormPage />} />
            </Route>
          </Route>

          {/* ── Client routes ── */}
          <Route element={<RequireClient />}>
            <Route element={<ClientLayout />}>
              <Route path="/catalog"          element={<CatalogPage />} />
              <Route path="/catalog/:id"      element={<BookDetailPage />} />
            </Route>
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
