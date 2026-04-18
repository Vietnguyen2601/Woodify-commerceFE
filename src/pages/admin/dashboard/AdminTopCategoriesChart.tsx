import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService, queryKeys } from '@/services'

const TOP_N = 10

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

type Props = {
  isVietnamese: boolean
}

export default function AdminTopCategoriesChart({ isVietnamese }: Props) {
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.topCategories(TOP_N),
    queryFn: () => adminService.getTopCategories(TOP_N),
    staleTime: 60 * 1000,
  })

  const maxSold = React.useMemo(() => Math.max(1, ...data.map((d) => Number(d.totalItemsSold) || 0)), [data])

  const t = isVietnamese
    ? {
        title: 'Top danh mục theo lượt mua',
        subtitle: `So sánh số lượng đã bán (tối đa ${TOP_N} danh mục)`,
        yLabel: 'Số lượng đã bán',
        units: 'SP',
        revenue: 'DT',
        loading: 'Đang tải dữ liệu…',
        empty: 'Chưa có dữ liệu danh mục.',
        error: 'Không tải được biểu đồ.',
        retry: 'Thử lại',
      }
    : {
        title: 'Top categories by purchase volume',
        subtitle: `Units sold comparison (up to ${TOP_N} categories)`,
        yLabel: 'Units sold',
        units: 'units',
        revenue: 'Rev.',
        loading: 'Loading…',
        empty: 'No category data yet.',
        error: 'Could not load chart.',
        retry: 'Retry',
      }

  if (isLoading) {
    return (
      <div className='flex min-h-[220px] flex-col justify-center rounded-xl border border-dashed border-gray-200 bg-white p-4'>
        <div className='mb-3 h-4 w-48 animate-pulse rounded bg-gray-100' />
        <div className='flex h-44 items-end gap-2'>
          {Array.from({ length: TOP_N }).map((_, i) => (
            <div key={i} className='flex flex-1 flex-col items-center justify-end'>
              <div
                className='w-full max-w-[40px] animate-pulse rounded-t bg-gray-100'
                style={{ height: `${20 + ((i * 7) % 60)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    const msg =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : t.error
    return (
      <div className='rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-900'>
        <p>{msg}</p>
        <button
          type='button'
          onClick={() => void refetch()}
          className='mt-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-900'
        >
          {t.retry}
        </button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-6 text-center text-sm text-gray-500'>
        {t.empty}
      </div>
    )
  }

  return (
    <div className='w-full overflow-x-auto'>
      <p className='mb-0.5 text-xs text-gray-500'>{t.subtitle}</p>
      <p className='mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400'>{t.yLabel}</p>
      <div
        className='flex min-h-[200px] items-end gap-1.5 border-b border-gray-200 pb-1 pt-2 sm:gap-2'
        role='img'
        aria-label={t.title}
      >
        {data.map((cat) => {
          const sold = Number(cat.totalItemsSold) || 0
          const pct = (sold / maxSold) * 100
          const label = (cat.name || '—').trim()
          const short = label.length > 14 ? `${label.slice(0, 12)}…` : label
          const title = `${label}\n${t.units}: ${sold}\n${t.revenue}: ${fmtMoney(Number(cat.totalSalesRevenue) || 0)}`
          return (
            <div
              key={cat.categoryId}
              className='flex min-w-[52px] max-w-[88px] flex-1 flex-col items-center justify-end'
            >
              <div className='flex h-[160px] w-full flex-col justify-end'>
                <div
                  className='mx-auto w-full max-w-[52px] rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm transition-transform hover:scale-[1.02]'
                  style={{ height: `${Math.max(6, pct)}%` }}
                  title={title}
                />
              </div>
              <span
                className='mt-2 line-clamp-2 w-full text-center text-[10px] font-medium leading-tight text-gray-700 sm:text-[11px]'
                title={label}
              >
                {short}
              </span>
              <span className='mt-0.5 text-[10px] tabular-nums text-gray-500'>{sold}</span>
            </div>
          )
        })}
      </div>
      <p className='mt-2 text-[10px] text-gray-400'>
        {isVietnamese
          ? 'Cột: số lượng đã bán · Hover để xem doanh thu.'
          : 'Bars: units sold · Hover for revenue.'}
      </p>
    </div>
  )
}
