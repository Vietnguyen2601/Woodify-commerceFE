import React from 'react'
import { Outlet } from 'react-router-dom'
import SellerSidebar from './SellerSidebar'

export default function SellerLayout() {
  return (
    <div className='seller-shell'>
      <header className='seller-header'>
        <div className='seller-header__brand'>
          <div>
            <p className='seller-header__eyebrow'>Woodify Seller Center</p>
            <h1>Kênh người bán Shopee style</h1>
          </div>
          <span className='seller-header__badge'>Beta</span>
        </div>

        <div className='seller-header__meta'>
          <form className='seller-header__search' aria-label='Tìm kiếm đơn hàng hoặc SKU'>
            <input type='search' placeholder='Tìm đơn hàng, sản phẩm, người mua...' />
            <button type='submit'>Tìm</button>
          </form>
          <div className='seller-header__actions'>
            <button type='button'>Đào tạo</button>
            <button type='button'>Hỗ trợ</button>
            <button type='button'>Thông báo</button>
            <div className='seller-header__avatar'>
              <span>WM</span>
              <small>Woodify</small>
            </div>
          </div>
        </div>
      </header>

      <div className='seller-body'>
        <SellerSidebar />
        <section className='seller-content'>
          <Outlet />
        </section>
      </div>
    </div>
  )
}
