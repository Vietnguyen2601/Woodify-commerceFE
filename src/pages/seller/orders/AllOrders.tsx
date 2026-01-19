import React from 'react'

const FILTERS = ['Tất cả', 'Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Tranh chấp']

const ORDERS = [
  { id: 'SG-001', buyer: 'Xưởng Gỗ Minh Long', status: 'Chờ xác nhận', value: '₫12.500.000', deadline: '< 30 phút', badge: 'SLA' },
  { id: 'SG-002', buyer: 'Studio Onyx', status: 'Đang chuẩn bị', value: '₫3.280.000', deadline: 'Pickup 15:00', badge: 'Ưu tiên' },
  { id: 'SG-003', buyer: 'Nội thất An Phát', status: 'Đang giao', value: '₫8.900.000', deadline: 'Hôm nay', badge: 'COD' }
]

export default function AllOrders() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Quản lý đơn hàng</p>
          <h2>Tất cả đơn hàng</h2>
        </div>
        <div className='seller-page__actions'>
          <button type='button'>Xuất Excel</button>
          <button type='button' className='seller-page__primary'>Tạo đơn thủ công</button>
        </div>
      </header>

      <div className='seller-page__filters'>
        {FILTERS.map(filter => (
          <button key={filter} type='button'>{filter}</button>
        ))}
      </div>

      <div className='seller-table'>
        <div className='seller-table__head'>
          <span>Mã đơn</span>
          <span>Người mua</span>
          <span>Trạng thái</span>
          <span>Giá trị</span>
          <span>Thời hạn</span>
        </div>
        {ORDERS.map(order => (
          <div key={order.id} className='seller-table__row'>
            <span>{order.id}</span>
            <span>{order.buyer}</span>
            <span>
              {order.status}
              <small>{order.badge}</small>
            </span>
            <span>{order.value}</span>
            <span>{order.deadline}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
