import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search, SlidersHorizontal, X, BookOpen,
  ChevronLeft, ChevronRight, Filter,
} from 'lucide-react'
import { booksApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

interface Book {
  id: string
  title: string
  author: string
  genre?: string
  category?: string
  cover_image_url?: string
  published_date?: string
  page_count?: number
  language?: string
  description?: string
}

interface Filters {
  q: string
  author: string
  genre: string
  category: string
  language: string
  published_after: string
  published_before: string
}

const EMPTY_FILTERS: Filters = {
  q: '', author: '', genre: '', category: '',
  language: '', published_after: '', published_before: '',
}

function BookCard({ book }: { book: Book }) {
  const { t } = useTranslation()
  return (
    <Link
      to={`/catalog/${book.id}`}
      className="card group flex flex-col overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className="aspect-[2/3] bg-surface-overlay overflow-hidden relative">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
            <BookOpen className="w-10 h-10 text-content-subtle" />
            <p className="text-xs text-content-subtle text-center line-clamp-2 font-medium">
              {book.title}
            </p>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-xs font-semibold bg-primary-600/90 px-2.5 py-1 rounded-lg">
            {t('book.viewDetails')}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-content text-sm line-clamp-2 leading-snug">
          {book.title}
        </h3>
        <p className="text-xs text-content-muted truncate">{t('book.by')} {book.author}</p>
        <div className="flex flex-wrap gap-1 mt-auto pt-2">
          {book.genre && (
            <span className="badge-info text-xs">{book.genre}</span>
          )}
          {book.language && (
            <span className="badge-neutral text-xs uppercase">{book.language}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[2/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const { t } = useTranslation()

  const [books, setBooks]         = useState<Book[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(true)
  const [filters, setFilters]     = useState<Filters>(EMPTY_FILTERS)
  const [applied, setApplied]     = useState<Filters>(EMPTY_FILTERS)
  const [showFilters, setShow]    = useState(false)

  const PAGE_SIZE = 16
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchBooks = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: p, page_size: PAGE_SIZE }
      if (f.q)               params.q               = f.q
      if (f.author)          params.author          = f.author
      if (f.genre)           params.genre           = f.genre
      if (f.category)        params.category        = f.category
      if (f.language)        params.language        = f.language
      if (f.published_after)  params.published_after  = f.published_after
      if (f.published_before) params.published_before = f.published_before

      const res = await booksApi.search(params)
      setBooks(res.data.items)
      setTotal(res.data.total)
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Search debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      setApplied(filters)
      fetchBooks(filters, 1)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [filters.q])

  // Explicit filter apply
  function applyFilters() {
    setPage(1)
    setApplied(filters)
    fetchBooks(filters, 1)
    setShow(false)
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setApplied(EMPTY_FILTERS)
    setPage(1)
    fetchBooks(EMPTY_FILTERS, 1)
  }

  function goToPage(p: number) {
    setPage(p)
    fetchBooks(applied, p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Initial load
  useEffect(() => { fetchBooks(EMPTY_FILTERS, 1) }, [fetchBooks])

  const hasActiveFilters = Object.values(applied).some(v => v !== '')
  const activeFilterCount = Object.values(applied).filter(v => v !== '').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="page-title mb-1">{t('client.catalog')}</h1>
        <p className="text-content-muted">
          {total > 0 ? `${total} ${t('common.results')}` : ''}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
          <input
            type="text"
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
            placeholder={t('client.search')}
            className="input-field pl-10"
          />
          {filters.q && (
            <button
              onClick={() => setFilters(f => ({ ...f, q: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle hover:text-content"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShow(s => !s)}
          className={cn(
            'btn-secondary gap-2 relative',
            showFilters && 'border-primary-400 text-primary-600'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t('client.filter')}
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-ghost gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            <X className="w-3.5 h-3.5" />
            {t('client.filters.clearAll')}
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-5 animate-slide-down">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-content">{t('client.filter')}</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'author',          label: t('client.filters.author'),        ph: 'e.g. Tolkien' },
              { key: 'genre',           label: t('client.filters.genre'),         ph: 'e.g. Fantasy' },
              { key: 'category',        label: t('client.filters.category'),      ph: 'e.g. Epic' },
              { key: 'language',        label: t('client.filters.language'),      ph: 'e.g. en' },
              { key: 'published_after', label: t('client.filters.publishedAfter'), ph: 'YYYY-MM-DD' },
              { key: 'published_before',label: t('client.filters.publishedBefore'),ph: 'YYYY-MM-DD' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="text"
                  value={(filters as any)[key]}
                  onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph}
                  className="input-field text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-border">
            <button onClick={applyFilters} className="btn-primary">
              {t('common.search')}
            </button>
            <button
              onClick={() => setShow(false)}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Book grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="py-24 text-center">
          <BookOpen className="w-16 h-16 text-content-subtle mx-auto mb-4" />
          <p className="text-content font-medium text-lg mb-2">{t('client.noResults')}</p>
          <p className="text-content-muted text-sm">{t('client.noResultsDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {books.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="btn-secondary p-2 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...'
                ? <span key={`ellipsis-${i}`} className="px-2 text-content-muted">…</span>
                : <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={cn(
                      'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                      page === p
                        ? 'bg-primary-600 text-white shadow-glow-sm'
                        : 'btn-secondary'
                    )}
                  >
                    {p}
                  </button>
            )
          }

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="btn-secondary p-2 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
