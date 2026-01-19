import React from 'react'
import { useCart } from '../store/cartStore'

export default function Checkout() {
  const items = useCart(s => s.items)
  const clear = useCart(s => s.clear)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div>
      <h1>Checkout</h1>
      <p>Total: {total.toLocaleString('vi-VN')} VND</p>
      <p>(This is a placeholder. Integrate payment gateway & order API.)</p>
      <div style={{ marginTop:12 }}>
        <button className='btn' onClick={() => { clear(); alert('Order placed (mock)') }}>Place Order</button>
      </div>
    </div>
  )
}
