# Wood Marketplace - Frontend Base (React + Vite, CSS thuần)

Mô tả:
Base frontend cho sàn thương mại điện tử chuyên về đồ gỗ. Dự án dùng Vite + React, CSS thuần, React Router, Axios, và Zustand cho state management nhỏ.

Các trang cơ bản:
- Home
- Catalog (danh sách sản phẩm)
- Product detail
- Cart
- Checkout
- Auth (Login / Register)
- Profile
- Seller Dashboard

Cách khởi tạo:
1. Chạy: bash setup.sh
2. Vào thư mục: cd wood-marketplace
3. Chạy dev: npm install && npm run dev

Ghi chú:
- Thay mock data trong src/data bằng API thật (sửa src/services/api.ts).
- Thêm auth token, form validation, upload ảnh cho seller.
- CSS dùng file .css thuần ở src/styles và từng component (không dùng Tailwind).
