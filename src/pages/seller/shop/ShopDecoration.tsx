import React from 'react'

const BLOCKS = [
  { name: 'Banner chính', status: 'Đã cập nhật 2 ngày trước' },
  { name: 'Danh mục nổi bật', status: 'Chưa có nội dung' },
  { name: 'Video giới thiệu', status: 'Đang chờ duyệt' }
]

export default function ShopDecoration() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Trang trí shop</p>
          <h2>Kéo thả bố cục</h2>
        </div>
        <button type='button' className='seller-page__primary'>Tạo bố cục mới</button>
      </header>

      <div className='seller-list'>
        {BLOCKS.map(block => (
          <article key={block.name} className='seller-list__item'>
            <div>
              <h3>{block.name}</h3>
              <p>{block.status}</p>
            </div>
            <button type='button'>Chỉnh sửa</button>
          </article>
        ))}
      </div>
    </div>
  )
}
