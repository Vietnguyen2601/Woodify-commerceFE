import React from 'react'
import { shopService } from '@/services'
import type {
  ShopMonthlyAnalytics,
  ShopQuarterlyAnalytics,
  ShopYearlyAnalytics,
} from '@/types'

const vnd = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

function formatVnd(n: number): string {
  return `${vnd.format(Math.round(n))} ₫`
}

function formatPct(n: number): string {
  if (Number.isNaN(n)) return '—'
  const rounded = Math.round(n * 100) / 100
  return `${rounded >= 0 ? '+' : ''}${rounded}%`
}

const MONTH_VI = [
  '',
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

type AnalyticsMode = 'monthly' | 'quarterly' | 'yearly'

type Result =
  | { mode: 'monthly'; data: ShopMonthlyAnalytics }
  | { mode: 'quarterly'; data: ShopQuarterlyAnalytics }
  | { mode: 'yearly'; data: ShopYearlyAnalytics }

interface SellerDashboardAnalyticsProps {
  shopId: string
}

export default function SellerDashboardAnalytics({ shopId }: SellerDashboardAnalyticsProps) {
  const yNow = new Date().getFullYear()

  const [mode, setMode] = React.useState<AnalyticsMode>('monthly')
  const [year, setYear] = React.useState(yNow)
  const [startYear, setStartYear] = React.useState(yNow - 1)
  const [endYear, setEndYear] = React.useState(yNow)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<Result | null>(null)

  React.useEffect(() => {
    setResult(null)
    setError(null)
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopId) return

    if (mode === 'yearly' && startYear > endYear) {
      setError('Năm bắt đầu không được lớn hơn năm kết thúc.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (mode === 'monthly') {
        const data = await shopService.getMonthlyAnalytics(shopId, year)
        setResult({ mode: 'monthly', data })
      } else if (mode === 'quarterly') {
        const data = await shopService.getQuarterlyAnalytics(shopId, year)
        setResult({ mode: 'quarterly', data })
      } else {
        const data = await shopService.getYearlyAnalytics(shopId, startYear, endYear)
        setResult({ mode: 'yearly', data })
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Không tải được dữ liệu phân tích.'
      setError(msg)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const tabBtn = (m: AnalyticsMode, label: string) => (
    <button
      key={m}
      type='button'
      onClick={() => setMode(m)}
      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
        mode === m
          ? 'bg-amber-900 text-white shadow'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-4 rounded-3xl border border-amber-900/15 bg-white p-5 shadow-sm'>
      <div>
        <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500'>
          Phân tích doanh thu
        </p>
        <h3 className='mt-1 text-base font-bold text-stone-900'>Theo thời gian</h3>
        <p className='mt-0.5 text-xs text-stone-500'>
          Chọn loại báo cáo, nhập tham số và nhấn Enter hoặc &quot;Xem báo cáo&quot;.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-wrap gap-2' role='tablist' aria-label='Loại phân tích'>
          {tabBtn('monthly', 'Tháng')}
          {tabBtn('quarterly', 'Quý')}
          {tabBtn('yearly', 'Năm')}
        </div>

        {mode === 'monthly' && (
          <div className='flex flex-wrap items-end gap-3'>
            <label className='flex flex-col gap-1'>
              <span className='text-[11px] font-semibold uppercase tracking-wide text-stone-500'>Năm</span>
              <input
                type='number'
                name='year'
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || yNow)}
                className='w-32 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-800'
              />
            </label>
            <p className='max-w-md text-[11px] leading-relaxed text-stone-500'>
              Doanh thu gộp theo từng tháng trong năm đã chọn.
            </p>
          </div>
        )}

        {mode === 'quarterly' && (
          <div className='flex flex-wrap items-end gap-3'>
            <label className='flex flex-col gap-1'>
              <span className='text-[11px] font-semibold uppercase tracking-wide text-stone-500'>Năm</span>
              <input
                type='number'
                name='year'
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || yNow)}
                className='w-32 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-800'
              />
            </label>
            <p className='max-w-md text-[11px] leading-relaxed text-stone-500'>
              Báo cáo theo quý (Q1–Q4) trong năm đã chọn.
            </p>
          </div>
        )}

        {mode === 'yearly' && (
          <div className='flex flex-wrap items-end gap-4'>
            <label className='flex flex-col gap-1'>
              <span className='text-[11px] font-semibold uppercase tracking-wide text-stone-500'>Năm bắt đầu</span>
              <input
                type='number'
                name='startYear'
                min={2000}
                max={2100}
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value) || yNow)}
                className='w-32 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-800'
              />
            </label>
            <label className='flex flex-col gap-1'>
              <span className='text-[11px] font-semibold uppercase tracking-wide text-stone-500'>Năm kết thúc</span>
              <input
                type='number'
                name='endYear'
                min={2000}
                max={2100}
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value) || yNow)}
                className='w-32 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-800'
              />
            </label>
            <p className='max-w-md text-[11px] leading-relaxed text-stone-500'>
              So sánh doanh thu và đơn hàng giữa các năm trong khoảng.
            </p>
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2'>
          <button
            type='submit'
            disabled={loading}
            className='rounded-xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60'
          >
            {loading ? 'Đang tải…' : 'Xem báo cáo'}
          </button>
          <span className='text-[11px] text-stone-400'>Hoặc nhấn Enter trong ô số</span>
        </div>
      </form>

      {error ? (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900' role='alert'>
          {error}
        </div>
      ) : null}

      {result?.mode === 'monthly' ? <MonthlyBlock data={result.data} /> : null}
      {result?.mode === 'quarterly' ? <QuarterlyBlock data={result.data} /> : null}
      {result?.mode === 'yearly' ? <YearlyBlock data={result.data} /> : null}
    </div>
  )
}

function MonthlyBlock({ data }: { data: ShopMonthlyAnalytics }) {
  return (
    <div className='space-y-4 border-t border-stone-100 pt-4'>
      <SummaryRow
        items={[
          { label: 'Năm', value: String(data.year) },
          { label: 'Tổng doanh thu', value: formatVnd(data.totalRevenue) },
          { label: 'Tổng đơn', value: String(data.totalOrders) },
          { label: 'Trung bình doanh thu / tháng', value: formatVnd(data.averageMonthlyRevenue) },
          {
            label: 'Tháng doanh thu cao nhất',
            value: MONTH_VI[data.highestRevenueMonth] ?? `Tháng ${data.highestRevenueMonth}`,
          },
          {
            label: 'Tháng doanh thu thấp nhất',
            value: MONTH_VI[data.lowestRevenueMonth] ?? `Tháng ${data.lowestRevenueMonth}`,
          },
        ]}
      />
      <div className='overflow-x-auto rounded-2xl border border-stone-200'>
        <table className='w-full min-w-[640px] text-left text-xs'>
          <thead className='bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500'>
            <tr>
              <th className='px-3 py-2'>Tháng</th>
              <th className='px-3 py-2'>Tên tháng</th>
              <th className='px-3 py-2'>Doanh thu</th>
              <th className='px-3 py-2'>Số đơn</th>
              <th className='px-3 py-2'>Đơn hoàn thành</th>
              <th className='px-3 py-2'>Giá trị đơn trung bình</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-stone-100 text-stone-800'>
            {data.monthlyData.map((row) => (
              <tr key={row.month}>
                <td className='px-3 py-2 font-medium'>{row.month}</td>
                <td className='px-3 py-2'>{MONTH_VI[row.month] ?? row.monthName}</td>
                <td className='px-3 py-2 tabular-nums'>{formatVnd(row.revenue)}</td>
                <td className='px-3 py-2 tabular-nums'>{row.ordersCount}</td>
                <td className='px-3 py-2 tabular-nums'>{row.completedOrdersCount}</td>
                <td className='px-3 py-2 tabular-nums'>{formatVnd(row.avgOrderValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.monthlyData.length === 0 ? (
        <p className='text-center text-sm text-stone-500'>Không có dòng dữ liệu theo tháng.</p>
      ) : null}
    </div>
  )
}

function QuarterlyBlock({ data }: { data: ShopQuarterlyAnalytics }) {
  const qRow = (label: string, row: ShopQuarterlyAnalytics['highestQuarter']) => (
    <div className='rounded-xl border border-stone-100 bg-stone-50/80 p-3 text-xs'>
      <p className='font-semibold text-stone-700'>{label}</p>
      <dl className='mt-2 grid gap-1 sm:grid-cols-2'>
        <div>
          <dt className='text-stone-500'>Quý</dt>
          <dd>
            {row.quarter} — {row.quarterName}
          </dd>
        </div>
        <div>
          <dt className='text-stone-500'>Doanh thu</dt>
          <dd className='tabular-nums'>{formatVnd(row.revenue)}</dd>
        </div>
        <div>
          <dt className='text-stone-500'>Số đơn</dt>
          <dd className='tabular-nums'>{row.ordersCount}</dd>
        </div>
        <div>
          <dt className='text-stone-500'>Trung bình / tháng trong quý</dt>
          <dd className='tabular-nums'>{formatVnd(row.avgMonthlyInQuarter)}</dd>
        </div>
        <div className='sm:col-span-2'>
          <dt className='text-stone-500'>Tăng trưởng</dt>
          <dd>{formatPct(row.growthPercent)}</dd>
        </div>
      </dl>
    </div>
  )

  return (
    <div className='space-y-4 border-t border-stone-100 pt-4'>
      <div className='flex flex-wrap gap-3 text-sm'>
        <span className='rounded-lg bg-amber-50 px-2 py-1 text-stone-800'>
          Năm: <strong>{data.year}</strong>
        </span>
        <span className='rounded-lg bg-amber-50 px-2 py-1 text-stone-800'>
          Tổng doanh thu: <strong className='tabular-nums'>{formatVnd(data.totalRevenue)}</strong>
        </span>
      </div>

      <div className='grid gap-3 md:grid-cols-2'>
        {qRow('Quý cao nhất', data.highestQuarter)}
        {qRow('Quý thấp nhất', data.lowestQuarter)}
      </div>

      <div className='overflow-x-auto rounded-2xl border border-stone-200'>
        <table className='w-full min-w-[560px] text-left text-xs'>
          <thead className='bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500'>
            <tr>
              <th className='px-3 py-2'>Quý</th>
              <th className='px-3 py-2'>Tên quý</th>
              <th className='px-3 py-2'>Doanh thu</th>
              <th className='px-3 py-2'>Số đơn</th>
              <th className='px-3 py-2'>Trung bình / tháng trong quý</th>
              <th className='px-3 py-2'>Tăng trưởng</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-stone-100 text-stone-800'>
            {data.quarterlyData.map((row) => (
              <tr key={row.quarter}>
                <td className='px-3 py-2 font-medium'>{row.quarter}</td>
                <td className='px-3 py-2'>{row.quarterName}</td>
                <td className='px-3 py-2 tabular-nums'>{formatVnd(row.revenue)}</td>
                <td className='px-3 py-2 tabular-nums'>{row.ordersCount}</td>
                <td className='px-3 py-2 tabular-nums'>{formatVnd(row.avgMonthlyInQuarter)}</td>
                <td className='px-3 py-2 tabular-nums'>{formatPct(row.growthPercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function YearlyBlock({ data }: { data: ShopYearlyAnalytics }) {
  const yRow = (label: string, row: ShopYearlyAnalytics['highestYear']) => (
    <div className='rounded-xl border border-stone-100 bg-stone-50/80 p-3 text-xs'>
      <p className='font-semibold text-stone-700'>{label}</p>
      <dl className='mt-2 grid gap-1 sm:grid-cols-2'>
        <div>
          <dt className='text-stone-500'>Năm</dt>
          <dd>{row.year}</dd>
        </div>
        <div>
          <dt className='text-stone-500'>Doanh thu</dt>
          <dd className='tabular-nums'>{formatVnd(row.revenue)}</dd>
        </div>
        <div>
          <dt className='text-stone-500'>Số đơn</dt>
          <dd className='tabular-nums'>{row.ordersCount}</dd>
        </div>
        <div>
          <dt className='text-stone-500'>Tăng trưởng</dt>
          <dd>{formatPct(row.growthPercent)}</dd>
        </div>
        <div className='sm:col-span-2'>
          <dt className='text-stone-500'>Trung bình doanh thu / tháng</dt>
          <dd className='tabular-nums'>{formatVnd(row.avgMonthlyRevenue)}</dd>
        </div>
      </dl>
    </div>
  )

  return (
    <div className='space-y-4 border-t border-stone-100 pt-4'>
      <div className='flex flex-wrap gap-2 text-xs text-stone-700'>
        <span className='rounded-lg bg-amber-50 px-2 py-1'>
          Khoảng năm: <strong>{data.startYear}</strong> → <strong>{data.endYear}</strong>
        </span>
        <span className='rounded-lg bg-amber-50 px-2 py-1'>
          Tổng doanh thu: <strong className='tabular-nums'>{formatVnd(data.totalRevenue)}</strong>
        </span>
        <span className='rounded-lg bg-amber-50 px-2 py-1'>
          Trung bình doanh thu / năm:{' '}
          <strong className='tabular-nums'>{formatVnd(data.averageYearlyRevenue)}</strong>
        </span>
      </div>

      <div className='grid gap-3 md:grid-cols-2'>
        {yRow('Năm doanh thu cao nhất', data.highestYear)}
        {yRow('Năm doanh thu thấp nhất', data.lowestYear)}
      </div>

      <div className='overflow-x-auto rounded-2xl border border-stone-200'>
        <table className='w-full min-w-[520px] text-left text-xs'>
          <thead className='bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500'>
            <tr>
              <th className='px-3 py-2'>Năm</th>
              <th className='px-3 py-2'>Doanh thu</th>
              <th className='px-3 py-2'>Số đơn</th>
              <th className='px-3 py-2'>Tăng trưởng</th>
              <th className='px-3 py-2'>Trung bình doanh thu / tháng</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-stone-100 text-stone-800'>
            {data.yearlyData.map((row) => (
              <tr key={row.year}>
                <td className='px-3 py-2 font-medium'>{row.year}</td>
                <td className='px-3 py-2 tabular-nums'>{formatVnd(row.revenue)}</td>
                <td className='px-3 py-2 tabular-nums'>{row.ordersCount}</td>
                <td className='px-3 py-2 tabular-nums'>{formatPct(row.growthPercent)}</td>
                <td className='px-3 py-2 tabular-nums'>{formatVnd(row.avgMonthlyRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((it) => (
        <div key={it.label} className='rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2 text-xs'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-stone-500'>{it.label}</p>
          <p className='mt-0.5 font-semibold text-stone-900'>{it.value}</p>
        </div>
      ))}
    </div>
  )
}
