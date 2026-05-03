import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ShoppingCart } from 'lucide-react'
import { Topbar } from '@/components/shared/Topbar'
import { useCartStore } from '@/store/cartStore'

export default function ClientLayout() {
  const { t } = useTranslation()
  const cartCount = useCartStore(s => s.items.length)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Topbar />

      {/* Secondary nav */}
      <div className="border-b border-border bg-surface-raised px-6">
        <nav className="flex items-center gap-1 max-w-7xl mx-auto">
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-content-muted hover:text-content'
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            {t('client.catalog')}
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                isActive
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-content-muted hover:text-content'
              }`
            }
          >
            <span className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </span>
            My Cart
          </NavLink>
        </nav>
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
