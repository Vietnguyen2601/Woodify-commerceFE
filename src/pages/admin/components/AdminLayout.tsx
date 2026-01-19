import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import '../../../styles/admin.css'

export default function AdminLayout() {
  const todayLabel = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date())

  return (
    <div className='admin-shell'>
      <header className='admin-header'>
        <div className='admin-header__brand'>
          <p className='admin-header__eyebrow'>Woodify Admin Flow</p>
          <h1>Trung tâm điều hành hệ sinh thái</h1>
          <small>Giám sát seller, đơn hàng, marketing và chính sách theo thời gian thực.</small>
        </div>

        <div className='admin-header__actions'>
          <div className='admin-header__signal'>
            <span>Uptime</span>
            <strong>99.98%</strong>
          </div>
          <div className='admin-header__signal is-warning'>
            <span>Incident</span>
            <strong>0 mới</strong>
          </div>
          <div className='admin-header__signal'>
            <span>Queues</span>
            <strong>4 SLA</strong>
          </div>
          <button type='button' className='admin-btn primary'>Chế độ trực</button>
          <button type='button' className='admin-btn ghost'>Gửi broadcast</button>
        </div>
      </header>

      <div className='admin-body'>
        <AdminSidebar />
        <section className='admin-content'>
          <div className='admin-content__toolbar'>
            <div>
              <p className='admin-breadcrumb'>Admin • Toàn sàn TMĐT</p>
              <strong>Ca trực ngày {todayLabel}</strong>
            </div>
            <div className='admin-toolbar__actions'>
              <button type='button' className='admin-btn outline'>Tạo báo cáo nhanh</button>
              <button type='button' className='admin-btn ghost'>Phân công nhiệm vụ</button>
            </div>
          </div>

          <Outlet />
        </section>
      </div>
    </div>
  )
}
