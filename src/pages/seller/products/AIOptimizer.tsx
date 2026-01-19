import React from 'react'

const SUGGESTIONS = [
  { title: 'Tối ưu tiêu đề', detail: 'Thêm từ khóa "nội thất gỗ" để tăng hiển thị 12%' },
  { title: 'Hình ảnh chuẩn Shopee', detail: 'Cập nhật 5/8 ảnh đúng tỉ lệ 1:1' },
  { title: 'Giá trị khuyến mãi', detail: 'Đề xuất mã giảm ₫50K cho đơn từ ₫500K' }
]

export default function AIOptimizer() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Công cụ tối ưu AI</p>
          <h2>Cải thiện chất lượng listing</h2>
        </div>
        <button type='button'>Đồng bộ dữ liệu</button>
      </header>

      <div className='seller-list'>
        {SUGGESTIONS.map(item => (
          <article key={item.title} className='seller-list__item'>
            <div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
            <button type='button' className='seller-page__primary'>Áp dụng</button>
          </article>
        ))}
      </div>
    </div>
  )
}
