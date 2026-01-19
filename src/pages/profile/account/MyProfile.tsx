import React from 'react'

export default function MyProfile() {
  const [form, setForm] = React.useState({
    name: 'Ngọc Linh',
    email: 'linh.nguyen@example.com',
    phone: '0901 234 567',
    birthday: '1994-04-12',
    gender: 'female',
    bio: 'Yêu thích decor nhà cửa và nội thất tối giản.'
  })

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Hồ sơ</p>
          <h3>Chỉnh sửa thông tin cá nhân</h3>
        </div>
        <button className='cart-link'>Xem hồ sơ công khai</button>
      </header>

      <div className='profile-form'>
        <div className='profile-form__avatar'>
          <img src='https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80' alt='Avatar' />
          <label className='cart-cta ghost'>
            Tải ảnh mới
            <input type='file' accept='image/*' />
          </label>
          <p>PNG hoặc JPG, tối đa 3MB.</p>
        </div>

        <form className='profile-form__fields'>
          <label>
            Họ và tên
            <input type='text' value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </label>
          <label>
            Email
            <input type='email' value={form.email} onChange={e => handleChange('email', e.target.value)} />
          </label>
          <label>
            Số điện thoại
            <input type='tel' value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          </label>
          <label>
            Ngày sinh
            <input type='date' value={form.birthday} onChange={e => handleChange('birthday', e.target.value)} />
          </label>
          <label>
            Giới tính
            <select value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
              <option value='female'>Nữ</option>
              <option value='male'>Nam</option>
              <option value='other'>Khác</option>
            </select>
          </label>
          <label>
            Giới thiệu
            <textarea rows={4} value={form.bio} onChange={e => handleChange('bio', e.target.value)} />
          </label>
          <div className='profile-form__actions'>
            <button type='button' className='cart-cta ghost'>Hủy</button>
            <button type='submit' className='cart-cta primary'>Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  )
}
