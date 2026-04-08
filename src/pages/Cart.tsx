import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/cartStore'
import { currency } from '../utils/format'

type CartMeta = {
  shopId: string
  shopName: string
  shopVoucher: string
  shippingNote: string
  shippingEta: string
  variant: string
  image: string
}

type Suggestion = {
  id: string
  title: string
  image: string
  badge: string
  price: string
}

type CartLineItem = CartMeta & {
  id: string
  title: string
  price: number
  qty: number
}

type ShopGroup = {
  shopId: string
  shopName: string
  shopVoucher: string
  shippingNote: string
  items: CartLineItem[]
}

const defaultMeta: CartMeta = {
  shopId: 'default-shop',
  shopName: 'Nhà Cửa 4.0',
  shopVoucher: 'Giảm 10% cho đơn từ 300K',
  shippingNote: 'Đồng giá vận chuyển 15K toàn quốc',
  shippingEta: 'Giao trước 14 Th01',
  variant: 'Phân loại: Tiêu chuẩn',
  image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80'
}

const productMeta: Record<string, CartMeta> = {
  p1: {
    shopId: 'shop-urban',
    shopName: 'Urban Craft Official',
    shopVoucher: 'Mã giảm 40K cho đơn từ 499K',
    shippingNote: 'Freeship Xtra+ cho đơn 0Đ',
    shippingEta: 'Dự kiến giao 10 - 12 Th01',
    variant: 'Kích thước: 180cm | Màu: Trầm',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80'
  },
  p2: {
    shopId: 'shop-sora',
    shopName: 'Sora Living',
    shopVoucher: 'Voucher 25K mọi đơn',
    shippingNote: 'Giảm 20K phí ship nội thành',
    shippingEta: 'Dự kiến giao 08 - 10 Th01',
    variant: 'Mặt kính khói | Size M',
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=80'
  },
  p3: {
    shopId: 'shop-hikari',
    shopName: 'Hikari Home Decor',
    shopVoucher: 'Tặng 50K cho đơn từ 799K',
    shippingNote: 'Ưu đãi phí ship 0Đ toàn quốc',
    shippingEta: 'Dự kiến giao 12 - 15 Th01',
    variant: 'Size Queen | Gỗ Óc Chó',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=500&q=80'
  }
}

const suggestionProducts: Suggestion[] = [
  {
    id: 's1',
    title: 'Combo Decor Góc Chill',
    image: 'https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=400&q=80',
    badge: '-35%',
    price: '299.000đ'
  },
  {
    id: 's2',
    title: 'Đèn Bàn Gốm Kyoto',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
    badge: 'FREESHIP',
    price: '489.000đ'
  },
  {
    id: 's3',
    title: 'Ghế Thư Giãn Mây',
    image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=400&q=80',
    badge: '-20%',
    price: '1.250.000đ'
  },
  {
    id: 's4',
    title: 'Set Gương Tre Nordic',
    image: 'https://images.unsplash.com/photo-1469395446868-fb6a048d5ca3?auto=format&fit=crop&w=400&q=80',
    badge: 'MỚI',
    price: '349.000đ'
  },
  {
    id: 's5',
    title: 'Tủ Đầu Giường Lisse',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
    badge: '-15%',
    price: '1.050.000đ'
  },
  {
    id: 's6',
    title: 'Thảm Cotton Terra',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
    badge: 'HOT',
    price: '590.000đ'
  }
]

export default function Cart() {
  const items = useCart(s => s.items)
  const remove = useCart(s => s.remove)
  const setQty = useCart(s => s.setQty)
  const [selected, setSelected] = React.useState<string[]>([])
  const selectionInitialized = React.useRef(false)

  const enrichedItems = React.useMemo<CartLineItem[]>(() => items.map(item => ({
    ...item,
    ...(productMeta[item.id] ?? defaultMeta)
  })), [items])

  React.useEffect(() => {
    setSelected(prev => {
      const ids = new Set(items.map(i => i.id))
      const stillValid = prev.filter(id => ids.has(id))
      if (!selectionInitialized.current && items.length > 0) {
        selectionInitialized.current = true
        return items.map(i => i.id)
      }
      return stillValid
    })
    if (items.length === 0) {
      selectionInitialized.current = false
    }
  }, [items])

  const groupedShops = React.useMemo<ShopGroup[]>(() => {
    const map = new Map<string, ShopGroup>()
    enrichedItems.forEach(item => {
      const key = item.shopId
      if (!map.has(key)) {
        map.set(key, {
          shopId: item.shopId,
          shopName: item.shopName,
          shopVoucher: item.shopVoucher,
          shippingNote: item.shippingNote,
          items: []
        })
      }
      map.get(key)?.items.push(item)
    })
    return Array.from(map.values())
  }, [enrichedItems])

  const allSelected = items.length > 0 && selected.length === items.length

  const toggleAll = () => {
    if (allSelected) {
      setSelected([])
    } else {
      setSelected(items.map(i => i.id))
    }
  }

  const toggleShop = (shopItems: CartLineItem[]) => {
    const ids = shopItems.map(i => i.id)
    const isFullySelected = ids.every(id => selected.includes(id))
    if (isFullySelected) {
      setSelected(prev => prev.filter(id => !ids.includes(id)))
    } else {
      setSelected(prev => Array.from(new Set([...prev, ...ids])))
    }
  }

  const toggleItem = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleDeleteSelected = () => {
    selected.forEach(remove)
    setSelected([])
  }

  const handleQuantityChange = (id: string, qty: number) => {
    setQty(id, Math.max(1, qty))
  }

  const selectedTotal = enrichedItems
    .filter(item => selected.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className='bg-stone-100 min-h-screen'>
      {/* Table Header - Full Width */}
      <div className='sticky top-0 z-30 w-full bg-white border-b border-gray-200'>
        <div className='w-full max-w-[1352px] mx-auto px-56 py-3'>
          <div className='flex items-center gap-3'>
            {/* Checkbox + Sản Phẩm */}
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <input
                type='checkbox'
                checked={allSelected}
                onChange={toggleAll}
                className='w-4 h-4 rounded cursor-pointer flex-shrink-0'
              />
              <span className='text-gray-600 text-sm font-medium flex-shrink-0'>Sản Phẩm</span>
            </div>

            {/* Đơn Giá */}
            <div className='w-20 text-center flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Đơn Giá</span>
            </div>

            {/* Số Lượng */}
            <div className='w-24 text-center flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Số Lượng</span>
            </div>

            {/* Số Tiền */}
            <div className='w-20 text-center flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Số Tiền</span>
            </div>

            {/* Thao Tác */}
            <div className='w-40 flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Thao Tác</span>
            </div>
          </div>
        </div>
      </div>

      <main className='w-full max-w-[1352px] mx-auto px-56 pt-16'>
        <div className='flex flex-col gap-3 pb-3'>

          {/* Empty Cart */}
          {items.length === 0 && (
            <div className='w-full p-12 bg-white rounded-md border border-gray-200 text-center'>
              <p className='text-gray-600 mb-4'>Giỏ hàng trống. Khám phá thêm deal hot ngay!</p>
              <Link to='/catalog' className='inline-block px-6 py-2 bg-yellow-800 text-white rounded hover:bg-yellow-900'>
                Tiếp tục mua sắm
              </Link>
            </div>
          )}

          {/* Shop Groups */}
          {groupedShops.map(shop => {
            const shopSelectedCount = shop.items.filter(item => selected.includes(item.id)).length
            const isShopFullySelected = shop.items.every(item => selected.includes(item.id))

            return (
              <div key={shop.shopId} className='w-full bg-white rounded-md border border-gray-200 overflow-hidden'>
                {/* Shop Header */}
                <div className='px-3 py-2.5 bg-orange-50 border-b border-gray-200 flex items-center gap-3'>
                  <input
                    type='checkbox'
                    checked={isShopFullySelected}
                    onChange={() => toggleShop(shop.items)}
                    className='w-4 h-4 rounded cursor-pointer flex-shrink-0'
                  />
                  <span className='text-orange-600 text-sm font-medium'>Yêu thích</span>
                  <span className='text-gray-900 text-sm font-semibold flex-1'>{shop.shopName}</span>
                  <span className='px-2 py-1 rounded border border-orange-400 text-orange-600 text-xs font-medium flex-shrink-0'>
                    {shopSelectedCount} đã chọn
                  </span>
                </div>

                {/* Product Items */}
                <div className='divide-y divide-gray-100'>
                  {shop.items.map(item => (
                    <div key={item.id} className='px-3 py-3 flex items-start gap-3'>
                      {/* Checkbox + Product Info */}
                      <div className='flex items-start gap-3 flex-1 min-w-0'>
                        <input
                          type='checkbox'
                          checked={selected.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className='w-4 h-4 rounded cursor-pointer flex-shrink-0 mt-1'
                        />
                        <img
                          src={item.image}
                          alt={item.title}
                          className='w-16 h-16 rounded border border-gray-200 flex-shrink-0'
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='text-gray-900 text-sm font-medium leading-5 line-clamp-2'>{item.title}</div>
                          <div className='text-gray-500 text-xs font-normal leading-4 mt-1'>{item.variant}</div>
                          <div className='text-gray-400 text-xs font-normal leading-4'>Phân loại hàng: Fuji Night (80x30)</div>
                        </div>
                      </div>

                      {/* Đơn Giá */}
                      <div className='w-20 text-center flex-shrink-0 pt-1'>
                        <div className='text-gray-900 text-sm font-medium'>{currency(item.price)}</div>
                      </div>

                      {/* Số Lượng */}
                      <div className='w-24 flex justify-center flex-shrink-0'>
                        <div className='w-24 h-7 rounded border border-gray-300 flex items-center gap-1'>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.qty - 1)}
                            disabled={item.qty === 1}
                            className='w-7 h-7 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-100 text-lg'
                          >
                            −
                          </button>
                          <div className='flex-1 h-7 flex items-center justify-center text-gray-900 text-sm font-medium'>
                            {item.qty}
                          </div>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.qty + 1)}
                            className='w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg'
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Số Tiền */}
                      <div className='w-20 text-center flex-shrink-0 pt-1'>
                        <div className='text-orange-600 text-sm font-semibold'>{currency(item.price * item.qty)}</div>
                      </div>

                      {/* Thao Tác */}
                      <div className='w-40 flex-shrink-0 pt-1'>
                        <div className='flex items-center gap-3 flex-wrap'>
                          <button
                            onClick={() => remove(item.id)}
                            className='text-orange-600 text-xs font-medium hover:text-orange-700 whitespace-nowrap'
                          >
                            Xóa
                          </button>
                          <div className='w-px h-4 bg-gray-300'></div>
                          <button className='text-orange-600 text-xs font-medium hover:text-orange-700 whitespace-nowrap'>
                            Tìm sản phẩm tương tự
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop Footer - Voucher & Shipping */}
                <div className='px-3 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-6'>
                  <button className='flex items-center gap-1.5 text-orange-600 text-sm font-medium hover:text-orange-700'>
                    <span>🎁</span>
                    <span>Thêm Shop Voucher</span>
                  </button>
                  <button className='text-blue-600 text-sm font-medium hover:text-blue-700'>
                    Gửi yêu cầu hoàn tiền
                  </button>
                  <div className='flex items-center gap-1.5 text-gray-600 text-sm flex-1'>
                    <span>🎉</span>
                    <span>Giảm 500.000đ phí vận chuyển đơn tối thiểu 0đ</span>
                    <button className='text-blue-600 font-medium hover:text-blue-700'>Tìm hiểu thêm</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Sticky Footer */}
      <div className='sticky bottom-0 z-40 w-full bg-white border-t-2 border-gray-200 shadow-md'>
        <div className='w-full max-w-[1352px] mx-auto px-56 py-2.5 flex items-center justify-between gap-4'>
          {/* Left Section */}
          <div className='flex items-center gap-2 flex-shrink-0'>
            <label className='flex items-center gap-2 cursor-pointer whitespace-nowrap'>
              <input
                type='checkbox'
                checked={allSelected}
                onChange={toggleAll}
                className='w-4 h-4 rounded cursor-pointer'
              />
              <span className='text-gray-900 text-xs font-medium'>Chọn Tất Cả ({items.length})</span>
            </label>
            <button
              onClick={handleDeleteSelected}
              className='text-gray-900 text-xs font-medium hover:text-red-600 whitespace-nowrap'
            >
              Xóa
            </button>
            <div className='w-px h-3 bg-gray-300'></div>
            <button className='text-gray-900 text-xs font-medium hover:text-blue-600 whitespace-nowrap'>
              Bỏ sản phẩm không hoạt động
            </button>
            <div className='w-px h-3 bg-gray-300'></div>
            <button className='text-gray-900 text-xs font-medium hover:text-blue-600 whitespace-nowrap'>
              Lưu vào mục Đã thích
            </button>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-4 flex-shrink-0'>
            {/* Total Section */}
            <div className='flex flex-col gap-0.5 text-right whitespace-nowrap'>
              <div className='text-gray-600 text-xs font-normal'>
                Tổng cộng ({selected.length} sản phẩm):
              </div>
              <div className='text-orange-600 text-xl font-bold'>
                {currency(selectedTotal)}
              </div>
            </div>

            {/* Buy Button */}
            <button className='px-8 py-2 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition flex-shrink-0'>
              Mua Hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
