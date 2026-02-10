import React from 'react'
import woodifyLogo from '../../../assets/logo/Woodify.jpg'
import './Footer.css'

const productCategories = [
  'Phòng khách',
  'Nội thất phòng ngủ',
  'Văn phòng',
  'Nội thất bếp',
  'Sản phẩm trang trí',
]

const customerSupport = [
  'Hướng dẫn mua hàng',
  'Hướng dẫn thanh toán',
  'Câu hỏi thường gặp',
  'Liên hệ hỗ trợ',
]

const policyLinks = [
  'Chính sách vận chuyển',
  'Chính sách bảo mật',
  'Chính sách đổi trả',
  'Điều khoản dịch vụ',
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo-mark" aria-hidden="true">
            <img src={woodifyLogo} alt="Woodify logo" loading="lazy" />
          </div>
          <span className="footer__brand-name">WOODIFY</span>
        </div>

        <div className="footer__grid">
          <div className="footer__column">
            <h4>Thông tin liên hệ</h4>
            <p>Số điện thoại: 0903038567</p>
            <p>Email: woodifylecomerce@gmail.com</p>
            <p>
              Địa chỉ: G30 Lê Thị Riêng, Phường Thới An<br />
              Quận 12, Thành phố Hồ Chí Minh
            </p>
          </div>

          <div className="footer__column">
            <h4>Danh mục sản phẩm</h4>
            <ul>
              {productCategories.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="footer__column">
            <h4>Hỗ trợ khách hàng</h4>
            <ul>
              {customerSupport.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="footer__column">
            <h4>Chính sách</h4>
            <ul>
              {policyLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
