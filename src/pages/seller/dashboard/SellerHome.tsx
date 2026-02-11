import React from 'react'
import DashboardCard from '../components/DashboardCard'

const WORK_QUEUE = [
  { id: 'pending', label: 'Chờ lấy hàng', count: 6, deadline: '< 45 phút', severity: 'high', note: 'Ưu tiên xác nhận để tránh SLA' },
  { id: 'processing', label: 'Đã xử lý', count: 18, deadline: 'Hôm nay', severity: 'medium', note: 'Chuẩn bị bàn giao cho đơn vị vận chuyển' },
  { id: 'returns', label: 'Trả / Hoàn / Hủy', count: 3, deadline: 'Trong 24h', severity: 'high', note: 'Cần phản hồi bằng chứng' },
  { id: 'locked', label: 'Sản phẩm bị tạm khóa', count: 2, deadline: 'Kiểm tra ngay', severity: 'low', note: 'Do thiếu chứng từ hoặc ảnh' }
]

const KPI_CARDS = [
  { title: 'Doanh thu hôm nay', value: '₫185.4M', trend: '+12% so với hôm qua', status: 'positive' as const },
  { title: 'Lượt truy cập', value: '42.1K', trend: '+8% so với tuần trước', status: 'positive' as const },
  { title: 'Tỉ lệ chuyển đổi', value: '3.4%', trend: '-0.4% tuần trước', status: 'negative' as const },
  { title: 'Đơn chờ xử lý', value: '24', trend: '6 quá SLA', status: 'negative' as const }
]

const REVENUE_SERIES = [
  { day: 'Jan 20', value: 12 },
  { day: 'Jan 21', value: 28 },
  { day: 'Jan 22', value: 22 },
  { day: 'Jan 23', value: 38 },
  { day: 'Jan 24', value: 45 },
  { day: 'Jan 25', value: 30 },
  { day: 'Jan 26', value: 50 },
  { day: 'Jan 27', value: 58 }
]

const TOP_PRODUCTS = [
  { name: 'Oak Dining Table', value: 60 },
  { name: 'Walnut Bookshelf', value: 48 },
  { name: 'Pine Coffee Table', value: 36 },
  { name: 'Teak Chair Set', value: 32 },
  { name: 'Mahogany Desk', value: 26 }
]

const PERFORMANCE = [
  { label: 'Hiệu quả bán hàng', value: 'Xuất sắc', detail: 'Điểm phạt 0 • Tỉ lệ giao hàng đúng hạn 97%' },
  { label: 'Trải nghiệm khách', value: 'Tốt', detail: '4.9 / 5.0 • 132 đánh giá mới' },
  { label: 'Hỗ trợ xử lý', value: 'Cần cải thiện', detail: 'Đáp ứng chat chậm hơn 30p so với chuẩn' }
]

const ANALYTICS = [
  { label: 'Doanh số', value: '₫3.2B', delta: '+18%', context: '30 ngày gần nhất' },
  { label: 'Lượt truy cập', value: '312K', delta: '+11%', context: 'Từ tìm kiếm và Shopee Live' },
  { label: 'Product clicks', value: '98K', delta: '+6%', context: 'Tăng nhờ Flash Sale' },
  { label: 'Đơn hàng', value: '11.5K', delta: '+4%', context: 'Giá trị trung bình ₫280K' },
  { label: 'Conversion rate', value: '3.4%', delta: '-0.2%', context: 'Cần tối ưu trang trí shop' }
]

const SERVICES = [
  { title: 'Dịch vụ hiển thị Shopee', desc: 'Đẩy sản phẩm lên vị trí nổi bật và remarketing tự động', cta: 'Bật quảng cáo ngay' },
  { title: 'Gói Freeship Xtra', desc: 'Tăng tỷ lệ mua bằng hỗ trợ phí vận chuyển', cta: 'Đăng ký' }
]

const NEWS = [
  { title: 'Shopee Mega Sale 1.1', desc: 'Đăng ký deal tối thiểu ₫99K để nhận traffic từ banner', pill: 'Sự kiện' },
  { title: 'Thay đổi chính sách vận chuyển', desc: 'Tối ưu cut-off time để giữ tỷ lệ đúng hẹn', pill: 'Thông báo' }
]

const MISSIONS = [
  { title: 'Hoàn thành 3 nhiệm vụ quảng cáo', reward: '+₫500K voucher Ads', progress: '2/3', status: 'in-progress' },
  { title: 'Đồng bộ ảnh chuẩn Shopee', reward: '+1,000 điểm uy tín', progress: '0/20', status: 'todo' }
]

export default function SellerHome() {
  return (
    <div className='seller-home'>
      <section className='seller-home__workbench'>
        <div className='seller-home__section-header'>
          <div>
            <p className='seller-home__eyebrow'>Danh sách cần làm</p>
            <h2>Xử lý các đầu việc ưu tiên trong ngày</h2>
          </div>
          <button type='button'>Xem tất cả</button>
        </div>
        <div className='seller-home__work-grid'>
          {WORK_QUEUE.map(item => (
            <article key={item.id} className={`seller-home__work-card seller-home__work-card--${item.severity}`}>
              <header>
                <p>{item.label}</p>
                <strong>{item.count}</strong>
              </header>
              <footer>
                <span>{item.deadline}</span>
                <small>{item.note}</small>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className='seller-home__kpi'>
        {KPI_CARDS.map(card => (
          <DashboardCard key={card.title} title={card.title} value={card.value} trend={card.trend} status={card.status} highlight={card.status === 'positive'} />
        ))}
      </section>

      <section className='seller-home__charts'>
        <article className='seller-home__chart-card seller-home__chart-card--compact'>
          <div>
            <p className='seller-home__eyebrow'>Revenue Over Time</p>
            <h3>Xu hướng doanh thu 8 ngày gần nhất</h3>
            <span className='seller-home__chart-subtitle'>Last 8 days revenue trend</span>
          </div>
          <div className='chart-sparkline' aria-hidden='true'>
            <div className='chart-sparkline__y-axis'>
              {[0, 15, 30, 45, 60].map(label => (
                <span key={label}>{label}M</span>
              ))}
            </div>
            <div className='chart-sparkline__plot'>
              <svg viewBox='0 0 100 60' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='revenueLine' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset='0%' stopColor='#c08457' stopOpacity='0.45' />
                    <stop offset='100%' stopColor='#c08457' stopOpacity='0' />
                  </linearGradient>
                </defs>
                <polyline
                  points={REVENUE_SERIES.map((point, index) => {
                    const x = (index / (REVENUE_SERIES.length - 1)) * 100
                    const y = 60 - (point.value / 60) * 60
                    return `${x},${y}`
                  }).join(' ')}
                  fill='url(#revenueLine)'
                  stroke='#b87436'
                  strokeWidth='1.2'
                  strokeLinejoin='round'
                  strokeLinecap='round'
                />
                {REVENUE_SERIES.map((point, index) => {
                  const x = (index / (REVENUE_SERIES.length - 1)) * 100
                  const y = 60 - (point.value / 60) * 60
                  return <circle key={point.day} cx={x} cy={y} r={1.1} fill='#744420' />
                })}
              </svg>
            </div>
          </div>
          <div className='chart-sparkline__x-axis'>
            {REVENUE_SERIES.map(point => (
              <span key={point.day}>{point.day}</span>
            ))}
          </div>
        </article>

        <article className='seller-home__chart-card'>
          <div>
            <p className='seller-home__eyebrow'>Top Selling Products</p>
            <h3>Sản phẩm perform tốt nhất</h3>
            <span className='seller-home__chart-subtitle'>Best performers this month</span>
          </div>
          <div className='chart-bars'>
            {TOP_PRODUCTS.map(item => (
              <div key={item.name} className='chart-bars__row'>
                <div>
                  <strong>{item.name}</strong>
                </div>
                <div className='chart-bars__meter'>
                  <span style={{ width: `${item.value / 60 * 100}%` }} />
                </div>
                <span className='chart-bars__value'>{item.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className='seller-home__performance'>
        <div className='seller-home__section-header'>
          <div>
            <p className='seller-home__eyebrow'>Hiệu quả bán hàng</p>
            <h2>Trạng thái tổng quan</h2>
          </div>
          <button type='button'>Xem chi tiết báo cáo</button>
        </div>
        <div className='seller-home__performance-grid'>
          {PERFORMANCE.map(item => (
            <div key={item.label} className='seller-home__performance-card'>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </div>
          ))}
        </div>
      </section>

      <section className='seller-home__analytics'>
        <div className='seller-home__analysis-header'>
          <div>
            <p className='seller-home__eyebrow'>Phân tích bán hàng</p>
            <h2>Tăng trưởng 30 ngày gần nhất</h2>
          </div>
          <select aria-label='Khoảng thời gian'>
            <option>30 ngày gần nhất</option>
            <option>14 ngày</option>
            <option>7 ngày</option>
          </select>
        </div>
        <div className='seller-home__analysis-grid'>
          {ANALYTICS.map(item => (
            <div key={item.label} className='seller-home__analysis-card'>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.delta}</span>
              <small>{item.context}</small>
            </div>
          ))}
        </div>
      </section>

      <section className='seller-home__services'>
        {SERVICES.map(service => (
          <div key={service.title} className='seller-home__service-card'>
            <div>
              <p className='seller-home__eyebrow'>{service.title}</p>
              <h3>{service.desc}</h3>
            </div>
            <button type='button'>{service.cta}</button>
          </div>
        ))}
      </section>

      <section className='seller-home__news'>
        <div>
          <p className='seller-home__eyebrow'>Tin nổi bật</p>
          {NEWS.map(item => (
            <article key={item.title}>
              <span>{item.pill}</span>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
        <div>
          <p className='seller-home__eyebrow'>Nhiệm vụ người bán</p>
          {MISSIONS.map(item => (
            <article key={item.title} className='seller-home__mission'>
              <div>
                <h4>{item.title}</h4>
                <p>Phần thưởng: {item.reward}</p>
              </div>
              <div>
                <strong>{item.progress}</strong>
                <span>{item.status === 'in-progress' ? 'Đang triển khai' : 'Chưa bắt đầu'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
