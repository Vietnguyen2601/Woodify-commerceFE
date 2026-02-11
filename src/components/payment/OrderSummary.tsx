import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { UseFormRegister, FormState } from 'react-hook-form';
import { OrderSummary as OrderSummaryType } from '../../types/payment.types';
import { PaymentFormSchema } from '../../utils/validation.schema';

interface OrderSummaryProps {
  summary: OrderSummaryType;
  onApplyDiscount: (code: string) => void;
  onPlaceOrder: () => void;
  register: UseFormRegister<PaymentFormSchema>;
  formState: FormState<PaymentFormSchema>;
  isLoading?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  summary,
  onApplyDiscount,
  onPlaceOrder,
  register,
  formState: { errors },
  isLoading = false,
}) => {
  const [discountCode, setDiscountCode] = React.useState('');

  const handleApplyDiscount = () => {
    if (discountCode.trim()) {
      onApplyDiscount(discountCode);
      setDiscountCode('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20 h-fit">
      {/* Header */}
      <h2 className="text-lg font-bold text-[#333333] mb-6 font-inria-sans">
        Tổng đơn hàng
      </h2>

      {/* Order Items */}
      <div className="space-y-3 mb-6 pb-6 border-b border-[#E5E7EB]">
        <div className="flex justify-between text-sm font-arimo">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="text-[#333333] font-semibold">
            {summary.subtotal.toLocaleString('vi-VN')} ₫
          </span>
        </div>
        <div className="flex justify-between text-sm font-arimo">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span className="text-[#333333] font-semibold">
            {summary.shippingFee.toLocaleString('vi-VN')} ₫
          </span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm font-arimo">
            <span className="text-gray-600">Giảm giá:</span>
            <span className="text-red-500 font-semibold">
              -{summary.discount.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 font-arimo mb-2">Tổng cộng</p>
        <p className="text-4xl font-bold text-[#BE9C73] font-inria-sans">
          {summary.total.toLocaleString('vi-VN')} ₫
        </p>
      </div>

      {/* Discount Code */}
      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium text-[#333333] font-arimo">
          Mã giảm giá
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã giảm giá"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="flex-1 px-4 py-2 border border-[#D1D5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE9C73] font-arimo text-sm"
          />
          <button
            onClick={handleApplyDiscount}
            disabled={isLoading}
            className="px-4 py-2 bg-[#BE9C73] text-white rounded-lg hover:bg-[#a68662] disabled:opacity-50 disabled:cursor-not-allowed transition font-arimo font-semibold text-sm"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={onPlaceOrder}
        disabled={isLoading}
        className="w-full bg-[#BE9C73] text-white py-3 rounded-lg hover:bg-[#a68662] disabled:opacity-50 disabled:cursor-not-allowed transition font-arimo font-bold flex items-center justify-center gap-2 mb-4"
      >
        Đặt hàng
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Terms */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('acceptTerms')}
            className="mt-0.5 w-4 h-4 text-[#BE9C73] focus:ring-[#BE9C73]"
          />
          <span className="text-xs text-gray-600 font-arimo leading-relaxed">
            Tôi đồng ý với{' '}
            <a href="#" className="text-[#BE9C73] hover:underline">
              điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#" className="text-[#BE9C73] hover:underline">
              chính sách bảo mật
            </a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-red-500 text-xs mt-2 font-arimo">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>

      {/* Benefits */}
      <div className="space-y-2 pt-6 border-t border-[#E5E7EB]">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-[#BE9C73] flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-600 font-arimo">
            Đổi trả miễn phí trong 30 ngày
          </span>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-[#BE9C73] flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-600 font-arimo">
            Giao hàng toàn quốc
          </span>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-[#BE9C73] flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-600 font-arimo">
            Thanh toán an toàn 100%
          </span>
        </div>
      </div>
    </div>
  );
};
