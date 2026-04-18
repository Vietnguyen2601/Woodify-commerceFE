import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys, orderService } from '@/services'

const TOP_SELLING_LIMIT = 5

interface SellerTopSellingProductsChartProps {
  shopId: string
}

export default function SellerTopSellingProductsChart({ shopId }: SellerTopSellingProductsChartProps) {
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.seller.topSellingProducts(shopId, TOP_SELLING_LIMIT),
    queryFn: () => orderService.getTopSellingProducts(shopId, TOP_SELLING_LIMIT),
    enabled: !!shopId,
  })

  const maxUnits = React.useMemo(() => Math.max(...data.map((p) => p.unitsSold), 1), [data])

  if (!shopId) {
    return null
  }

  if (isLoading) {
    return (
      <article className='seller-home__chart-card'>
        <div>
          <p className='seller-home__eyebrow'>Top Selling Products</p>
          <h3>Sản phẩm perform tốt nhất</h3>
          <span className='seller-home__chart-subtitle'>Đang tải…</span>
        </div>
        <div className='rounded-2xl border border-stone-200 bg-stone-50/80 p-8 text-center text-sm text-stone-500'>
          Đang tải dữ liệu…
        </div>
      </article>
    )
  }

  if (isError) {
    const msg =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Không tải được danh sách sản phẩm bán chạy.'
    return (
      <article className='seller-home__chart-card'>
        <div>
          <p className='seller-home__eyebrow'>Top Selling Products</p>
          <h3>Sản phẩm perform tốt nhất</h3>
        </div>
        <div className='space-y-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-900'>
          <p>{msg}</p>
          <button
            type='button'
            onClick={() => refetch()}
            className='rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-900'
          >
            Thử lại
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className='seller-home__chart-card'>
      <div>
        <p className='seller-home__eyebrow'>Top Selling Products</p>
        <h3>Sản phẩm perform tốt nhất</h3>
        <span className='seller-home__chart-subtitle'>
          Top {TOP_SELLING_LIMIT} theo số lượng đã bán (đơn vị)
        </span>
      </div>
      {data.length === 0 ? (
        <p className='py-6 text-center text-sm text-stone-500'>
          Chưa có dữ liệu sản phẩm bán chạy cho shop.
        </p>
      ) : (
        <div className='chart-bars'>
          {data.map((item) => {
            const thumb = item.thumbnailUrl?.trim()
            const pct = (item.unitsSold / maxUnits) * 100
            return (
              <div key={`${item.productId}-${item.rank}`} className='chart-bars__row'>
                <div className='flex min-w-0 items-center gap-2'>
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=''
                      className='h-10 w-10 shrink-0 rounded-lg border border-stone-200/80 object-cover'
                    />
                  ) : (
                    <div
                      className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-100 text-[10px] text-stone-400'
                      aria-hidden
                    >
                      —
                    </div>
                  )}
                  <div className='min-w-0'>
                    <strong className='block truncate' title={item.productName}>
                      {item.productName.trim() || item.sellerSku}
                    </strong>
                    {item.sellerSku ? (
                      <span className='block truncate text-[11px] text-stone-500' title={item.sellerSku}>
                        SKU: {item.sellerSku}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className='chart-bars__meter'>
                  <span style={{ width: `${pct}%` }} />
                </div>
                <span className='chart-bars__value whitespace-nowrap tabular-nums'>
                  {item.unitsSold} đã bán
                </span>
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}
