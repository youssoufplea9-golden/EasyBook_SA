import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, BookOpen, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCartStore()

  // Compute total only for items that have a parseable numeric price
  const total = items.reduce((sum, item) => {
    if (!item.price) return sum
    const numeric = parseFloat(item.price.replace(/[^0-9.]/g, ''))
    return sum + (isNaN(numeric) ? 0 : numeric)
  }, 0)

  const hasPrices = items.some(i => i.price)

  function handleRemove(id: string, title: string) {
    removeFromCart(id)
    toast.success(`Removed "${title}" from cart.`)
  }

  function handleClear() {
    if (!confirm('Clear your entire cart?')) return
    clearCart()
    toast.success('Cart cleared.')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <ShoppingCart className="w-16 h-16 text-content-subtle mx-auto mb-4" />
        <h1 className="text-2xl font-display text-content mb-2">Your cart is empty</h1>
        <p className="text-content-muted text-sm mb-6">
          Browse the catalog and add books you're interested in.
        </p>
        <Link to="/catalog" className="btn-primary gap-2 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Go to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title mb-1">My Cart</h1>
          <p className="text-content-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="btn-ghost gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear cart
        </button>
      </div>

      {/* Items */}
      <div className="card divide-y divide-border overflow-hidden">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-surface-overlay transition-colors">
            {/* Cover */}
            <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-overlay">
              {item.cover_image_url ? (
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-content-subtle" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/catalog/${item.id}`}
                className="font-semibold text-content hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block"
              >
                {item.title}
              </Link>
              <p className="text-sm text-content-muted truncate">{item.author}</p>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              {item.price ? (
                <p className="font-semibold text-content">{item.price}</p>
              ) : (
                <p className="text-sm text-content-subtle italic">No price</p>
              )}
            </div>

            {/* Remove */}
            <button
              onClick={() => handleRemove(item.id, item.title)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
              title="Remove from cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      {hasPrices && (
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-content-muted">Estimated Total</p>
            <p className="text-2xl font-bold text-content">${total.toFixed(2)}</p>
            <p className="text-xs text-content-subtle mt-0.5">For items with listed prices</p>
          </div>
          <button className="btn-primary px-6 py-3 text-base">
            Checkout
          </button>
        </div>
      )}

      <Link to="/catalog" className="btn-ghost gap-2 inline-flex -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Continue shopping
      </Link>
    </div>
  )
}
