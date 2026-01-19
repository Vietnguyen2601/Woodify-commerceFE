import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { products } from '../data/mockProducts'

const sliderItems = [
  {
    id: 's1',
    pill: 'BST MÙA LỄ HỘI',
    title: 'Tôn vinh chất liệu gỗ tự nhiên',
    description: 'Góc nhìn mới cho không gian sống với các thiết kế độc bản từ nghệ nhân Việt.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 's2',
    pill: 'WOODIFY CURATED',
    title: 'Nội thất gỗ tinh giản, chuẩn Bắc Âu',
    description: 'Dòng sản phẩm Nordic Collection với tone màu trung tính dễ phối cùng mọi phong cách.',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 's3',
    pill: 'ECO CHOICE',
    title: 'Vòng đời bền vững cho từng tấm gỗ',
    description: 'Gỗ đạt chứng nhận FSC, quy trình truy xuất nguồn gốc rõ ràng và thân thiện môi trường.',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1400&q=80'
  }
]

const featuredCategories = [
  { id: 'living', name: 'Phòng khách tối giản' },
  { id: 'bedroom', name: 'Giường & tủ phòng ngủ' },
  { id: 'workspace', name: 'Góc làm việc sáng tạo' },
  { id: 'decor', name: 'Trang trí & phụ kiện' },
  { id: 'outdoor', name: 'Ngoại thất & sân vườn' },
  { id: 'custom', name: 'Đặt đóng theo yêu cầu' }
]

export default function Home() {
  const [activeSlide, setActiveSlide] = React.useState(0)
  const isAuthenticated = false
  const bestSellers = products

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % sliderItems.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='home'>
      <header className='home__header'>
        <NavBar isAuthenticated={isAuthenticated} />

        <section className='home__slider'>
          <article className='home__slide' style={{ backgroundImage: `url(${sliderItems[activeSlide].image})` }}>
            <div className='home__slide-gradient' />
            <div className='home__slide-content'>
              <span className='home__pill'>{sliderItems[activeSlide].pill}</span>
              <h1>{sliderItems[activeSlide].title}</h1>
              <p>{sliderItems[activeSlide].description}</p>
              <div className='home__slide-cta'>
                <Link to='/catalog' className='home__action-primary'>Khám phá ngay</Link>
                <Link to='/seller-stories' className='home__ghost-btn'>Xem studio nổi bật</Link>
              </div>
            </div>
          </article>
          <div className='home__slider-dots'>
            {sliderItems.map((item, index) => (
              <button
                key={item.id}
                className={index === activeSlide ? 'active' : ''}
                aria-label={`Xem slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </section>
      </header>

      <main className='home__content'>
        <section className='home__section'>
          <div className='home__section-header'>
            <h2>Danh mục nổi</h2>
            <Link to='/catalog'>Xem tất cả</Link>
          </div>
          <div className='home__categories'>
            {featuredCategories.map(category => (
              <Link key={category.id} to={`/catalog?category=${category.id}`} className='home__category-card'>
                <span>{category.name}</span>
                <strong>Khám phá</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className='home__section'>
          <div className='home__section-header'>
            <h2>Sản phẩm bán chạy</h2>
            <Link to='/catalog'>Xem thêm</Link>
          </div>
          <div className='home__product-grid'>
            {bestSellers.map(product => (
              <article key={product.id} className='home__product-card'>
                <div>
                  <p className='home__badge'>Bestseller</p>
                  <h3>{product.title}</h3>
                  <p className='home__product-desc'>{product.description}</p>
                </div>
                <div className='home__product-meta'>
                  <strong>{product.price.toLocaleString('vi-VN')} VND</strong>
                  <div className='home__product-actions'>
                    <Link to={`/product/${product.id}`} className='home__ghost-btn'>Xem chi tiết</Link>
                    <button type='button' className='home__action-primary'>Thêm vào giỏ</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className='home__section home__about'>
          <div>
            <h2>Woodify là ai?</h2>
            <p>
              Woodify là sàn thương mại điện tử chuyên về gỗ, kết nối nghệ nhân, xưởng mộc và khách hàng yêu chất
              liệu tự nhiên. Chúng tôi xây dựng hệ sinh thái minh bạch, đảm bảo nguồn gỗ chuẩn, quy trình sản xuất
              bền vững và dịch vụ hậu mãi tận tâm.
            </p>
            <p className='home__about-note'>Nội dung chi tiết sẽ được bổ sung ở giai đoạn tiếp theo.</p>
            <Link to='/about' className='home__action-primary'>Tìm hiểu thêm</Link>
          </div>
        </section>
      </main>

      <footer className='home__footer'>
        <div className='home__footer-columns'>
          <div>
            <h4>Woodify</h4>
            <p>Chạm vào chất liệu gỗ mộc mạc, nâng tầm trải nghiệm sống đậm chất Việt.</p>
          </div>
          <div>
            <h5>Hỗ trợ</h5>
            <Link to='/support'>Trung tâm trợ giúp</Link>
            <Link to='/policies'>Chính sách vận chuyển</Link>
            <Link to='/return'>Đổi trả & bảo hành</Link>
          </div>
          <div>
            <h5>Kết nối</h5>
            <a href='mailto:hello@woodify.vn'>hello@woodify.vn</a>
            <a href='tel:+84987654321'>+84 987 654 321</a>
            <Link to='/social'>Instagram · Pinterest</Link>
          </div>
        </div>
        <p className='home__footer-note'>© {new Date().getFullYear()} Woodify Marketplace. All rights reserved.</p>
      </footer>
    </div>
  )
}
