import React from 'react'

const METRICS = [
  { label: 'Tỉ lệ giao hàng đúng hạn', value: '97%', status: 'Xuất sắc' },
  { label: 'Điểm khiếu nại', value: '0', status: 'An toàn' },
  { label: 'Tỉ lệ trả hàng', value: '1.8%', status: 'Ổn định' },
  { label: 'Thời gian phản hồi chat', value: '24 phút', status: 'Cần cải thiện' }
]

export default function Performance() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Hiệu quả hoạt động</p>
          <h2>Chỉ số vận hành</h2>
        </div>
        <button type='button'>Thiết lập cảnh báo</button>
      </header>

      <div className='seller-metric-grid'>
        {METRICS.map(metric => (
          <article key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <small>{metric.status}</small>
          </article>
        ))}
      </div>
    </div>
  )
}
