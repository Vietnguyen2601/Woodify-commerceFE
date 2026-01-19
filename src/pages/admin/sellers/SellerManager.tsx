import React from 'react'

const SELLERS = [
  {
    shop: 'Xưởng Gỗ Bắc Ninh',
    rating: '4.8',
    status: 'On track',
    tickets: 2,
    risk: 'Thời gian giao hàng'
  },
  {
    shop: 'Mây Tre Decor',
    rating: '4.9',
    status: 'Cần hỗ trợ',
    tickets: 5,
    risk: 'SLA chat thấp'
  },
  {
    shop: 'Gỗ Nhà Ấm',
    rating: '4.6',
    status: 'Giám sát',
    tickets: 1,
    risk: 'Đơn hoàn tăng'
  }
]

export default function SellerManager() {
  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Quản lý Seller</p>
          <h2>Tầng seller chiến lược</h2>
          <span>Quản trị hiệu suất, chăm sóc và cảnh báo dành cho các shop lớn.</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn outline'>Xuất danh sách</button>
          <button type='button' className='admin-btn primary'>Gửi khuyến nghị</button>
        </div>
      </header>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <h3>Top seller cần quan tâm</h3>
          <button type='button' className='admin-btn ghost'>Giao nhiệm vụ</button>
        </header>

        <div className='admin-table'>
          {SELLERS.map((seller) => (
            <div key={seller.shop} className='admin-table__row'>
              <div>
                <strong>{seller.shop}</strong>
                <span>Rủi ro: {seller.risk}</span>
              </div>
              <div className='admin-table__meta'>
                <span>Đánh giá: {seller.rating}</span>
                <span className={`admin-chip ${seller.status === 'On track' ? 'success' : 'warning'}`}>
                  {seller.status}
                </span>
                <span>Ticket mở: {seller.tickets}</span>
              </div>
              <button type='button' className='admin-btn outline'>Hồ sơ seller</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
