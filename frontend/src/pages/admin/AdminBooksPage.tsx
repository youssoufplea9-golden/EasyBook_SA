import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, BookOpen, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { booksApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Book {
  id: string; title: string; author: string; genre?: string;
  is_published: boolean; created_at: string; cover_image_url?: string
}

export default function AdminBooksPage() {
  const { t } = useTranslation()
  const [books, setBooks]         = useState<Book[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [deleting, setDeleting]   = useState<string | null>(null)

  useEffect(() => {
    booksApi.search({ page_size: 100 })
      .then(r => { setBooks(r.data.items); setTotal(r.data.total) })
      .catch(() => toast.error(t('errors.networkError')))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm(t('book.deleteConfirm'))) return
    setDeleting(id)
    try {
      await booksApi.delete(id)
      setBooks(b => b.filter(book => book.id !== id))
      setTotal(n => n - 1)
      toast.success(t('book.deleted'))
    } catch { toast.error(t('errors.unknownError')) }
    finally { setDeleting(null) }
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="page-title mb-1">{t('admin.allBooks')}</h1>
        <p className="text-content-muted">{total} {t('common.results')}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search') + '...'} className="input-field pl-10" />
      </div>

      <div className="grid gap-3">
        {filtered.map(book => (
          <div key={book.id} className="card p-4 flex items-center gap-4">
            {book.cover_image_url
              ? <img src={book.cover_image_url} alt={book.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
              : <div className="w-12 h-16 rounded-lg bg-surface-overlay flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-content-subtle" />
                </div>
            }
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-content truncate">{book.title}</p>
              <p className="text-sm text-content-muted">{t('book.by')} {book.author}</p>
              {book.genre && <span className="badge-info mt-1">{book.genre}</span>}
            </div>
            <span className={book.is_published ? 'badge-success' : 'badge-neutral'}>
              {book.is_published ? 'Published' : 'Draft'}
            </span>
            <button onClick={() => handleDelete(book.id)} disabled={deleting === book.id}
              className="btn-ghost p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              {deleting === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card py-16 text-center text-content-muted">{t('common.noData')}</div>
        )}
      </div>
    </div>
  )
}
