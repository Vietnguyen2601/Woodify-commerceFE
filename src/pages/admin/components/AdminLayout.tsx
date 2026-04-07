import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAppLanguage } from '@/hooks'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import '../../../styles/admin.css'

export default function AdminLayout() {
  const { isVietnamese } = useAppLanguage()
  const todayLabel = new Intl.DateTimeFormat(isVietnamese ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date())

  return (
    <div className='admin-surface min-h-screen text-neutral-900'>
      <div className='admin-layout-grid flex flex-col gap-0 pl-0 pr-0 pb-0 lg:flex-row lg:items-start'>
        <AdminSidebar />
        <main className='admin-main flex-1 space-y-6'>
          <AdminHeader />

          <section className='admin-workspace'>
            <div className='admin-shift-bar'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
                  {isVietnamese ? 'Admin • Toàn sàn TMĐT' : 'Admin • Marketplace'}
                </p>
                <strong className='text-lg text-gray-900'>
                  {isVietnamese ? `Ca trực ngày ${todayLabel}` : `Shift for ${todayLabel}`}
                </strong>
              </div>
              <div className='admin-shift-actions'>
                <button type='button' className='admin-shift-btn'>
                  {isVietnamese ? 'Tạo báo cáo nhanh' : 'Create quick report'}
                </button>
                <button type='button' className='admin-shift-btn admin-shift-btn--ghost'>
                  {isVietnamese ? 'Phân công nhiệm vụ' : 'Assign tasks'}
                </button>
              </div>
            </div>

            <div className='admin-workspace__body'>
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
