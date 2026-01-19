import React from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  description: string
}

export default function OrderEmpty({ title, description }: Props) {
  return (
    <div className='order-empty'>
      <div className='order-empty__icon'>🛍️</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <Link to='/catalog' className='cart-cta ghost'>Tiếp tục mua sắm</Link>
    </div>
  )
}
