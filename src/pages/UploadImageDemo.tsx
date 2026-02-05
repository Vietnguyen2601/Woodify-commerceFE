import React from 'react'
import UploadImageForm from '../components/UploadImageForm'

export default function UploadImageDemo() {
  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 py-10'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Cloudinary Unsigned Upload</h1>
        <p className='mt-3 text-base text-gray-600'>
          Ví dụ FE-only sử dụng cloud name và upload preset để upload ảnh trực tiếp lên Cloudinary. Sau khi
          upload thành công chúng ta chỉ lưu lại secure_url để gửi tiếp cho form nghiệp vụ (ví dụ tạo sản phẩm).
        </p>
      </div>

      <UploadImageForm />

      <section className='rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700'>
        <h2 className='text-lg font-semibold text-gray-900'>Ghi chú kỹ thuật</h2>
        <ul className='mt-3 list-disc space-y-1 pl-5'>
          <li>Tải ảnh dùng unsigned preset fe_unsigned_upload và folder fe-uploads</li>
          <li>Frontend chỉ gửi multipart/form-data gồm file + upload_preset, không có API key/secret</li>
          <li>Chỉ nhận file jpg/png/webp &lt;= 5MB, hiển thị rõ lỗi cho người dùng</li>
          <li>Form nghiệp vụ giả lập chỉ nhận secure_url, không gửi file gốc</li>
        </ul>
      </section>
    </div>
  )
}
