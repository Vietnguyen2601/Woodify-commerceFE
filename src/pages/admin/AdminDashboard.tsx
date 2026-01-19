import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminHome from './dashboard/AdminHome'
import AdminFlow from './flow/AdminFlow'
import CategoryManager from './categories/CategoryManager'
import SellerManager from './sellers/SellerManager'
import OrderManager from './orders/OrderManager'
import MarketingPlan from './marketing/MarketingPlan'
import PolicyCenter from './policy/PolicyCenter'
import AdminProfile from './profile/AdminProfile'

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path='flow' element={<AdminFlow />} />
        <Route path='categories' element={<CategoryManager />} />
        <Route path='sellers' element={<SellerManager />} />
        <Route path='orders' element={<OrderManager />} />
        <Route path='marketing' element={<MarketingPlan />} />
        <Route path='policies' element={<PolicyCenter />} />
        <Route path='profile' element={<AdminProfile />} />
        <Route path='*' element={<Navigate to='/admin' replace />} />
      </Route>
    </Routes>
  )
}
