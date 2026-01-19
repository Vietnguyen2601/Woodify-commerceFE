import React from 'react'

const ORDER_STATUS = [
  { label: 'Đơn có rủi ro', value: 412, detail: 'Chờ xác minh thanh toán', intent: 'warning' },
  { label: 'Chậm giao', value: 185, detail: 'Cần điều phối kho miền Nam', intent: 'danger' },
  { label: 'Hoàn thành 24h', value: 9821, detail: '+6.2% so với chuẩn', intent: 'success' }
]

const SLA_FEED = [
  { title: 'Kho Sóc Sơn', note: 'Thiếu tài xế ca đêm', eta: '30 phút' },
  { title: '3PL Sài Gòn', note: 'Đổi tuyến vận chuyển flash sale', eta: 'Đang xử lý' },
  { title: 'Kho Đà Nẵng', note: 'Trễ 87 kiện hàng', eta: 'Cần hỗ trợ' }
]

export default function OrderManager() {
  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Quản lý Order</p>
          <h2>Đơn hàng & SLA realtime</h2>
          <span>Giảm thiểu khiếu nại bằng cách giám sát tuyến vận chuyển và thanh toán.</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn outline'>Tải CSV</button>
          <button type='button' className='admin-btn primary'>Thiết lập cảnh báo</button>
        </div>
      </header>

      <div className='admin-grid admin-grid--metrics'>
        {ORDER_STATUS.map((status) => (
          <article key={status.label} className={`admin-card is-${status.intent}`}>
            <header>
              <p>{status.label}</p>
              <strong>{status.value}</strong>
            </header>
            <footer>
              <span>{status.detail}</span>
            </footer>
          </article>
        ))}
      </div>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <h3>Dòng cập nhật SLA</h3>
          <button type='button' className='admin-btn ghost'>Xem tất cả</button>
        </header>
        <div className='admin-timeline'>
          {SLA_FEED.map((item) => (
            <article key={item.title}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.note}</p>
              </div>
              <span className='admin-chip neutral'>{item.eta}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
