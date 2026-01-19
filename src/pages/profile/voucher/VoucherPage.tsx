import React from 'react'
import VoucherFilter from './VoucherFilter'
import VoucherCard from './VoucherCard'

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Có thể dùng' },
  { id: 'used', label: 'Đã dùng' },
  { id: 'expired', label: 'Hết hạn' }
]

const VOUCHERS = [
  { id: 'v1', title: 'Giảm 50K đơn 299K', subtitle: 'Áp dụng toàn sàn', expiry: '15 Th01 2026', status: 'active' as const },
  { id: 'v2', title: 'Freeship Xtra+', subtitle: 'Giảm tối đa 30K', expiry: '08 Th01 2026', status: 'active' as const },
  { id: 'v3', title: 'Giảm 100K Nội thất', subtitle: 'Cho shop yêu thích', expiry: 'Đã dùng', status: 'used' as const }
]

export default function VoucherPage() {
  const [activeFilter, setActiveFilter] = React.useState('all')
  const [code, setCode] = React.useState('')

  const filtered = VOUCHERS.filter(voucher => activeFilter === 'all' || voucher.status === activeFilter)

  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Kho voucher</p>
          <h3>Nhập mã hoặc chọn voucher để áp dụng</h3>
        </div>
        <div className='voucher-input'>
          <input
            type='text'
            placeholder='Nhập mã voucher'
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button className='cart-cta primary'>Lưu mã</button>
        </div>
      </header>

      <VoucherFilter filters={FILTERS} active={activeFilter} onChange={setActiveFilter} />

      <div className='voucher-grid'>
        {filtered.length === 0 ? (
          <div className='order-empty'>
            <div className='order-empty__icon'>🎟️</div>
            <h4>Chưa có voucher phù hợp</h4>
            <p>Chọn bộ lọc khác hoặc săn mã tại trang khuyến mãi.</p>
          </div>
        ) : (
          filtered.map(voucher => <VoucherCard key={voucher.id} voucher={voucher} />)
        )}
      </div>
    </div>
  )
}
