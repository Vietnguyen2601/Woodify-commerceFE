import React from 'react'

export default function ShippingSettings() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Cài đặt vận chuyển</p>
          <h2>Thiết lập hãng vận chuyển</h2>
        </div>
        <button type='button' className='seller-page__primary'>Lưu</button>
      </header>

      <form className='seller-form'>
        <label>
          Cut-off time (giờ)
          <input type='number' defaultValue={15} />
        </label>
        <label>
          Đối tác ưu tiên
          <select>
            <option>Shopee Express</option>
            <option>J&T</option>
            <option>GHTK</option>
          </select>
        </label>
        <label>
          Ghi chú với shipper
          <textarea rows={3} placeholder='Ví dụ: Liên hệ trước 30 phút...'></textarea>
        </label>
      </form>
    </div>
  )
}
