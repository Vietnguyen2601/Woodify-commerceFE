import { ShopCart, DeliveryAddress, Voucher, CheckoutSummary, ShippingMethod } from './checkout-types'

// Shipping Methods Configuration
export const AVAILABLE_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ECONOMY',
    name: 'Tiết kiệm',
    description: 'Vận chuyển tiết kiệm',
    estimated_days: '3-5 ngày',
    fee: 15000
  },
  {
    id: 'STANDARD',
    name: 'Nhanh',
    description: 'Vận chuyển nhanh',
    estimated_days: '1-2 ngày',
    fee: 35000
  },
  {
    id: 'EXPRESS',
    name: 'Hỏa tốc',
    description: 'Vận chuyển hỏa tốc',
    estimated_days: '2-4 giờ',
    fee: 65000
  }
]

// Mock Delivery Address
export const MOCK_DELIVERY_ADDRESS: DeliveryAddress = {
  address_id: 'addr_001',
  recipient_name: 'Nguyễn Văn A',
  phone: '0912345678',
  address_line: '57/8 Xóm Thuỵ Phấn',
  ward: 'Phường Hoà Thuận Tây',
  district: 'Quận Hải Châu',
  city: 'Đà Nẵng',
  is_default: true
}

// Mock Shop Carts
export const MOCK_SHOP_CARTS: ShopCart[] = [
  {
    shop_id: 'shop_001',
    shop_name: 'WoodFurni Official Store',
    shop_avatar: undefined,
    items: [
      {
        cart_item_id: 'cart_001',
        product_id: 'prod_001',
        shop_id: 'shop_001',
        product_name: 'Bàn Ăn Gỗ Tần Bì 6 Chỗ',
        product_image: 'https://mrseed.s3.amazonaws.com/public2/images/6e13dc95-c4da-4f5d-8b0f-fb6d4df13ea4.jpg',
        variant_name: 'Màu Nâu, 1.6m',
        price: 8900000,
        quantity: 1,
        subtotal: 8900000
      },
      {
        cart_item_id: 'cart_002',
        product_id: 'prod_002',
        shop_id: 'shop_001',
        product_name: 'Ghế Ăn Gỗ Sồi',
        product_image: 'https://mrseed.s3.amazonaws.com/public2/images/8b2c5f3e-1a9e-4c7d-9e8f-2b3c4d5e6f7g.jpg',
        variant_name: 'Màu Sồi Trắng',
        price: 2450000,
        quantity: 4,
        subtotal: 9800000
      }
    ],
    selected_shipping_method: 'STANDARD',
    shipping_methods: AVAILABLE_SHIPPING_METHODS,
    shipping_fee: 35000,
    note_to_seller: '',
    subtotal: 18700000,
    total: 18735000
  },
  {
    shop_id: 'shop_002',
    shop_name: 'Modern Home Furniture',
    shop_avatar: undefined,
    items: [
      {
        cart_item_id: 'cart_003',
        product_id: 'prod_003',
        shop_id: 'shop_002',
        product_name: 'Sofa Gỗ 3 Chỗ',
        product_image: 'https://mrseed.s3.amazonaws.com/public2/images/9c3d6e4f-2b1c-4e7d-8f9e-3c4d5e6f7g8h.jpg',
        variant_name: 'Đệm Xám, 2.0m',
        price: 12500000,
        quantity: 1,
        subtotal: 12500000
      },
      {
        cart_item_id: 'cart_004',
        product_id: 'prod_004',
        shop_id: 'shop_002',
        product_name: 'Bàn Sofa Gỗ',
        product_image: 'https://mrseed.s3.amazonaws.com/public2/images/1d4e7f5g-3c2d-5e8f-9g0h-4d5e6f7g8h9i.jpg',
        variant_name: 'Màu Óc Chó, 1.2m',
        price: 4800000,
        quantity: 1,
        subtotal: 4800000
      }
    ],
    selected_shipping_method: 'ECONOMY',
    shipping_methods: AVAILABLE_SHIPPING_METHODS,
    shipping_fee: 15000,
    note_to_seller: '',
    subtotal: 17300000,
    total: 17315000
  }
]

// Mock Vouchers
export const MOCK_VOUCHERS: Voucher[] = [
  {
    voucher_id: 'vouch_001',
    code: 'WOODIFY50K',
    title: 'Giảm 50K cho đơn từ 500K',
    discount_type: 'FIXED',
    discount_value: 50000,
    min_order: 500000
  },
  {
    voucher_id: 'vouch_002',
    code: 'FREESHIP',
    title: 'Miễn phí vận chuyển',
    discount_type: 'FIXED',
    discount_value: 50000
  },
  {
    voucher_id: 'vouch_003',
    code: 'SALE10',
    title: 'Giảm 10% tối đa 100K',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    max_discount: 100000
  }
]

// Helper Functions
export const updateShopShippingMethod = (
  shopCarts: ShopCart[],
  shopId: string,
  methodId: 'ECONOMY' | 'STANDARD' | 'EXPRESS'
): ShopCart[] => {
  return shopCarts.map(shop => {
    if (shop.shop_id === shopId) {
      const selectedMethod = shop.shipping_methods.find(m => m.id === methodId)
      if (selectedMethod) {
        return {
          ...shop,
          selected_shipping_method: methodId,
          shipping_fee: selectedMethod.fee,
          total: shop.subtotal + selectedMethod.fee
        }
      }
    }
    return shop
  })
}

export const updateShopNote = (
  shopCarts: ShopCart[],
  shopId: string,
  note: string
): ShopCart[] => {
  return shopCarts.map(shop =>
    shop.shop_id === shopId ? { ...shop, note_to_seller: note } : shop
  )
}

export const calculateCheckoutSummary = (
  shopCarts: ShopCart[],
  appliedVoucher?: Voucher
): CheckoutSummary => {
  const merchandise_subtotal = shopCarts.reduce((sum, shop) => sum + shop.subtotal, 0)
  const total_shipping_fee = shopCarts.reduce((sum, shop) => sum + shop.shipping_fee, 0)

  let voucher_discount = 0

  if (appliedVoucher) {
    if (appliedVoucher.discount_type === 'FIXED') {
      // Check if min_order requirement is met
      if (!appliedVoucher.min_order || merchandise_subtotal >= appliedVoucher.min_order) {
        voucher_discount = appliedVoucher.discount_value
      }
    } else if (appliedVoucher.discount_type === 'PERCENTAGE') {
      const percentageDiscount = (merchandise_subtotal * appliedVoucher.discount_value) / 100
      voucher_discount = Math.min(
        percentageDiscount,
        appliedVoucher.max_discount || percentageDiscount
      )
    }
  }

  const total_payment = Math.max(
    0,
    merchandise_subtotal + total_shipping_fee - voucher_discount
  )

  return {
    merchandise_subtotal,
    total_shipping_fee,
    voucher_discount,
    total_payment
  }
}

export const findVoucherByCode = (code: string): Voucher | undefined => {
  return MOCK_VOUCHERS.find(v => v.code.toUpperCase() === code.toUpperCase())
}

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + '₫'
}
