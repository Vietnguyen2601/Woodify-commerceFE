import React from 'react'

const METRICS = [
  {
    label: 'GMV 24h',
    value: '86.4 tỷ',
    trend: '+8.4%',
    subLabel: 'So với ngày hôm qua'
  },
  {
    label: 'Đơn hàng đang xử lý',
    value: '12.842',
    trend: '321 SLA sắp quá hạn',
    subLabel: 'Theo dõi sát để tránh phạt',
    intent: 'warning'
  },
  {
    label: 'Báo cáo vi phạm',
    value: '74',
    trend: '-12% MoM',
    subLabel: 'Tập trung nhóm Nội quy'
  },
  {
    label: 'Seller hoạt động',
    value: '48.291',
    trend: '+1.2% Onboarding',
    subLabel: '219 seller mới hôm nay'
  }
]

const CHANNEL_HEALTH = [
  { name: 'Thời trang', service: '98.4%', attention: 'Ổn định' },
  { name: 'Điện tử', service: '96.1%', attention: '3 khiếu nại nghiêm trọng' },
  { name: 'Đời sống', service: '99.2%', attention: 'Đang chạy flash sale' },
  { name: 'Gỗ & nội thất', service: '97.8%', attention: 'Thiếu hàng tại kho Hà Nội' }
]

const ESCALATIONS = [
  { team: 'Seller Care', detail: 'Khiếu nại trùng lặp về phí hoàn hàng', owner: 'Thảo', eta: '45 phút' },
  { team: 'Policy', detail: 'Đối soát chương trình trợ giá Q1', owner: 'Đạt', eta: 'Hôm nay' },
  { team: 'Marketing', detail: 'Phê duyệt ngân sách livestream tuần 3', owner: 'My', eta: '13:30' }
]

export default function AdminHome() {
  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Dashbroad</p>
          <h2>Ảnh tổng quan 24h qua</h2>
          <span>Hiển thị sức khoẻ toàn bộ sàn và các chỉ số ưu tiên cho ca trực hiện tại.</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn outline'>Xuất báo cáo</button>
          <button type='button' className='admin-btn primary'>Đặt cảnh báo</button>
        </div>
      </header>

      <div className='admin-grid admin-grid--metrics'>
        {METRICS.map((metric) => (
          <article key={metric.label} className={`admin-card ${metric.intent ? `is-${metric.intent}` : ''}`}>
            <header>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </header>
            <footer>
              <span>{metric.trend}</span>
              <small>{metric.subLabel}</small>
            </footer>
          </article>
        ))}
      </div>

      <div className='admin-grid admin-grid--split'>
        <section className='admin-panel'>
          <header className='admin-panel__header'>
            <div>
              <h3>Sức khoẻ các ngành hàng</h3>
              <p>Theo dõi SLA & cảnh báo realtime</p>
            </div>
            <button type='button' className='admin-btn ghost'>Xem chi tiết</button>
          </header>

          <div className='admin-table'>
            {CHANNEL_HEALTH.map((channel) => (
              <div key={channel.name} className='admin-table__row'>
                <div>
                  <strong>{channel.name}</strong>
                  <span>{channel.attention}</span>
                </div>
                <span className='admin-chip success'>{channel.service}</span>
              </div>
            ))}
          </div>
        </section>

        <section className='admin-panel'>
          <header className='admin-panel__header'>
            <div>
              <h3>Escalation đang mở</h3>
              <p>Ưu tiên xử lý trong ca</p>
            </div>
            <button type='button' className='admin-btn ghost'>Giao việc</button>
          </header>

          <div className='admin-timeline'>
            {ESCALATIONS.map((item) => (
              <article key={item.detail}>
                <div>
                  <p className='admin-timeline__team'>{item.team}</p>
                  <strong>{item.detail}</strong>
                </div>
                <div className='admin-timeline__meta'>
                  <span>Owner: {item.owner}</span>
                  <span>ETA: {item.eta}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
