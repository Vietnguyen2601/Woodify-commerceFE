import React from 'react'

const RETURN_CASES = [
  { id: 'RET-01', reason: 'Sai kích thước', value: '₫1.250.000', status: 'Đang xử lý', deadline: 'Trả lời trong 12h' },
  { id: 'RET-02', reason: 'Hư hỏng bề mặt', value: '₫2.480.000', status: 'Chờ bằng chứng', deadline: 'Còn 4h' }
]

export default function Returns() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Trả hàng / Hoàn tiền / Hủy</p>
          <h2>Ưu tiên phản hồi người mua</h2>
        </div>
        <button type='button' className='seller-page__primary'>Tạo phản hồi mẫu</button>
      </header>

      <div className='seller-list'>
        {RETURN_CASES.map(item => (
          <article key={item.id} className='seller-list__item'>
            <div>
              <h3>{item.id}</h3>
              <p>{item.reason}</p>
            </div>
            <div>
              <p>{item.value}</p>
              <small>{item.status}</small>
              <span>{item.deadline}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
