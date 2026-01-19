import React from 'react'

export default function ShopProfile() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Hồ sơ shop</p>
          <h2>Cập nhật thông tin thương hiệu</h2>
        </div>
        <button type='button'>Xem trước</button>
      </header>

      <form className='seller-form'>
        <label>
          Tên shop
          <input type='text' defaultValue='Woodify Studio' />
        </label>
        <label>
          Mô tả ngắn
          <textarea rows={4} defaultValue='Sàn thương mại nội thất gỗ cao cấp, chuẩn Shopee.'></textarea>
        </label>
        <label>
          Địa chỉ kho
          <input type='text' defaultValue='123 Phổ Quang, Phú Nhuận, TP.HCM' />
        </label>
        <div className='seller-form__actions'>
          <button type='button'>Hủy</button>
          <button type='submit' className='seller-page__primary'>Lưu</button>
        </div>
      </form>
    </div>
  )
}
