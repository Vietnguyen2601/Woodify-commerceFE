import React from 'react'

export default function ShopSettings() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Thiết lập shop</p>
          <h2>Quy tắc vận hành</h2>
        </div>
        <button type='button'>Lịch sử thay đổi</button>
      </header>

      <form className='seller-form'>
        <label>
          Thời gian xử lý tối đa (giờ)
          <input type='number' defaultValue={24} />
        </label>
        <label>
          Chính sách trả hàng
          <textarea rows={4} defaultValue='Hỗ trợ đổi trả trong 7 ngày với điều kiện nguyên tem, chưa sử dụng.'></textarea>
        </label>
        <label>
          Tự động phản hồi chat
          <textarea rows={3} placeholder='Xin chào, Woodify đã nhận được tin nhắn...'></textarea>
        </label>
        <div className='seller-form__actions'>
          <button type='button'>Khôi phục</button>
          <button type='submit' className='seller-page__primary'>Lưu thay đổi</button>
        </div>
      </form>
    </div>
  )
}
