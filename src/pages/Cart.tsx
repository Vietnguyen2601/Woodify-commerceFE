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
    <div className='cart-page'>
      <header className='cart-topbar'>
        <div className='cart-topbar__logo'>
          <Link to='/'>Shopi<span>ee</span></Link>
          <span className='cart-topbar__title'>Giỏ Hàng</span>
        </div>
        <div className='cart-topbar__search'>
          <input type='text' placeholder='Tìm kiếm sản phẩm, shop hoặc voucher' />
          <button>Tìm kiếm</button>
        </div>
        <div className='cart-topbar__actions'>
          <button className='cart-icon-btn' aria-label='Thông báo'>
            <span>🔔</span>
          </button>
          <button className='cart-icon-btn' aria-label='Hỗ trợ'>
            <span>💬</span>
          </button>
          <button className='cart-icon-btn' aria-label='Chọn ngôn ngữ'>VI ▾</button>
          <Link to='/profile' className='cart-account'>
            <div className='cart-account__avatar'>NL</div>
            <div className='cart-account__name'>Ngọc Linh</div>
          </Link>
        </div>
      </header>

      <main className='cart-main'>
        <section className='cart-table-wrapper'>
          <div className='cart-table'>
            <div className='cart-table__head'>
              <div className='cart-table__head-product'>
                <label className='cart-checkbox'>
                  <input type='checkbox' checked={allSelected} onChange={toggleAll} />
                  <span>Chọn tất cả ({items.length})</span>
                </label>
                <span className='cart-table__hint'>Sản phẩm</span>
              </div>
              <div>Đơn giá</div>
              <div>Số lượng</div>
              <div>Số tiền</div>
              <div>Thao tác</div>
            </div>

            {items.length === 0 && (
              <div className='cart-empty'>
                <p>Giỏ hàng trống. Khám phá thêm deal hot ngay!</p>
                <Link to='/catalog' className='cart-cta ghost'>Tiếp tục mua sắm</Link>
              </div>
            )}

            {groupedShops.map(shop => (
              <article className='cart-shop' key={shop.shopId}>
                <div className='cart-shop__header'>
                  <label className='cart-checkbox'>
                    <input
                      type='checkbox'
                      checked={shop.items.every(item => selected.includes(item.id))}
                      onChange={() => toggleShop(shop.items)}
                    />
                    <span>
                      {shop.shopName}
                      <span className='cart-shop__favorite'>Yêu thích+</span>
                    </span>
                  </label>
                  <Link to='/profile' className='cart-link'>Trò chuyện</Link>
                </div>

                {shop.items.map(item => (
                  <div className='cart-row' key={item.id}>
                    <div className='cart-row__product'>
                      <label className='cart-checkbox'>
                        <input
                          type='checkbox'
                          checked={selected.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                      </label>
                      <img src={item.image} alt={item.title} className='cart-row__thumb' />
                      <div>
                        <div className='cart-row__title'>{item.title}</div>
                        <div className='cart-row__variant'>{item.variant}</div>
                        <div className='cart-row__meta'>{item.shippingEta}</div>
                      </div>
                    </div>
                    <div className='cart-row__price'>{currency(item.price)}</div>
                    <div className='cart-row__qty'>
                      <button onClick={() => handleQuantityChange(item.id, item.qty - 1)} disabled={item.qty === 1}>-</button>
                      <input
                        type='number'
                        min={1}
                        value={item.qty}
                        onChange={e => {
                          const nextValue = Number(e.target.value)
                          if (!Number.isNaN(nextValue)) {
                            handleQuantityChange(item.id, nextValue)
                          }
                        }}
                      />
                      <button onClick={() => handleQuantityChange(item.id, item.qty + 1)}>+</button>
                    </div>
                    <div className='cart-row__total'>{currency(item.price * item.qty)}</div>
                    <div className='cart-row__actions'>
                      <button onClick={() => remove(item.id)} className='cart-link'>Xóa</button>
                      <Link to='/catalog' className='cart-link muted'>Tìm sản phẩm tương tự</Link>
                    </div>
                  </div>
                ))}

                <div className='cart-shop__footer'>
                  <div className='cart-shop__voucher'>
                    <span className='badge'>Voucher Shop</span>
                    <p>{shop.shopVoucher}</p>
                    <button className='cart-link'>Xem thêm voucher ▸</button>
                  </div>
                  <div className='cart-shop__shipping'>
                    <span className='badge ghost'>Ưu đãi vận chuyển</span>
                    <p>{shop.shippingNote}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className='cart-shopee-voucher'>
            <div>
              <h3>Shopee Voucher</h3>
              <p>Chọn ngay mã giảm giá để tiết kiệm hơn</p>
            </div>
            <button className='cart-link strong'>Chọn hoặc nhập mã ▸</button>
            <label className='cart-checkbox cart-xu-option'>
              <input type='checkbox' disabled />
              <span>Dùng Shopee Xu (Hiện chưa khả dụng)</span>
            </label>
          </section>
        </section>

        <section className='cart-suggestion'>
          <div className='cart-section-heading'>
            <div>
              <p className='eyebrow'>DÀNH RIÊNG CHO BẠN</p>
              <h3>Có thể bạn cũng thích</h3>
            </div>
            <Link to='/catalog' className='cart-link strong'>Xem tất cả →</Link>
          </div>
          <div className='cart-suggestion__grid'>
            {suggestionProducts.map(product => (
              <div className='suggestion-card' key={product.id}>
                <div className='suggestion-card__media'>
                  <img src={product.image} alt={product.title} />
                  <span className='suggestion-card__badge'>{product.badge}</span>
                </div>
                <div className='suggestion-card__body'>
                  <p>{product.title}</p>
                  <strong>{product.price}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className='cart-action-bar'>
        <label className='cart-checkbox'>
          <input type='checkbox' checked={allSelected} onChange={toggleAll} />
          <span>Chọn tất cả ({items.length})</span>
        </label>
        <button className='cart-link' onClick={handleDeleteSelected}>Xóa</button>
        <button className='cart-link'>Lưu vào mục Đã thích</button>
        <div className='cart-action-bar__summary'>
          <span>Tổng thanh toán:</span>
          <strong>{currency(selectedTotal)}</strong>
        </div>
        <button className='cart-cta primary'>Mua Hàng</button>
      </div>
    </div>
  )
}
