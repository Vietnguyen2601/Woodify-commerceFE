import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export const PaymentFooter: React.FC = () => {
  return (
    <footer className="bg-[#333333] text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#BE9C73] rounded-full flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <h3 className="text-lg font-bold font-inria-sans">
                Nội Thất Cao Cấp
              </h3>
            </div>
            <p className="text-gray-400 text-sm font-arimo mb-4">
              Cung cấp nội thất cao cấp chất lượng tốt nhất cho ngôi nhà của bạn.
            </p>
            <div className="space-y-3 text-sm font-arimo">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#BE9C73] flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#BE9C73] flex-shrink-0" />
                <p className="text-gray-300">(+84) 123 456 789</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#BE9C73] flex-shrink-0" />
                <p className="text-gray-300">support@noithataocap.com</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-9 h-9 bg-[#BE9C73] rounded-full flex items-center justify-center hover:bg-[#CDA677] transition"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#BE9C73] rounded-full flex items-center justify-center hover:bg-[#CDA677] transition"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#BE9C73] rounded-full flex items-center justify-center hover:bg-[#CDA677] transition"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Column 2: About */}
          <div>
            <h4 className="text-lg font-bold mb-6 font-inria-sans">
              Về chúng tôi
            </h4>
            <ul className="space-y-3 text-sm font-arimo">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Giới thiệu
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Tầm nhìn & sứ mệnh
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Tin tức
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Policy */}
          <div>
            <h4 className="text-lg font-bold mb-6 font-inria-sans">
              Chính sách
            </h4>
            <ul className="space-y-3 text-sm font-arimo">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Chính sách vận chuyển
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Điều khoản dịch vụ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="text-lg font-bold mb-6 font-inria-sans">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3 text-sm font-arimo">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Hướng dẫn thanh toán
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#BE9C73] transition"
                >
                  Liên hệ hỗ trợ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm font-arimo">
          <p>
            © 2024 Nội Thất Cao Cấp. Tất cả quyền được bảo lưu. | Thiết kế bởi
            Woodify Team
          </p>
        </div>
      </div>
    </footer>
  );
};
