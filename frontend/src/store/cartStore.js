import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, size, color, quantity = 1) => {
    const { items } = get()
    const existing = items.find(
      i => i.product.id === product.id && i.size === size && i.color === color
    )
    if (existing) {
      set({ items: items.map(i => i === existing ? { ...i, quantity: i.quantity + quantity } : i) })
    } else {
      set({ items: [...items, { product, size, color, quantity }] })
    }
  },

  removeItem: (index) => set(s => ({ items: s.items.filter((_, i) => i !== index) })),

  updateQuantity: (index, qty) => {
    if (qty <= 0) {
      set(s => ({ items: s.items.filter((_, i) => i !== index) }))
    } else {
      set(s => ({ items: s.items.map((item, i) => i === index ? { ...item, quantity: qty } : item) }))
    }
  },

  clearCart: () => set({ items: [] }),
  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}))

export default useCartStore