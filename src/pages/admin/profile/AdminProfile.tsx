import React from 'react'

const PREFERENCES = [
  { label: 'Thông báo sự cố', value: 'Push + Email + Teams' },
  { label: 'Khung giờ trực', value: '08:00 - 16:00' },
  { label: 'Kênh ưu tiên', value: 'Seller Care, Policy, Marketing' }
]

export default function AdminProfile() {
  const adminProfile = React.useMemo(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = window.localStorage.getItem('admin_profile')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      return null
    }
  }, [])

  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>Hồ sơ quản trị</p>
          <h2>Cấu hình cá nhân & bảo mật</h2>
          <span>Định danh cho ca trực hiện tại và nhật ký đăng nhập.</span>
        </div>
        <button type='button' className='admin-btn primary'>Chỉnh sửa hồ sơ</button>
      </header>

      <div className='admin-grid admin-grid--split'>
        <section className='admin-panel'>
          <header className='admin-panel__header'>
            <h3>Thông tin chính</h3>
            <button type='button' className='admin-btn ghost'>Đổi mật khẩu</button>
          </header>
          <ul className='admin-profile__list'>
            <li>
              <span>Họ tên</span>
              <strong>{adminProfile?.name || 'Woodify Admin'}</strong>
            </li>
            <li>
              <span>Vai trò</span>
              <strong>Head of Operations</strong>
            </li>
            <li>
              <span>Đăng nhập gần nhất</span>
              <strong>
                {adminProfile?.lastLogin
                  ? new Intl.DateTimeFormat('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }).format(new Date(adminProfile.lastLogin))
                  : 'Chưa xác định'}
              </strong>
            </li>
          </ul>
        </section>

        <section className='admin-panel'>
          <header className='admin-panel__header'>
            <h3>Tùy chỉnh thông báo</h3>
            <button type='button' className='admin-btn ghost'>Cập nhật</button>
          </header>
          <ul className='admin-profile__list'>
            {PREFERENCES.map((pref) => (
              <li key={pref.label}>
                <span>{pref.label}</span>
                <strong>{pref.value}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
