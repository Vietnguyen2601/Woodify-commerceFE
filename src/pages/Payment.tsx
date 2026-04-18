import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentHeader } from '../components/payment/PaymentHeader';
import { PaymentFooter } from '../components/payment/PaymentFooter';
import { CartItemComponent } from '../components/payment/CartItem';
import { ShippingForm } from '../components/payment/ShippingForm';
import { PaymentMethods } from '../components/payment/PaymentMethods';
import { OrderSummary } from '../components/payment/OrderSummary';
import { CartItem, OrderSummary as OrderSummaryType } from '../types/payment.types';
import { paymentFormSchema, PaymentFormSchema } from '../utils/validation.schema';
import { PLACEHOLDER_IMAGE_URL } from '@/constants';

const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Ghế gỗ tự nhiên cao cấp',
    image: PLACEHOLDER_IMAGE_URL,
    currentPrice: 5900000,
    originalPrice: 7500000,
    quantity: 1,
  },
  {
    id: '2',
    name: 'Bàn gỗ hình chữ nhật',
    image: PLACEHOLDER_IMAGE_URL,
    currentPrice: 8900000,
    originalPrice: 11500000,
    quantity: 1,
  },
  {
    id: '3',
    name: 'Tủ gỗ lưu trữ',
    image: PLACEHOLDER_IMAGE_URL,
    currentPrice: 3500000,
    originalPrice: 4200000,
    quantity: 1,
  },
];

export const Payment: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryType>({
    subtotal: 18300000,
    shippingFee: 150000,
    discount: 500000,
    total: 17950000,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState,
    watch,
  } = useForm<PaymentFormSchema>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      shipping: {
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        city: '',
        district: '',
        note: '',
      },
      paymentMethod: 'cod',
      acceptTerms: false,
    },
  });

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleApplyDiscount = (code: string) => {
    // Implement discount logic here
  };

  const handlePlaceOrder = () => {
    if (!formState.isValid) {
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const formData = watch();
      setIsLoading(false);
      // Show success message or redirect
      alert('Đơn hàng của bạn đã được tạo thành công!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#CDA677] flex flex-col">
      {/* Header */}
      <PaymentHeader />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-12 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Section - Cart & Forms (60%) */}
            <div className="w-full lg:w-3/5 space-y-6">
              {/* Cart Items Section */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-bold text-[#333333] mb-4 font-inria-sans">
                  Giỏ hàng ({cartItems.length} sản phẩm)
                </h2>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              </div>

              {/* Shipping Form */}
              <ShippingForm register={register} formState={formState} />

              {/* Payment Methods */}
              <PaymentMethods register={register} formState={formState} />
            </div>

            {/* Right Section - Order Summary (40%) */}
            <div className="md:col-span-2 sticky top-0 h-fit">
              <OrderSummary
                summary={orderSummary}
                onApplyDiscount={handleApplyDiscount}
                onPlaceOrder={handleSubmit(handlePlaceOrder)}
                register={register}
                formState={formState}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PaymentFooter />
    </div>
  );
};
