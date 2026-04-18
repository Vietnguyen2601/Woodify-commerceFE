import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys, shopService } from '@/services'
import type { ShopRevenueTrend } from '@/types'

const SELLER_DASHBOARD_REVENUE_DAYS = 7

function dateKey(iso: string): string {
  return iso.slice(0, 10)
}

/** Mỗi ngày trong khoảng API (UTC); ngày không có trong `dailyRevenue` → revenue 0 */
function expandRevenueSeries(trend: ShopRevenueTrend): { label: string; revenue: number }[] {
  const map = new Map<string, number>()
  for (const row of trend.dailyRevenue) {
    map.set(dateKey(row.date), row.revenue)
  }
  const start = new Date(trend.startDate)
  const end = new Date(trend.endDate)
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
  const out: { label: string; revenue: number }[] = []
  for (let t = startUtc; t <= endUtc; t += 86_400_000) {
    const cur = new Date(t)
    const key = cur.toISOString().slice(0, 10)
    const dd = cur.getUTCDate()
    const mm = cur.getUTCMonth() + 1
    out.push({ label: `${dd}/${mm}`, revenue: map.get(key) ?? 0 })
  }
  return out
}

const vndFull = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

function formatFullVnd(n: number): string {
  return vndFull.format(Math.round(n))
}

function formatCompactVnd(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${Math.round(n / 1_000)}K`
  return `${Math.round(n)}`
}

function yTicks(maxY: number, steps: number): number[] {
  const m = Math.max(maxY, 1)
  const ticks: number[] = []
  for (let i = 0; i < steps; i++) {
    ticks.push((m * (steps - 1 - i)) / (steps - 1))
  }
  return ticks
}

interface SellerRevenueTrendChartProps {
  shopId: string
}

type RevenueTooltip = { dayLabel: string; amountText: string; x: number; y: number }

export default function SellerRevenueTrendChart({ shopId }: SellerRevenueTrendChartProps) {
  const [revenueTip, setRevenueTip] = React.useState<RevenueTooltip | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.seller.revenueTrend(shopId, SELLER_DASHBOARD_REVENUE_DAYS),
    queryFn: () => shopService.getRevenueTrend(shopId, SELLER_DASHBOARD_REVENUE_DAYS),
    enabled: !!shopId,
  })

  const series = React.useMemo(() => (data ? expandRevenueSeries(data) : []), [data])
  const maxY = React.useMemo(() => {
    const m = Math.max(...series.map((p) => p.revenue), 0)
    return m <= 0 ? 1 : m * 1.08
  }, [series])
  const ticks = React.useMemo(() => yTicks(maxY, 5), [maxY])

  const pointsStr = React.useMemo(() => {
    const n = series.length
    if (n === 0) return ''
    return series
      .map((point, index) => {
        const x = n <= 1 ? 50 : (index / (n - 1)) * 100
        const y = 60 - (point.revenue / maxY) * 60
        return `${x},${y}`
      })
      .join(' ')
  }, [series, maxY])

  if (!shopId) {
    return null
  }

  if (isLoading) {
    return (
      <article className='seller-home__chart-card seller-home__chart-card--compact'>
        <div>
          <p className='seller-home__eyebrow'>Revenue Over Time</p>
          <h3>Xu hướng doanh thu 7 ngày gần nhất</h3>
          <span className='seller-home__chart-subtitle'>Đang tải dữ liệu…</span>
        </div>
        <div className='rounded-2xl border border-stone-200 bg-stone-50/80 p-8 text-center text-sm text-stone-500'>
          Đang tải biểu đồ…
        </div>
      </article>
    )
  }

  if (isError) {
    const msg =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Không tải được dữ liệu doanh thu.'
    return (
      <article className='seller-home__chart-card seller-home__chart-card--compact'>
        <div>
          <p className='seller-home__eyebrow'>Revenue Over Time</p>
          <h3>Xu hướng doanh thu 7 ngày gần nhất</h3>
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
    <article className='seller-home__chart-card seller-home__chart-card--compact'>
      <div>
        <p className='seller-home__eyebrow'>Revenue Over Time</p>
        <h3>Xu hướng doanh thu 7 ngày gần nhất</h3>
        <span className='seller-home__chart-subtitle'>
          Tổng doanh thu {formatFullVnd(data!.totalRevenue)} ₫ · {data!.totalOrders} đơn · Trung bình{' '}
          {formatFullVnd(data!.averageDailyRevenue)} ₫/ngày
        </span>
      </div>
      <div className='chart-sparkline'>
        <div className='chart-sparkline__y-axis'>
          {ticks.map((t) => (
            <span key={t}>{formatCompactVnd(t)}</span>
          ))}
        </div>
        <div className='chart-sparkline__plot'>
          <svg viewBox='0 0 100 60' preserveAspectRatio='none'>
            {series.length > 0 && (
              <polyline
                points={pointsStr}
                fill='none'
                stroke='#b87436'
                strokeWidth='1.2'
                strokeLinejoin='round'
                strokeLinecap='round'
              />
            )}
            {series.map((point, index) => {
              const n = series.length
              const x = n <= 1 ? 50 : (index / (n - 1)) * 100
              const y = 60 - (point.revenue / maxY) * 60
              const amountText = `${formatFullVnd(point.revenue)} ₫`
              return (
                <g key={point.label + index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={5}
                    fill='transparent'
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) =>
                      setRevenueTip({
                        dayLabel: point.label,
                        amountText,
                        x: e.clientX,
                        y: e.clientY,
                      })
                    }
                    onMouseMove={(e) =>
                      setRevenueTip((prev) =>
                        prev ? { ...prev, x: e.clientX, y: e.clientY } : prev
                      )
                    }
                    onMouseLeave={() => setRevenueTip(null)}
                  />
                  <circle cx={x} cy={y} r={1.1} fill='#744420' pointerEvents='none' />
                </g>
              )
            })}
          </svg>
          {revenueTip ? (
            <div
              className='pointer-events-none fixed z-[100] rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-left text-[11px] shadow-lg'
              style={{
                left: revenueTip.x,
                top: revenueTip.y,
                transform: 'translate(-50%, calc(-100% - 10px))',
              }}
              role='tooltip'
            >
              <p className='text-stone-500'>Ngày {revenueTip.dayLabel}</p>
              <p className='font-semibold tabular-nums text-stone-900'>{revenueTip.amountText}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div
        className='chart-sparkline__x-axis'
        style={{
          gridTemplateColumns: `repeat(${Math.max(series.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {series.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </article>
  )
}
