import React from 'react'

const STORE_META = {
  name: 'Wood Craft Artisans',
  status: 'ACTIVE',
  initials: 'WC'
}

const CHAT_METRICS = [
  {
    title: 'Total Chats',
    value: '342',
    delta: '+28',
    deltaLabel: 'this week',
    accent: 'text-stone-900'
  },
  {
    title: 'Chat Response Rate',
    value: '95.8%',
    delta: '+2.3%',
    deltaLabel: 'vs last month',
    accent: 'text-green-600'
  },
  {
    title: 'Average Response Time',
    value: '8.5 min',
    delta: '-1.2 min',
    deltaLabel: 'improved',
    accent: 'text-blue-600'
  }
]

const QUICK_REPLIES = [
  {
    category: 'Greeting',
    title: 'Welcome Message',
    content: 'Xin chào! Cảm ơn bạn đã quan tâm đến sản phẩm của shop. Mình có thể hỗ trợ gì cho bạn?',
    lastUsed: 'Today'
  },
  {
    category: 'Shipping',
    title: 'Shipping Information',
    content: 'Shop giao hàng toàn quốc, thời gian dự kiến 3-5 ngày làm việc tùy khu vực.',
    lastUsed: 'Yesterday'
  },
  {
    category: 'Product',
    title: 'Product Details',
    content: 'Sản phẩm được làm từ gỗ tự nhiên 100%, có chứng nhận chất lượng và bảo hành 12 tháng.',
    lastUsed: '2 days ago'
  },
  {
    category: 'Payment',
    title: 'Payment Methods',
    content: 'Shop hỗ trợ thanh toán COD, chuyển khoản, ví điện tử và các thẻ tín dụng.',
    lastUsed: '3 days ago'
  }
]

const INSIGHTS = [
  { label: 'Peak Chat Hours', value: '2PM - 5PM', helper: 'Most active time' },
  { label: 'Avg. Messages/Chat', value: '12.3', helper: '+2.1 vs last month' },
  { label: 'Chat to Order Rate', value: '24.5%', helper: '+3.2% improved' },
  { label: 'Customer Satisfaction', value: '4.7/5', helper: 'Based on 156 ratings' }
]

const WIDGET_SETTINGS = [
  { label: 'Show online status', helper: "Display when you're online" },
  { label: 'Allow file attachments', helper: 'Buyers can send images/files' },
  { label: 'Auto-away message', helper: 'Send message when offline' },
  { label: 'Sound notifications', helper: 'Play sound for new messages' }
]

export default function ChatManagement() {
  return (
    <div className='space-y-6'>
      <header className='rounded-3xl border border-yellow-900/20 bg-white px-4 py-3 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-base font-bold text-stone-900'>{STORE_META.name}</p>
            <span className='mt-1 inline-flex items-center rounded-md bg-yellow-800 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white'>
              {STORE_META.status}
            </span>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-500'>
              <span className='text-stone-400'>⌕</span>
              <input
                type='search'
                placeholder='Search orders, products, SKU...'
                className='w-48 border-none bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none'
              />
            </div>
            <div className='flex items-center gap-2 rounded-full bg-yellow-800/10 px-3 py-1 text-xs font-semibold text-yellow-900'>
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-yellow-800 text-white'>{STORE_META.initials}</span>
              Online support
            </div>
          </div>
        </div>
      </header>

      <section className='space-y-4 rounded-3xl border border-yellow-800/20 bg-white p-5 shadow-sm'>
        <div>
          <h2 className='text-xl font-semibold text-stone-900'>Chat Management</h2>
          <p className='text-xs text-stone-500'>Quản lý chat với khách hàng và công cụ hỗ trợ tự động</p>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {CHAT_METRICS.map(metric => (
            <article key={metric.title} className='rounded-2xl border border-yellow-800/20 bg-stone-50 p-5'>
              <p className='text-xs text-stone-500'>{metric.title}</p>
              <p className={`mt-2 text-2xl font-bold ${metric.accent}`}>{metric.value}</p>
              <p className='mt-1 text-[11px] text-stone-500'>
                <span className='font-semibold text-green-600'>{metric.delta}</span> {metric.deltaLabel}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-5 rounded-3xl border border-yellow-800/20 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h3 className='text-base font-semibold text-stone-900'>Quick Replies Management</h3>
            <p className='text-xs text-stone-500'>Tạo và quản lý mẫu câu trả lời nhanh cho các câu hỏi thường gặp</p>
          </div>
          <button type='button' className='rounded-xl bg-yellow-800 px-4 py-2 text-xs font-semibold text-white'>
            Manage Quick Replies
          </button>
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          {QUICK_REPLIES.map(reply => (
            <article key={reply.title} className='rounded-2xl border border-yellow-800/20 p-4'>
              <div className='flex items-center justify-between text-[11px] text-stone-500'>
                <span className='rounded-md border border-yellow-800/20 px-2 py-0.5 text-stone-900'>{reply.category}</span>
                <span>Last used: {reply.lastUsed}</span>
              </div>
              <h4 className='mt-3 text-sm font-semibold text-stone-900'>{reply.title}</h4>
              <p className='mt-1 text-sm text-stone-600'>{reply.content}</p>
            </article>
          ))}
        </div>
        <button
          type='button'
          className='mx-auto block rounded-full border border-yellow-800/20 bg-stone-100 px-6 py-2 text-xs font-semibold text-stone-900'
        >
          View All Quick Replies (8)
        </button>
      </section>

      <section className='space-y-5 rounded-3xl border border-yellow-800/20 bg-white p-5 shadow-sm'>
        <div>
          <h3 className='text-base font-semibold text-stone-900'>Chat Performance Insights</h3>
          <p className='text-xs text-stone-500'>Phân tích hiệu suất chat trong 30 ngày qua</p>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {INSIGHTS.map(item => (
            <article key={item.label} className='rounded-2xl bg-lime-700/10 p-4 text-center'>
              <p className='text-[11px] text-stone-500'>{item.label}</p>
              <p className='mt-2 text-lg font-semibold text-stone-900'>{item.value}</p>
              <p className='mt-1 text-xs text-stone-600'>{item.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-5 rounded-3xl border border-yellow-800/20 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h3 className='text-base font-semibold text-stone-900'>Chat Widget Settings</h3>
            <p className='text-xs text-stone-500'>Tùy chỉnh giao diện và hành vi của chat widget</p>
          </div>
          <button type='button' className='rounded-xl border border-yellow-800/20 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-900'>
            Advanced Settings
          </button>
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          {WIDGET_SETTINGS.map(setting => (
            <div key={setting.label} className='flex items-center justify-between border-b border-yellow-800/20 pb-3'>
              <div>
                <p className='text-sm font-medium text-stone-900'>{setting.label}</p>
                <p className='text-xs text-stone-500'>{setting.helper}</p>
              </div>
              <span className='relative inline-flex h-6 w-11 items-center rounded-full bg-yellow-800'>
                <span className='ml-1 inline-block h-4 w-4 rounded-full bg-white shadow' />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
