import React from 'react'

const BULK_JOBS = [
  { id: 'Batch-15h', orders: 36, method: 'Shopee Express', cutOff: '15:00 hôm nay', status: 'Đang gom' },
  { id: 'Batch-20h', orders: 18, method: 'J&T', cutOff: '20:00 hôm nay', status: 'Chưa tạo' }
]

export default function BulkShipping() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Giao hàng loạt</p>
          <h2>Chuẩn bị lịch lấy hàng</h2>
        </div>
        <button type='button' className='seller-page__primary'>Tạo lô mới</button>
      </header>

      <div className='seller-card seller-card--surface'>
        <p>Chọn các đơn cùng hãng vận chuyển để gom lô và in ấn hàng loạt.</p>
        <button type='button'>Chọn đơn</button>
      </div>

      <div className='seller-list'>
        {BULK_JOBS.map(job => (
          <article key={job.id} className='seller-list__item'>
            <div>
              <h3>{job.id}</h3>
              <p>{job.orders} đơn • {job.method}</p>
            </div>
            <div>
              <p>Cut-off: {job.cutOff}</p>
              <span>{job.status}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
