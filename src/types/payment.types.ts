export interface CartItem {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  note?: string;
}

export type PaymentMethodType = 'momo' | 'payos' | 'vnpay';

export interface PaymentMethod {
  id: PaymentMethodType;
  label: string;
  description: string;
  icon: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

export interface PaymentFormData {
  shipping: ShippingInfo;
  paymentMethod: PaymentMethodType;
  discountCode?: string;
  acceptTerms: boolean;
}
