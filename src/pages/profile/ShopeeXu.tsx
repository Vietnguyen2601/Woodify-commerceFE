import React from 'react'

const TRANSACTIONS = [
  { id: 't1', type: 'Nhận', detail: 'Hoàn xu từ đơn #28192', amount: '+200 Xu', time: 'Hôm nay · 09:12' },
  { id: 't2', type: 'Đổi', detail: 'Đổi mã freeship', amount: '-150 Xu', time: 'Hôm qua · 21:45' },
  { id: 't3', type: 'Nhận', detail: 'Check-in nhận thưởng', amount: '+20 Xu', time: '02 Th01 · 07:15' }
]

export default function ShopeeXu() {
  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Shopee Xu</p>
          <h3>Quản lý xu và lịch sử giao dịch</h3>
        </div>
        <button className='cart-cta primary'>Đổi xu ngay</button>
      </header>

      <div className='xu-balance'>
        <div>
          <p>Số dư hiện tại</p>
          <strong>1.250 Xu</strong>
        </div>
        <div>
          <p>Xu sắp hết hạn</p>
          <strong>120 Xu</strong>
        </div>
        <div>
          <p>Xu nhận trong tháng</p>
          <strong>+420 Xu</strong>
        </div>
      </div>

      <div className='xu-history'>
        {TRANSACTIONS.map(tx => (
          <article key={tx.id}>
            <div>
              <h4>{tx.detail}</h4>
              <p>{tx.time}</p>
            </div>
            <span className={tx.amount.startsWith('-') ? 'loss' : 'gain'}>{tx.amount}</span>
          </article>
        ))}
      </div>
    </div>
  )
}
