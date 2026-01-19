import React from 'react'

const CASES = [
  { id: 'KP-001', subject: 'Người mua khiếu nại chất lượng', status: 'Đang xử lý', deadline: 'Còn 8h' },
  { id: 'KP-002', subject: 'Tranh chấp phí vận chuyển', status: 'Đã phản hồi', deadline: '-' }
]

export default function Complaints() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Quản lý khiếu nại</p>
          <h2>Trung tâm xử lý</h2>
        </div>
        <button type='button'>Kho lưu trữ</button>
      </header>

      <div className='seller-table'>
        <div className='seller-table__head'>
          <span>Mã case</span>
          <span>Nội dung</span>
          <span>Trạng thái</span>
          <span>Hạn phản hồi</span>
        </div>
        {CASES.map(item => (
          <div key={item.id} className='seller-table__row'>
            <span>{item.id}</span>
            <span>{item.subject}</span>
            <span>{item.status}</span>
            <span>{item.deadline}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
