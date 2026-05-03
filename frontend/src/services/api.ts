import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

// ── Axios Instance ─────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Request Interceptor: attach Bearer token ──────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response Interceptor: handle 401 (token refresh) ─────────

let _isRefreshing = false
let _pendingQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  _pendingQueue.forEach(p => (token ? p.resolve(token) : p.reject(error)))
  _pendingQueue = []
}

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original?._retry) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      _isRefreshing = true

      const { refreshToken, setTokens, logout } = useAuthStore.getState()

      if (!refreshToken) {
        logout()
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/auth/refresh`,
          { refresh_token: refreshToken }
        )
        const { access_token, refresh_token } = res.data
        setTokens(access_token, refresh_token)
        processQueue(null, access_token)
        original.headers.Authorization = `Bearer ${access_token}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logout()
        toast.error('Session expired. Please sign in again.')
        return Promise.reject(refreshError)
      } finally {
        _isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

// ── Typed API helpers ─────────────────────────────────────────

export const authApi = {
  loginFn:         (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  registerClient:  (data: object) => api.post('/auth/register/client', data),
  registerEditor:  (data: object) => api.post('/auth/register/editor', data),
  me:              () => api.get('/auth/me'),
}

export const booksApi = {
  search:     (params: object)     => api.get('/books', { params }),
  getOne:     (id: string)         => api.get(`/books/${id}`),
  create:     (data: object)       => api.post('/books', data),
  update:     (id: string, data: object) => api.patch(`/books/${id}`, data),
  delete:     (id: string)         => api.delete(`/books/${id}`),
  myBooks:    ()                   => api.get('/books/editor/my-books'),
  lookupIsbn: (isbn: string)       => api.get(`/books/isbn/${isbn}`),
}

export const adminApi = {
  pendingEditors:    ()                  => api.get('/admin/editors/pending'),
  approveEditor:     (id: string)        => api.post(`/admin/editors/${id}/approve`),
  rejectEditor:      (id: string)        => api.post(`/admin/editors/${id}/reject`),
  allUsers:          (skip = 0, limit = 50) =>
    api.get('/admin/users', { params: { skip, limit } }),
  updateUserStatus:  (id: string, status: string) =>
    api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser:        (id: string) => api.delete(`/admin/users/${id}`),
}
