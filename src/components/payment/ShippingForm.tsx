import React from 'react';
import { UseFormRegister, FormState } from 'react-hook-form';
import { PaymentFormSchema } from '../../utils/validation.schema';

interface ShippingFormProps {
  register: UseFormRegister<PaymentFormSchema>;
  formState: FormState<PaymentFormSchema>;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ register, formState: { errors } }) => {
  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-lg font-bold text-[#333333] mb-6 font-inria-sans">
        Thông tin giao hàng
      </h2>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-1 font-arimo">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nhập họ và tên"
            {...register('shipping.fullName')}
            className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] focus:border-transparent transition font-arimo"
          />
          {errors.shipping?.fullName && (
            <p className="text-red-500 text-xs mt-1 font-arimo">
              {errors.shipping.fullName.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-1 font-arimo">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="Nhập số điện thoại"
            {...register('shipping.phoneNumber')}
            className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] focus:border-transparent transition font-arimo"
          />
          {errors.shipping?.phoneNumber && (
            <p className="text-red-500 text-xs mt-1 font-arimo">
              {errors.shipping.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-1 font-arimo">
            Email
          </label>
          <input
            type="email"
            placeholder="Nhập email (không bắt buộc)"
            {...register('shipping.email')}
            className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] focus:border-transparent transition font-arimo"
          />
          {errors.shipping?.email && (
            <p className="text-red-500 text-xs mt-1 font-arimo">
              {errors.shipping.email.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-1 font-arimo">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nhập địa chỉ giao hàng"
            {...register('shipping.address')}
            className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] focus:border-transparent transition font-arimo"
          />
          {errors.shipping?.address && (
            <p className="text-red-500 text-xs mt-1 font-arimo">
              {errors.shipping.address.message}
            </p>
          )}
        </div>

        {/* City/Province and District */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-1 font-arimo">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              {...register('shipping.city')}
              className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] focus:border-transparent transition font-arimo"
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              <option value="HN">Hà Nội</option>
              <option value="HCM">Hồ Chí Minh</option>
              <option value="DN">Đà Nẵng</option>
              <option value="CT">Cần Thơ</option>
              <option value="HP">Hải Phòng</option>
            </select>
            {errors.shipping?.city && (
              <p className="text-red-500 text-xs mt-1 font-arimo">
                {errors.shipping.city.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333333] mb-1 font-arimo">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <select
              {...register('shipping.district')}
              className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] focus:border-transparent transition font-arimo"
            >
              <option value="">-- Chọn quận/huyện --</option>
              <option value="1">Quận 1</option>
              <option value="2">Quận 2</option>
              <option value="3">Quận 3</option>
              <option value="4">Quận 4</option>
              <option value="5">Quận 5</option>
            </select>
            {errors.shipping?.district && (
              <p className="text-red-500 text-xs mt-1 font-arimo">
                {errors.shipping.district.message}
              </p>
            )}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-1 font-arimo">
            Ghi chú
          </label>
          <textarea
            placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
            rows={3}
            {...register('shipping.note')}
            className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] focus:border-transparent transition font-arimo resize-none"
          />
        </div>
      </div>
    </div>
  );
};
