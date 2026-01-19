import React from 'react'

const CATEGORIES = [
  {
    name: 'Gỗ nội thất',
    sku: 624,
    growth: '+12%',
    health: 'Ổn định',
    owners: ['Ân', 'Hải']
  },
  {
    name: 'Trang trí nhà',
    sku: 488,
    growth: '+6%',
    health: 'Cần thêm seller premium',
    owners: ['Hương']
  },
  {
    name: 'Đồ gia dụng',
    sku: 921,
    growth: '+2%',
    health: 'Thiếu hàng kho miền Trung',
    owners: ['Phúc', 'Đông']
  },
  {
    name: 'Quà tặng thủ công',
    sku: 188,
    growth: '+24%',
    health: 'Chuẩn bị campaign Tết',
    owners: ['Lan']
  }
]

export default function CategoryManager() {
  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Quản lý Categories</p>
          <h2>Điều phối ngành hàng & nguồn cung</h2>
          <span>Phân tầng chất lượng seller, theo dõi tồn kho và trạng thái chiến dịch từng ngành.</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn ghost'>Nhập từ CSV</button>
          <button type='button' className='admin-btn primary'>Tạo category</button>
        </div>
      </header>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <h3>Danh sách ưu tiên tuần này</h3>
          <button type='button' className='admin-btn outline'>Bộ lọc nâng cao</button>
        </header>

        <div className='admin-table is-striped'>
          {CATEGORIES.map((category) => (
            <div key={category.name} className='admin-table__row'>
              <div>
                <strong>{category.name}</strong>
                <span>{category.health}</span>
              </div>
              <div className='admin-table__meta'>
                <span>SKU: {category.sku}</span>
                <span className='admin-chip success'>{category.growth}</span>
                <span>Owners: {category.owners.join(', ')}</span>
              </div>
              <button type='button' className='admin-btn ghost'>Chi tiết</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
