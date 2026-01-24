import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import { Payment } from './pages/Payment'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/Profile'
import SellerDashboard from './pages/seller/SellerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import Header from './components/layout/Header/Header'
import { useCart } from './store/cartStore'
import './styles/app.css'
import './styles/payment.css'

export default function App() {
  const location = useLocation()
  const cartItemCount = useCart((state) => state.items.reduce((sum, item) => sum + item.qty, 0))
  const isProfileRoute = location.pathname.startsWith('/profile')
  const isSellerRoute = location.pathname.startsWith('/seller')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const showUserHeader = !isSellerRoute && !isAdminRoute
  const isFullBleedRoute = location.pathname === '/' || isProfileRoute || isSellerRoute || isAdminRoute

  return (
    <div className='app'>
      {showUserHeader && <Header cartItemCount={cartItemCount} />}
      {/* {!isProfileRoute && (
        <header className='topbar'>
          <div className='brand'><Link to='/'>WoodMarketplace</Link></div>
          <nav className='nav'>
            <Link to='/catalog'>Catalog</Link>
            <Link to='/cart'>Cart</Link>
            <Link to='/seller'>Seller</Link>
            <Link to='/admin'>Admin</Link>
          </nav>
        </header>
      )} */}

      <main className={isFullBleedRoute ? 'app-full-bleed' : 'container'}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/catalog' element={<Catalog />} />
          <Route path='/product/:id' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/payment' element={<Payment />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/auth/login' element={<Login />} />
          <Route path='/auth/register' element={<Register />} />
          <Route path='/profile/*' element={<Profile />} />
          <Route path='/seller/*' element={<SellerDashboard />} />
          <Route path='/admin/*' element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isProfileRoute && location.pathname !== '/' && (
        <footer className='footer'>
          © {new Date().getFullYear()} Wood Marketplace
        </footer>
      )}
    </div>
  )
}
