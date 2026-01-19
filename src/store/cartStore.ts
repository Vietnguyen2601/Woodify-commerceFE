import create from 'zustand'

type CartItem = { id: string, title: string, price: number, qty: number }

type State = {
  items: CartItem[],
  add: (it: CartItem) => void,
  remove: (id: string) => void,
  clear: () => void,
  setQty: (id: string, qty: number) => void
}

export const useCart = create<State>((set) => ({
  items: [],
  add: (it) => set((s) => {
    const ex = s.items.find(x => x.id === it.id)
    if (ex) return { items: s.items.map(x => x.id === it.id ? { ...x, qty: x.qty + it.qty } : x) }
    return { items: [...s.items, it] }
  }),
  remove: (id) => set((s) => ({ items: s.items.filter(x => x.id !== id) })),
  clear: () => set({ items: [] }),
  setQty: (id, qty) => set((s) => {
    if (qty <= 0) return { items: s.items.filter(x => x.id !== id) }
    return { items: s.items.map(x => x.id === id ? { ...x, qty } : x) }
  })
}))
