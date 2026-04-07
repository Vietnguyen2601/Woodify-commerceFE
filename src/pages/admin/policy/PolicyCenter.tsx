import React from 'react'
import { useAppLanguage } from '@/hooks'

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
  const { isVietnamese } = useAppLanguage()

  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>{isVietnamese ? 'Chính sách' : 'Policy'}</p>
          <h2>{isVietnamese ? 'Kiểm soát tuân thủ và cập nhật quy định' : 'Compliance control and policy updates'}</h2>
          <span>{isVietnamese ? 'Ghi nhận thay đổi, rà soát tác động và chia sẻ đến seller.' : 'Track changes, assess impact, and share updates with sellers.'}</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn ghost'>{isVietnamese ? 'Tải template' : 'Download template'}</button>
          <button type='button' className='admin-btn primary'>{isVietnamese ? 'Tạo chính sách' : 'Create policy'}</button>
        </div>
      </header>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <h3>{isVietnamese ? 'Danh mục chính sách' : 'Policy catalog'}</h3>
          <button type='button' className='admin-btn outline'>{isVietnamese ? 'Lịch sử thay đổi' : 'Change history'}</button>
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
                <button type='button' className='admin-btn ghost'>{isVietnamese ? 'Chia sẻ' : 'Share'}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
