import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookPlus, BookOpen, Pencil, Trash2, Loader2, Library } from 'lucide-react'
import toast from 'react-hot-toast'
import { booksApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Book {
  id: string
  title: string
  author: string
  genre?: string
  category?: string
  cover_image_url?: string
  is_published: boolean
  created_at: string
  page_count?: number
}

export default function EditorDashboard() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [books, setBooks]       = useState<Book[]>([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function fetchBooks() {
    try {
      const res = await booksApi.myBooks()
      setBooks(res.data)
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks() }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`${t('book.deleteConfirm')}\n"${title}"`)) return
    setDeleting(id)
    try {
      await booksApi.delete(id)
      setBooks(prev => prev.filter(b => b.id !== id))
      toast.success(t('book.deleted'))
    } catch {
      toast.error(t('errors.unknownError'))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title mb-1">{t('editor.dashboard')}</h1>
          <p className="text-content-muted">
            Welcome back, <span className="font-medium text-content">{user?.full_name}</span>.
          </p>
        </div>
        <Link to="/editor/books/new" className="btn-primary flex-shrink-0">
          <BookPlus className="w-4 h-4" />
          {t('editor.createBook')}
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold text-content">{books.length}</p>
          <p className="text-sm text-content-muted mt-0.5">Total Books</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-content">
            {books.filter(b => b.is_published).length}
          </p>
          <p className="text-sm text-content-muted mt-0.5">Published</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-content">
            {books.filter(b => !b.is_published).length}
          </p>
          <p className="text-sm text-content-muted mt-0.5">Drafts</p>
        </div>
      </div>

      {/* Books list */}
      <div>
        <h2 className="section-title mb-4">{t('editor.myBooks')}</h2>

        {books.length === 0 ? (
          <div className="card py-20 text-center">
            <Library className="w-14 h-14 text-content-subtle mx-auto mb-4" />
            <p className="text-content-muted font-medium mb-2">{t('editor.noBooks')}</p>
            <p className="text-content-subtle text-sm mb-6">{t('editor.addFirst')}</p>
            <Link to="/editor/books/new" className="btn-primary inline-flex">
              <BookPlus className="w-4 h-4" />
              {t('editor.createBook')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {books.map(book => (
              <div
                key={book.id}
                className="card p-4 flex items-center gap-4 group hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                {/* Cover thumbnail */}
                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-overlay">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-content-subtle" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content truncate">{book.title}</p>
                  <p className="text-sm text-content-muted truncate">
                    {t('book.by')} {book.author}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {book.genre && (
                      <span className="badge-info text-xs">{book.genre}</span>
                    )}
                    {book.page_count && (
                      <span className="text-xs text-content-subtle">
                        {book.page_count} {t('book.pages')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span className={book.is_published ? 'badge-success' : 'badge-neutral'}>
                  {book.is_published ? 'Published' : 'Draft'}
                </span>

                {/* Date */}
                <span className="text-xs text-content-subtle hidden sm:block flex-shrink-0">
                  {new Date(book.created_at).toLocaleDateString()}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/editor/books/${book.id}`}
                    className="btn-ghost p-2 text-primary-600"
                    title={t('common.edit')}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={deleting === book.id}
                    className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title={t('common.delete')}
                  >
                    {deleting === book.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
