import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────

export interface CartItem {
  id: string
  title: string
  author: string
  cover_image_url?: string
  price?: string
}

interface CartState {
  items: CartItem[]
  addToCart:      (item: CartItem) => void
  removeFromCart: (id: string)     => void
  clearCart:      ()               => void
  isInCart:       (id: string)     => boolean
}

// ── Zustand Store ─────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) =>
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) return state
          return { items: [...state.items, item] }
        }),

      removeFromCart: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clearCart: () => set({ items: [] }),

      isInCart: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'easybook:cart',
    }
  )
)
