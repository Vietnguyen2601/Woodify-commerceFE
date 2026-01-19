import React from 'react'

const REVENUE = [
  { label: 'Doanh thu hôm nay', value: '₫185.400.000' },
  { label: 'Đang chờ đối soát', value: '₫24.800.000' },
  { label: 'Đã thanh toán tháng này', value: '₫3.2B' }
]

export default function Revenue() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Tài chính</p>
          <h2>Doanh thu</h2>
        </div>
        <button type='button' className='seller-page__primary'>Tải sao kê</button>
      </header>

      <div className='seller-metric-grid'>
        {REVENUE.map(item => (
          <article key={item.label}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </div>
  )
}
