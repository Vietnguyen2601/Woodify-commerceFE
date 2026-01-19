import React from 'react'

const PRIVACY_OPTIONS = [
  { id: 'profileVisibility', label: 'Hiển thị hồ sơ', description: 'Cho phép người khác xem thông tin cơ bản của bạn.' },
  { id: 'orderVisibility', label: 'Hiển thị đánh giá', description: 'Cho phép hiển thị đánh giá công khai.' },
  { id: 'recommendation', label: 'Cá nhân hóa đề xuất', description: 'Sử dụng lịch sử duyệt để gợi ý sản phẩm.' }
]

export default function PrivacySetting() {
  const [prefs, setPrefs] = React.useState({
    profileVisibility: true,
    orderVisibility: true,
    recommendation: false
  })

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Thiết lập riêng tư</p>
          <h3>Kiểm soát dữ liệu cá nhân</h3>
        </div>
      </header>

      <div className='privacy-settings'>
        {PRIVACY_OPTIONS.map(option => (
          <article key={option.id}>
            <div>
              <h4>{option.label}</h4>
              <p>{option.description}</p>
            </div>
            <button onClick={() => toggle(option.id as keyof typeof prefs)} className={prefs[option.id as keyof typeof prefs] ? 'toggle active' : 'toggle'}>
              <span />
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
