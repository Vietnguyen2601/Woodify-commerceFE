import React from 'react'

export default function ChangePassword() {
  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Bảo mật</p>
          <h3>Đổi mật khẩu đăng nhập</h3>
        </div>
      </header>

      <form className='form-grid'>
        <label>
          Mật khẩu hiện tại
          <input type='password' placeholder='•••••••' />
        </label>
        <label>
          Mật khẩu mới
          <input type='password' placeholder='Tối thiểu 8 ký tự' />
        </label>
        <label>
          Nhập lại mật khẩu mới
          <input type='password' placeholder='Xác nhận mật khẩu' />
        </label>
        <div className='profile-form__actions'>
          <button type='reset' className='cart-cta ghost'>Hủy</button>
          <button type='submit' className='cart-cta primary'>Cập nhật</button>
        </div>
      </form>
    </div>
  )
}
