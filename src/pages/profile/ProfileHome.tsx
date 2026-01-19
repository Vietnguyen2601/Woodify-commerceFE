import React from 'react'
import { Link } from 'react-router-dom'

export default function ProfileHome() {
  const insights = [
    { label: 'Đơn đang xử lý', value: '02', href: '/profile/orders' },
    { label: 'Voucher khả dụng', value: '05', href: '/profile/voucher' },
    { label: 'Shopee Xu', value: '1.250', href: '/profile/xu' }
  ]

  return (
    <div className='account-panel'>
      <div className='account-panel__hero'>
        <div>
          <p className='eyebrow'>Xin chào trở lại</p>
          <h2>Quản lý mọi hoạt động mua sắm tại một nơi</h2>
          <p>Bạn có thể theo dõi đơn hàng, cập nhật hồ sơ, kích hoạt voucher và quản lý Shopee Xu ngay tại đây.</p>
        </div>
        <Link to='/profile/orders' className='cart-cta primary'>Xem đơn mua</Link>
      </div>

      <div className='account-panel__insights'>
        {insights.map(item => (
          <Link key={item.label} to={item.href} className='account-insight'>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </Link>
        ))}
      </div>
    </div>
  )
}
