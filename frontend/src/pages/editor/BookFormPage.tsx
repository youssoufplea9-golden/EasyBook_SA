import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Barcode, BookOpen, Image, Loader2, ArrowLeft,
  Wand2, CheckCircle, AlertCircle, Globe, Hash,
  FileText, User, Tag, BookMarked, Calendar, DollarSign,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { booksApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

interface BookFormData {
  isbn: string
  title: string
  author: string
  description: string
  cover_image_url: string
  genre: string
  category: string
  language: string
  publisher: string
  published_date: string
  page_count: string
  price: string
  is_published: boolean
}

const EMPTY: BookFormData = {
  isbn: '', title: '', author: '', description: '',
  cover_image_url: '', genre: '', category: '',
  language: '', publisher: '', published_date: '',
  page_count: '', price: '', is_published: true,
}

// ── Sub-component: ISBNLookup ─────────────────────────────────
interface ISBNLookupProps {
  onFill: (data: Partial<BookFormData>) => void
}

function ISBNLookup({ onFill }: ISBNLookupProps) {
  const { t } = useTranslation()
  const [isbn, setIsbn]       = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus]   = useState<'idle' | 'found' | 'notfound'>('idle')

  async function handleLookup() {
    const clean = isbn.replace(/[-\s]/g, '')
    if (!clean) return
    setLoading(true)
    setStatus('idle')
    try {
      const res = await booksApi.lookupIsbn(clean)
      if (res.data) {
        const d = res.data
        onFill({
          isbn:             d.isbn ?? clean,
          title:            d.title ?? '',
          author:           d.author ?? '',
          description:      d.description ?? '',
          cover_image_url:  d.cover_image_url ?? '',
          genre:            d.genre ?? '',
          category:         d.category ?? '',
          language:         d.language ?? '',
          publisher:        d.publisher ?? '',
          published_date:   d.published_date ?? '',
          page_count:       d.page_count ? String(d.page_count) : '',
        })
        setStatus('found')
        toast.success(t('editor.isbnSuccess'))
      } else {
        setStatus('notfound')
        toast.error(t('editor.isbnNotFound'))
      }
    } catch {
      setStatus('notfound')
      toast.error(t('errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20">
      <div className="flex items-center gap-2 mb-3">
        <Wand2 className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          {t('editor.isbnLookup')}
        </span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
          <input
            type="text"
            value={isbn}
            onChange={e => setIsbn(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            placeholder={t('editor.isbnPlaceholder')}
            className="input-field pl-9 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading || !isbn.trim()}
          className="btn-primary flex-shrink-0 py-2.5"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />{t('editor.isbnFetching')}</>
            : <>{t('editor.isbnFetch')}</>}
        </button>
      </div>
      {status === 'found' && (
        <p className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />{t('editor.isbnSuccess')}
        </p>
      )}
      {status === 'notfound' && (
        <p className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5" />{t('editor.isbnNotFound')}
        </p>
      )}
    </div>
  )
}

// ── Field component ──────────────────────────────────────────
interface FieldProps {
  label: string
  icon: React.ElementType
  required?: boolean
  optional?: boolean
  children: React.ReactNode
}

function Field({ label, icon: Icon, required, optional, children }: FieldProps) {
  const { t } = useTranslation()
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-content-subtle" />
        {label}
        {required && <span className="text-red-500 text-xs ml-0.5">*</span>}
        {optional && <span className="text-content-subtle text-xs">({t('common.optional')})</span>}
      </label>
      {children}
    </div>
  )
}

// ── Main BookFormPage ─────────────────────────────────────────
export default function BookFormPage() {
  const { t }    = useTranslation()
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  const [form, setForm]           = useState<BookFormData>(EMPTY)
  const [loading, setLoading]     = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const coverRef                  = useRef<HTMLImageElement>(null)

  // Load existing book if editing
  useEffect(() => {
    if (!id) return
    booksApi.getOne(id)
      .then(res => {
        const b = res.data
        setForm({
          isbn:           b.isbn ?? '',
          title:          b.title ?? '',
          author:         b.author ?? '',
          description:    b.description ?? '',
          cover_image_url: b.cover_image_url ?? '',
          genre:          b.genre ?? '',
          category:       b.category ?? '',
          language:       b.language ?? '',
          publisher:      b.publisher ?? '',
          published_date: b.published_date ?? '',
          page_count:     b.page_count ? String(b.page_count) : '',
          price:          b.price ?? '',
          is_published:   b.is_published,
        })
      })
      .catch(() => toast.error(t('errors.notFound')))
      .finally(() => setLoading(false))
  }, [id])

  function set(field: keyof BookFormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleISBNFill(data: Partial<BookFormData>) {
    setForm(prev => ({ ...prev, ...data }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.author.trim()) {
      toast.error('Title and Author are required')
      return
    }
    setSubmitting(true)
    const payload = {
      ...form,
      page_count: form.page_count ? parseInt(form.page_count, 10) : null,
      isbn: form.isbn || null,
      description:     form.description || null,
      cover_image_url: form.cover_image_url || null,
      genre:           form.genre || null,
      category:        form.category || null,
      language:        form.language || null,
      publisher:       form.publisher || null,
      published_date:  form.published_date || null,
      price:           form.price || null,
    }
    try {
      if (isEdit) {
        await booksApi.update(id!, payload)
        toast.success(t('book.updated'))
      } else {
        await booksApi.create(payload)
        toast.success(t('book.created'))
      }
      navigate('/editor')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t('errors.unknownError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/editor')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">
            {isEdit ? t('editor.editBook') : t('editor.createBook')}
          </h1>
          <p className="text-content-muted text-sm mt-0.5">
            {isEdit
              ? 'Update the book details below.'
              : 'Fill in the details or use ISBN auto-fill.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column – main form */}
          <div className="lg:col-span-2 space-y-6">

            {/* ISBN Auto-fill */}
            {!isEdit && <ISBNLookup onFill={handleISBNFill} />}

            {/* Core fields */}
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Book Information</h2>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t('book.title')} icon={BookOpen} required>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    required
                    placeholder="e.g. The Great Gatsby"
                    className="input-field"
                  />
                </Field>

                <Field label={t('book.author')} icon={User} required>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => set('author', e.target.value)}
                    required
                    placeholder="e.g. F. Scott Fitzgerald"
                    className="input-field"
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t('book.isbn')} icon={Hash} optional>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={e => set('isbn', e.target.value)}
                    placeholder="e.g. 9780743273565"
                    className="input-field font-mono"
                  />
                </Field>

                <Field label={t('book.price')} icon={DollarSign} optional>
                  <input
                    type="text"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder="e.g. $14.99"
                    className="input-field"
                  />
                </Field>
              </div>

              <Field label={t('book.description')} icon={FileText} optional>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={5}
                  placeholder="Write a compelling description..."
                  className="input-field resize-none leading-relaxed"
                />
              </Field>
            </div>

            {/* Classification */}
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Classification</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t('book.genre')} icon={Tag} optional>
                  <input
                    type="text"
                    value={form.genre}
                    onChange={e => set('genre', e.target.value)}
                    placeholder="e.g. Fiction"
                    className="input-field"
                  />
                </Field>
                <Field label={t('book.category')} icon={BookMarked} optional>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    placeholder="e.g. Classic Literature"
                    className="input-field"
                  />
                </Field>
                <Field label={t('book.language')} icon={Globe} optional>
                  <input
                    type="text"
                    value={form.language}
                    onChange={e => set('language', e.target.value)}
                    placeholder="e.g. en"
                    className="input-field"
                  />
                </Field>
                <Field label={t('book.pageCount')} icon={FileText} optional>
                  <input
                    type="number"
                    value={form.page_count}
                    onChange={e => set('page_count', e.target.value)}
                    placeholder="e.g. 180"
                    min={1}
                    className="input-field"
                  />
                </Field>
                <Field label={t('book.publisher')} icon={BookOpen} optional>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={e => set('publisher', e.target.value)}
                    placeholder="e.g. Scribner"
                    className="input-field"
                  />
                </Field>
                <Field label={t('book.publishedDate')} icon={Calendar} optional>
                  <input
                    type="text"
                    value={form.published_date}
                    onChange={e => set('published_date', e.target.value)}
                    placeholder="e.g. 1925-04-10"
                    className="input-field"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Right column – cover & settings */}
          <div className="space-y-6">
            {/* Cover preview */}
            <div className="card p-5">
              <h3 className="section-title text-base mb-4">Cover Image</h3>
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface-overlay mb-4 flex items-center justify-center">
                {form.cover_image_url ? (
                  <img
                    ref={coverRef}
                    src={form.cover_image_url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={() => { if (coverRef.current) coverRef.current.style.display = 'none' }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <Image className="w-10 h-10 text-content-subtle mx-auto mb-2" />
                    <p className="text-xs text-content-subtle">No cover image</p>
                  </div>
                )}
              </div>
              <label className="label">{t('book.coverImage')}</label>
              <input
                type="url"
                value={form.cover_image_url}
                onChange={e => set('cover_image_url', e.target.value)}
                placeholder="https://..."
                className="input-field text-sm"
              />
            </div>

            {/* Publish settings */}
            <div className="card p-5">
              <h3 className="section-title text-base mb-4">Settings</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={e => set('is_published', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    'w-11 h-6 rounded-full transition-colors duration-200',
                    form.is_published ? 'bg-primary-600' : 'bg-border-strong'
                  )}>
                    <div className={cn(
                      'w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 absolute top-1',
                      form.is_published ? 'translate-x-6' : 'translate-x-1'
                    )} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-content">{t('book.isPublished')}</p>
                  <p className="text-xs text-content-muted">
                    {form.is_published ? 'Visible in catalog' : 'Saved as draft'}
                  </p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center py-3"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{t('book.saving')}</>
                  : isEdit ? t('book.update') : t('book.save')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/editor')}
                className="btn-secondary w-full justify-center"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
