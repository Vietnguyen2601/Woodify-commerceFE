import React from 'react'

const FLOW_STEPS = [
  {
    title: 'Radar dữ liệu',
    nodes: ['Logistics', 'Marketing spend', 'CS queue'],
    detail: 'Thu thập bất thường từ các stream chính và chuẩn hoá về cùng dashboard.'
  },
  {
    title: 'Đánh giá & phân loại',
    nodes: ['Mức độ ảnh hưởng', 'Chủ sở hữu', 'SLA xử lý'],
    detail: 'Ưu tiên dựa trên tác động đến đơn hàng và trải nghiệm người dùng cuối.'
  },
  {
    title: 'Kích hoạt hành động',
    nodes: ['Tự động hoá cảnh báo', 'Kế hoạch truyền thông', 'Điều phối seller'],
    detail: 'Đẩy nhiệm vụ sang các squad và phát thông báo đa kênh.'
  },
  {
    title: 'Hậu kiểm & học tập',
    nodes: ['Tài liệu hoá', 'Điểm cải tiến', 'Áp dụng chính sách'],
    detail: 'Chốt ca trực, lưu hồ sơ và đề xuất cập nhật chính sách.'
  }
]

export default function AdminFlow() {
  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Admin Flow</p>
          <h2>Luồng phản ứng & điều hành chuẩn hoá</h2>
          <span>Đảm bảo mỗi sự cố đều được phát hiện, phân loại và giải quyết có kiểm soát.</span>
        </div>
        <button type='button' className='admin-btn outline'>Tải SOP</button>
      </header>

      <div className='admin-flow'>
        {FLOW_STEPS.map((step, index) => (
          <article key={step.title} className='admin-flow__step'>
            <span className='admin-flow__index'>Bước {index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
            <div className='admin-flow__nodes'>
              {step.nodes.map((node) => (
                <span key={node} className='admin-chip neutral'>
                  {node}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
