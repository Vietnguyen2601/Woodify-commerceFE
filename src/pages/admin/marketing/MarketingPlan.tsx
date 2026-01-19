import React from 'react'

const CAMPAIGNS = [
  {
    name: 'Shopee Live Decor',
    budget: '1.2 tỷ',
    window: 'Tuần 3 • Tháng 1',
    goal: 'Tăng 25% chuyển đổi livestream',
    status: 'Đang triển khai'
  },
  {
    name: 'Voucher Tết 2026',
    budget: '3.5 tỷ',
    window: '15/01 - 05/02',
    goal: 'Đẩy GMV ngành gỗ +18%',
    status: 'Chờ phê duyệt'
  },
  {
    name: 'Affiliate mùa xuân',
    budget: '850 triệu',
    window: 'Q1 2026',
    goal: 'Thu hút creator nội thất mới',
    status: 'Soạn kế hoạch'
  }
]

const ROADMAP = [
  { label: 'Khởi động bán niên', owner: 'Growth Team', date: '18/01' },
  { label: 'Sync với nhà tài trợ', owner: 'Partnership', date: '22/01' },
  { label: 'Đo lường midpoint', owner: 'BI', date: '31/01' }
]

export default function MarketingPlan() {
  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Kế hoạch Marketing</p>
          <h2>Quỹ tăng trưởng & chiến dịch đang hoạt động</h2>
          <span>Đồng bộ ngân sách, KPI và tiến độ cùng seller chiến lược.</span>
        </div>
        <button type='button' className='admin-btn primary'>Tạo chiến dịch</button>
      </header>

      <div className='admin-grid admin-grid--split'>
        <section className='admin-panel'>
          <header className='admin-panel__header'>
            <h3>Chiến dịch chủ lực</h3>
            <button type='button' className='admin-btn ghost'>Gửi cập nhật</button>
          </header>
          <div className='admin-table is-striped'>
            {CAMPAIGNS.map((campaign) => (
              <div key={campaign.name} className='admin-table__row'>
                <div>
                  <strong>{campaign.name}</strong>
                  <span>{campaign.goal}</span>
                </div>
                <div className='admin-table__meta'>
                  <span>Ngân sách: {campaign.budget}</span>
                  <span>{campaign.window}</span>
                  <span className='admin-chip neutral'>{campaign.status}</span>
                </div>
                <button type='button' className='admin-btn outline'>Timeline</button>
              </div>
            ))}
          </div>
        </section>

        <section className='admin-panel'>
          <header className='admin-panel__header'>
            <h3>Mốc roadmap</h3>
            <button type='button' className='admin-btn ghost'>Chia sẻ</button>
          </header>
          <ol className='admin-roadmap'>
            {ROADMAP.map((milestone) => (
              <li key={milestone.label}>
                <div>
                  <strong>{milestone.label}</strong>
                  <span>{milestone.owner}</span>
                </div>
                <span>{milestone.date}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
