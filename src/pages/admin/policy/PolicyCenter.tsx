import React from 'react'

const POLICIES = [
  {
    title: 'Chính sách hoàn tiền nâng cao',
    owner: 'Team Policy',
    status: 'Áp dụng 01/02',
    summary: 'Chuẩn hoá quy trình kiểm tra chứng từ, giảm thời gian xử lý còn 24h.'
  },
  {
    title: 'Quy định seller livestream',
    owner: 'Creator Ops',
    status: 'Đang tham vấn',
    summary: 'Bổ sung yêu cầu minh bạch giá niêm yết và checklist kiểm duyệt nội dung.'
  },
  {
    title: 'Chính sách dữ liệu bên thứ ba',
    owner: 'Legal',
    status: 'Ban hành',
    summary: 'Ràng buộc việc chia sẻ dữ liệu người mua với đối tác fulfillment.'
  }
]

export default function PolicyCenter() {
  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Chính sách</p>
          <h2>Kiểm soát tuân thủ & cập nhật quy định</h2>
          <span>Ghi nhận thay đổi, rà soát tác động và chia sẻ đến seller.</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn ghost'>Tải template</button>
          <button type='button' className='admin-btn primary'>Tạo chính sách</button>
        </div>
      </header>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <h3>Danh mục chính sách</h3>
          <button type='button' className='admin-btn outline'>Lịch sử thay đổi</button>
        </header>

        <div className='admin-policy'>
          {POLICIES.map((policy) => (
            <article key={policy.title}>
              <div>
                <p className='admin-policy__status'>{policy.status}</p>
                <h4>{policy.title}</h4>
                <p>{policy.summary}</p>
              </div>
              <div className='admin-policy__meta'>
                <span>Owner: {policy.owner}</span>
                <button type='button' className='admin-btn ghost'>Chia sẻ</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
