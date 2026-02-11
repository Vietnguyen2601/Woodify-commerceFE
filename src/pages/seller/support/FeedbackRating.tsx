import React from 'react'
import { useNavigate } from 'react-router-dom'

const FEEDBACK_OPTIONS = [
  {
    id: 'chat',
    title: 'Chat Management',
    description: 'Giám sát chat, trả lời nhanh và cấu hình widget hỗ trợ khách.',
    highlights: [
      { label: 'Response rate', value: '95.8%' },
      { label: 'Avg. time', value: '8.5 phút' }
    ],
    badge: 'Hỗ trợ realtime',
    gradient: 'from-amber-900 via-amber-700 to-yellow-500',
    route: '/seller/support/chat-management'
  },
  {
    id: 'rating',
    title: 'Shop Rating Management',
    description: 'Theo dõi đánh giá, lọc phản hồi và trả lời khách nhanh chóng.',
    highlights: [
      { label: 'Overall', value: '4.8 / 5.0' },
      { label: 'Total reviews', value: '1.248' }
    ],
    badge: 'Danh tiếng shop',
    gradient: 'from-stone-900 via-amber-900 to-rose-600/80',
    route: '/seller/support/shop-rating'
  }
] as const

const QUICK_STATS = [
  { label: 'Tổng chat tuần này', value: '342', delta: '+28' },
  { label: 'Đánh giá mới 7 ngày', value: '15', delta: '+12%' }
]

export default function FeedbackRating() {
  const navigate = useNavigate()

  return (
    <div className='space-y-6'>
      <section className='rounded-3xl border border-amber-900/10 bg-white p-6 shadow-[0_25px_45px_-30px_rgba(15,23,42,0.45)]'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-stone-400'>Customer success</p>
            <h1 className='text-2xl font-semibold text-stone-900'>Feedback & Rating Center</h1>
            <p className='max-w-2xl text-sm text-stone-600'>
              Quản lý liền mạch trải nghiệm khách hàng: theo dõi chat, tối ưu phản hồi và kiểm soát danh tiếng shop
              trong một hub duy nhất.
            </p>
            <div className='flex flex-wrap gap-4'>
              {QUICK_STATS.map(stat => (
                <div key={stat.label} className='rounded-2xl border border-stone-200/80 bg-stone-50 px-4 py-3'>
                  <p className='text-xs uppercase tracking-wide text-stone-400'>{stat.label}</p>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-xl font-semibold text-stone-900'>{stat.value}</span>
                    <span className='text-xs font-medium text-green-600'>{stat.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-3xl border border-stone-200/80 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 text-sm text-stone-600'>
            <p className='font-semibold text-stone-900'>Gợi ý</p>
            <p>Hoàn tất phản hồi đánh giá ≤24h để giữ điểm Shop Score cao và được đề xuất trong mục Shopee Picks.</p>
          </div>
        </div>
      </section>

      <section className='grid gap-6 md:grid-cols-2'>
        {FEEDBACK_OPTIONS.map(option => (
          <article
            key={option.id}
            className='group relative overflow-hidden rounded-3xl border border-amber-900/10 bg-white p-6 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)]'
          >
            <div className='absolute inset-0 opacity-0 transition group-hover:opacity-100'>
              <div className={`h-full w-full bg-gradient-to-br ${option.gradient} opacity-5`} aria-hidden />
            </div>
            <div className='relative flex h-full flex-col gap-6'>
              <div className='flex flex-wrap items-center gap-3'>
                <span className='rounded-2xl border border-amber-900/20 bg-amber-900/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900'>
                  {option.badge}
                </span>
                <button
                  type='button'
                  className='ml-auto rounded-2xl border border-stone-200/70 px-3 py-1 text-xs font-medium text-stone-500 transition hover:border-amber-700 hover:text-amber-800'
                  onClick={() => navigate(option.route)}
                >
                  Chi tiết
                </button>
              </div>
              <div className='space-y-2'>
                <h2 className='text-xl font-semibold text-stone-900'>{option.title}</h2>
                <p className='text-sm text-stone-600'>{option.description}</p>
              </div>
              <dl className='grid gap-4 sm:grid-cols-2'>
                {option.highlights.map(item => (
                  <div key={item.label} className='rounded-2xl border border-stone-200/70 bg-stone-50/60 px-4 py-3'>
                    <dt className='text-xs text-stone-500'>{item.label}</dt>
                    <dd className='text-lg font-semibold text-stone-900'>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className='mt-auto flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50 px-4 py-3'>
                <p className='text-sm font-medium text-stone-700'>Mở trang {option.title}</p>
                <button
                  type='button'
                  onClick={() => navigate(option.route)}
                  className='rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-amber-900/30 transition hover:translate-x-1'
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
