import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import '../../../styles/admin.css'

export default function AdminLayout() {
  const todayLabel = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date())

  return (
    <div className='admin-surface min-h-screen text-neutral-900'>
      <div className='admin-layout-grid flex flex-col gap-6 pl-0 pr-6 pb-10 lg:flex-row lg:items-start'>
        <AdminSidebar />
        <main className='admin-main flex-1 space-y-6'>
          <AdminHeader />

          <section className='rounded-2xl border border-gray-200 bg-white shadow-sm shadow-black/5'>
            <div className=' top-[88px] z-10 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4 rounded-t-2xl'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-400'>Admin • Toàn sàn TMĐT</p>
                <strong className='text-lg text-gray-900'>Ca trực ngày {todayLabel}</strong>
              </div>
              <div className='flex flex-wrap gap-3'>
                <button type='button' className='rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'>
                  Tạo báo cáo nhanh
                </button>
                <button type='button' className='rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'>
                  Phân công nhiệm vụ
                </button>
              </div>
            </div>

            <div className='p-6'>
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
