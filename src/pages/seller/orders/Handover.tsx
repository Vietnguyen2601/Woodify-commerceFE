import React from 'react'

const HANDOVER_POINTS = [
  { name: 'Kho Gò Vấp', window: '15:00 - 17:00', carrier: 'Shopee Express', orders: 12 },
  { name: 'Hub Q.7', window: '18:00 - 20:00', carrier: 'J&T', orders: 8 }
]

export default function Handover() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Bàn giao đơn hàng</p>
          <h2>Điểm bàn giao trong ngày</h2>
        </div>
        <button type='button'>Lịch sử</button>
      </header>

      <div className='seller-table'>
        <div className='seller-table__head'>
          <span>Điểm bàn giao</span>
          <span>Thời gian</span>
          <span>Đối tác</span>
          <span>Số đơn</span>
        </div>
        {HANDOVER_POINTS.map(point => (
          <div key={point.name} className='seller-table__row'>
            <span>{point.name}</span>
            <span>{point.window}</span>
            <span>{point.carrier}</span>
            <span>{point.orders}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
