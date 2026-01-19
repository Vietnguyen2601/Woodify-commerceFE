import React from 'react'

type Voucher = {
  id: string
  title: string
  subtitle: string
  expiry: string
  status: 'active' | 'used' | 'expired'
}

type Props = {
  voucher: Voucher
}

export default function VoucherCard({ voucher }: Props) {
  return (
    <article className={`voucher-card status-${voucher.status}`}>
      <div>
        <h4>{voucher.title}</h4>
        <p>{voucher.subtitle}</p>
        <small>HSD: {voucher.expiry}</small>
      </div>
      <button className='cart-cta ghost'>Dùng ngay</button>
    </article>
  )
}
