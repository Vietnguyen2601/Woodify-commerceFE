import React from 'react'

const INFO_FIELDS = [
  { id: 'fullname', label: 'Họ và tên', value: 'Nguyễn Thị Ngọc Linh' },
  { id: 'id', label: 'CMND/CCCD', value: '0792 123 456' },
  { id: 'tax', label: 'Mã số thuế', value: 'N/A' },
  { id: 'member', label: 'Hạng thành viên', value: 'Shopee Premium' }
]

export default function PersonalInfo() {
  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Thông tin cá nhân</p>
          <h3>Thông tin pháp lý và thành viên</h3>
        </div>
        <button className='cart-link'>Yêu cầu chỉnh sửa</button>
      </header>

      <div className='info-grid'>
        {INFO_FIELDS.map(field => (
          <article key={field.id}>
            <span>{field.label}</span>
            <strong>{field.value}</strong>
          </article>
        ))}
      </div>
    </div>
  )
}
