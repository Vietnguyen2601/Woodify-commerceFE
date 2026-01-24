import { z } from 'zod';

export const shippingInfoSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập tên đầy đủ').min(2, 'Tên phải có ít nhất 2 ký tự'),
  phoneNumber: z.string().min(1, 'Vui lòng nhập số điện thoại').regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ').min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  note: z.string().optional(),
});

export const paymentFormSchema = z.object({
  shipping: shippingInfoSchema,
  paymentMethod: z.enum(['cod', 'bank-transfer', 'card']),
  discountCode: z.string().optional(),
  acceptTerms: z.boolean().refine((val: boolean) => val === true, 'Vui lòng đồng ý với điều khoản dịch vụ'),
});

export type PaymentFormSchema = z.infer<typeof paymentFormSchema>;
