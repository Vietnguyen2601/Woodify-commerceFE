import React from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import ShopDetailPage from './pages/shop/ShopDetailPage'
import Cart from './pages/Cart'
import Checkout from './pages/checkout/Checkout'
import { Payment } from './pages/Payment'
import PaymentSuccess from './pages/payment/PaymentSuccess'
import PaymentCancel from './pages/payment/PaymentCancel'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/Profile'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerRegistration from './pages/seller/SellerRegistration'
import SellerRegister from './pages/seller/SellerRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import UploadImageDemo from './pages/UploadImageDemo'
import Header from './components/layout/Header/Header'
import AuthPageHeader from './components/layout/Header/AuthPageHeader'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { useCart } from './store/cartStore'
import './styles/app.css'
import './styles/payment.css'

export default function App() {
  const location = useLocation()
  const cartItemCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const isProfileRoute = location.pathname.startsWith('/profile')
  const isSellerRoute = location.pathname.startsWith('/seller')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/auth/login') ||
    location.pathname.startsWith('/auth/register')
  const showUserHeader = !isSellerRoute && !isAdminRoute && !isAuthRoute
  const showFooter = !isSellerRoute && !isAdminRoute
  const isShopPublicPage = location.pathname.startsWith('/shop/')
  const isProductDetailPage = location.pathname.startsWith('/product/')
  const isCartPage = location.pathname === '/cart'
  const isCheckoutPage = location.pathname === '/checkout'
  const isFullBleedRoute =
    location.pathname === '/' ||
    isShopPublicPage ||
    isProductDetailPage ||
    isCartPage ||
    isCheckoutPage ||
    isProfileRoute ||
    isSellerRoute ||
    isAdminRoute
  const authActionLabel = location.pathname.toLowerCase().includes('register') ? 'Đăng ký' : 'Đăng nhập'

  return (
    <div className='app'>
      {showUserHeader && <Header cartItemCount={cartItemCount} />}
      {isAuthRoute && <AuthPageHeader actionLabel={authActionLabel} />}
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
          <Route path={ROUTES.SHOP_PREVIEW} element={<Navigate to={ROUTES.CATALOG} replace />} />
          <Route path='/shop/:shopSegment' element={<ShopDetailPage />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/checkout-multishop' element={<Navigate to={ROUTES.CHECKOUT} replace />} />
          <Route path='/payment' element={<Payment />} />
          <Route path='/payment/success' element={<PaymentSuccess />} />
          <Route path='/payment/cancel' element={<PaymentCancel />} />
          <Route
            path={ROUTES.PAYMENT_CALLBACK_CANCEL}
            element={<Navigate to={`${ROUTES.PROFILE}?tab=wallet`} replace />}
          />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/auth/login' element={<Login />} />
          <Route path='/auth/register' element={<Register />} />
          <Route path='/profile/*' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/seller/registration' element={<SellerRegistration />} />
          <Route path='/seller/register' element={<SellerRegister />} />
          <Route path='/seller/*' element={<SellerDashboard />} />
          <Route path='/admin/*' element={<AdminDashboard />} />
          <Route path='/upload-demo' element={<UploadImageDemo />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  )
}
