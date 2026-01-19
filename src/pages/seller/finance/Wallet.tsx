import React from 'react'

export default function Wallet() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Số dư TK Shopee</p>
          <h2>Ví người bán</h2>
        </div>
        <button type='button' className='seller-page__primary'>Rút tiền</button>
      </header>

      <div className='seller-card seller-card--surface'>
        <p>Số dư khả dụng</p>
        <strong>₫245.000.000</strong>
        <small>Đã khóa xử lý tranh chấp: ₫8.500.000</small>
      </div>
    </div>
  )
}
