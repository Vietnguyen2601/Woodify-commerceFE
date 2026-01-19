import React from 'react'

const PRODUCTS = [
  { sku: 'TE-40', name: 'Teak đặc 40mm', stock: 24, status: 'Đang bán', price: '₫3.650.000' },
  { sku: 'SOI-A1', name: 'Sồi đỏ ghép thanh', stock: 120, status: 'Sắp hết hàng', price: '₫1.250.000' },
  { sku: 'PINE-02', name: 'Thông New Zealand', stock: 65, status: 'Đang bán', price: '₫890.000' }
]

export default function ProductList() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Quản lý sản phẩm</p>
          <h2>Tất cả sản phẩm</h2>
        </div>
        <div className='seller-page__actions'>
          <button type='button'>Nhập CSV</button>
          <button type='button' className='seller-page__primary'>Thêm sản phẩm</button>
        </div>
      </header>

      <div className='seller-table'>
        <div className='seller-table__head'>
          <span>SKU</span>
          <span>Tên sản phẩm</span>
          <span>Tồn kho</span>
          <span>Trạng thái</span>
          <span>Giá</span>
        </div>
        {PRODUCTS.map(item => (
          <div key={item.sku} className='seller-table__row'>
            <span>{item.sku}</span>
            <span>{item.name}</span>
            <span>{item.stock}</span>
            <span>{item.status}</span>
            <span>{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
