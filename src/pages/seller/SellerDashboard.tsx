import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SellerLayout from './components/SellerLayout'
import SellerHome from './dashboard/SellerHome'
import AllOrders from './orders/AllOrders'
import BulkShipping from './orders/BulkShipping'
import Handover from './orders/Handover'
import Returns from './orders/Returns'
import ProductList from './products/ProductList'
import AddProduct from './products/AddProduct'
import ProductVersionList from './products/ProductVersionList'
import Revenue from './finance/Revenue'
import BankAccount from './finance/BankAccount'
import ShopProfile from './shop/ShopProfile'
import ShopRatingManagement from './support/ShopRatingManagement'

export default function SellerDashboard() {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<SellerHome />} />

        <Route path='orders' element={<AllOrders />} />
        <Route path='orders/bulk-shipping' element={<BulkShipping />} />
        <Route path='orders/handover' element={<Handover />} />
        <Route path='orders/returns' element={<Returns />} />
        <Route path='products' element={<ProductList />} />
        <Route path='products/add' element={<AddProduct />} />
        <Route path='products/:productId/versions' element={<ProductVersionList />} />

        <Route path='finance' element={<Revenue />} />
        <Route path='finance/revenue' element={<Revenue />} />
        <Route path='finance/bank' element={<BankAccount />} />

        <Route path='shop/profile' element={<ShopProfile />} />

        <Route path='support' element={<Navigate to='/seller/support/shop-rating' replace />} />
        <Route path='support/chat-management' element={<Navigate to='/seller/support/shop-rating' replace />} />
        <Route path='support/shop-rating' element={<ShopRatingManagement />} />

        <Route path='*' element={<Navigate to='/seller' replace />} />
      </Route>
    </Routes>
  )
}
