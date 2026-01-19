import React from 'react'
import { Link } from 'react-router-dom'

interface NavBarProps {
  isAuthenticated?: boolean
}

export default function NavBar({ isAuthenticated = false }: NavBarProps) {
  return (
    <>
      <div className='home__mini-bar'>
        <Link to='/seller'>Kênh Người Bán</Link>
        <Link to='/become-seller'>Trở thành người bán</Link>
      </div>

      <nav className='home__navbar'>
        <Link to='/' className='home__logo'>Woodify</Link>

        <form className='home__search' aria-label='Tìm kiếm sản phẩm gỗ'>
          <input type='search' placeholder='Tìm kiếm nội thất gỗ, đồ trang trí, phụ kiện...' />
          <button type='submit'>Tìm</button>
        </form>

        <div className='home__actions'>
          <Link to='/cart' className='home__action-btn'>Giỏ hàng</Link>
          {isAuthenticated ? (
            <button className='home__avatar' aria-label='Tài khoản của bạn'>NT</button>
          ) : (
            <>
              <Link to='/auth/register' className='home__action-link'>Đăng ký</Link>
              <Link to='/auth/login' className='home__action-primary'>Đăng nhập</Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
