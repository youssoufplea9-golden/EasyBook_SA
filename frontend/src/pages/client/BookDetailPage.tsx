import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, BookOpen, User, Hash, Globe, Calendar,
  FileText, Building2, Tag, BookMarked, DollarSign,
} from 'lucide-react'
import { booksApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Book {
  id: string; isbn?: string; title: string; author: string
  description?: string; cover_image_url?: string; genre?: string
  category?: string; language?: string; publisher?: string
  published_date?: string; page_count?: number; price?: string
  is_published: boolean; created_at: string
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-xs text-content-muted mb-0.5">{label}</p>
        <p className="text-sm font-medium text-content">{value}</p>
      </div>
    </div>
  )
}

export default function BookDetailPage() {
  const { t }    = useTranslation()
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [book, setBook]     = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    booksApi.getOne(id)
      .then(r => setBook(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center pt-20"><LoadingSpinner size="lg" /></div>
  )

  if (notFound || !book) return (
    <div className="text-center py-24">
      <BookOpen className="w-14 h-14 text-content-subtle mx-auto mb-4" />
      <p className="text-content font-medium text-lg mb-2">{t('errors.notFound')}</p>
      <button onClick={() => navigate('/catalog')} className="btn-primary mt-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        {t('client.catalog')}
      </button>
    </div>
  )

  const metaItems = [
    book.author        && { icon: User,      label: t('book.author'),        value: book.author },
    book.isbn          && { icon: Hash,      label: t('book.isbn'),          value: book.isbn },
    book.genre         && { icon: Tag,       label: t('book.genre'),         value: book.genre },
    book.category      && { icon: BookMarked,label: t('book.category'),      value: book.category },
    book.language      && { icon: Globe,     label: t('book.language'),      value: book.language.toUpperCase() },
    book.publisher     && { icon: Building2, label: t('book.publisher'),     value: book.publisher },
    book.published_date && { icon: Calendar, label: t('book.publishedDate'), value: book.published_date },
    book.page_count    && { icon: FileText,  label: t('book.pageCount'),     value: `${book.page_count} ${t('book.pages')}` },
    book.price         && { icon: DollarSign,label: t('book.price'),         value: book.price },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[]

  return (
    <div className="max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => navigate('/catalog')}
        className="btn-ghost gap-2 mb-6 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('client.catalog')}
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-surface-overlay shadow-card-hover sticky top-24">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                <BookOpen className="w-16 h-16 text-content-subtle" />
                <p className="text-sm text-content-subtle text-center">{book.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {book.genre && <span className="badge-info">{book.genre}</span>}
              {book.language && (
                <span className="badge-neutral uppercase">{book.language}</span>
              )}
              <span className={book.is_published ? 'badge-success' : 'badge-neutral'}>
                {book.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <h1 className="text-4xl font-display text-content mb-2 leading-tight">
              {book.title}
            </h1>
            <p className="text-lg text-content-muted">
              {t('book.by')} <span className="font-medium text-content">{book.author}</span>
            </p>
          </div>

          {/* Description */}
          {book.description && (
            <div className="card p-5">
              <h2 className="section-title text-base mb-3">{t('book.description')}</h2>
              <p className="text-content-muted leading-relaxed text-sm whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="card p-5">
            <h2 className="section-title text-base mb-2">{t('client.bookDetails')}</h2>
            <div>
              {metaItems.map(({ icon, label, value }) => (
                <MetaItem key={label} icon={icon} label={label} value={value} />
              ))}
              <MetaItem
                icon={Calendar}
                label="Added to catalog"
                value={new Date(book.created_at).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
