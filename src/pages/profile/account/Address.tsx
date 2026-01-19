import React from 'react'

const ADDRESSES = [
  {
    id: 'a1',
    label: 'Nhà riêng',
    detail: '12/5 Nguyễn Văn Thương, Quận Bình Thạnh, TP.HCM',
    phone: '0901 234 567',
    default: true
  },
  {
    id: 'a2',
    label: 'Văn phòng',
    detail: 'Tầng 8, 123 Điện Biên Phủ, Quận 3, TP.HCM',
    phone: '0388 222 444',
    default: false
  }
]

export default function Address() {
  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Sổ địa chỉ</p>
          <h3>Địa chỉ nhận hàng</h3>
        </div>
        <button className='cart-cta ghost'>+ Thêm địa chỉ</button>
      </header>

      <div className='address-list'>
        {ADDRESSES.map(address => (
          <article key={address.id}>
            <header>
              <h4>{address.label}</h4>
              {address.default && <span className='badge'>Mặc định</span>}
            </header>
            <p>{address.detail}</p>
            <small>Điện thoại: {address.phone}</small>
            <div>
              <button className='cart-link'>Chỉnh sửa</button>
              <button className='cart-link muted'>Xóa</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
