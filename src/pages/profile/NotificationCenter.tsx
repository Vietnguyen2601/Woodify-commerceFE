import React from 'react'

const NOTICES = [
  { id: 'n1', title: 'Đơn #28192 đang được chuẩn bị', time: '10 phút trước' },
  { id: 'n2', title: 'Nhận voucher giảm 50K cho đơn Nội thất', time: '1 giờ trước' }
]

export default function NotificationCenter() {
  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Trung tâm thông báo</p>
          <h3>Ở đây có gì mới?</h3>
        </div>
        <button className='cart-link'>Đánh dấu đã đọc</button>
      </header>

      <div className='notification-list'>
        {NOTICES.map(item => (
          <article key={item.id} className='notification-card'>
            <h4>{item.title}</h4>
            <p>{item.time}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
