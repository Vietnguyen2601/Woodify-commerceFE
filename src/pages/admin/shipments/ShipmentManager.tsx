import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminService, queryKeys } from '@/services'
import type { AdminShipmentDto } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: 'border border-green-200 bg-green-100 text-green-700',
  IN_TRANSIT: 'border border-purple-200 bg-purple-100 text-purple-700',
  PENDING: 'border border-blue-200 bg-blue-100 text-blue-700',
  DEFAULT: 'border border-gray-200 bg-gray-100 text-gray-800',
}

const styleFor = (status?: string) => {
  const u = (status || '').toUpperCase().replace(/\s+/g, '_')
  if (u in STATUS_STYLES) return STATUS_STYLES[u]
  if (u.includes('DELIVER')) return STATUS_STYLES.DELIVERED
  if (u.includes('TRANSIT')) return STATUS_STYLES.IN_TRANSIT
  return STATUS_STYLES.DEFAULT
}

const formatDate = (isoDate: string | null | undefined, locale: string, fallback: string) => {
  if (!isoDate) return fallback
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

export default function ShipmentManager() {
  const { isVietnamese } = useAppLanguage()
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')

  const t = React.useMemo(
    () => ({
      title: isVietnamese ? 'Quản lý vận chuyển' : 'Shipment Management',
      subtitle: isVietnamese ? 'Theo dõi trạng thái đơn vận chuyển và nhà cung cấp.' : 'Track shipment status and providers.',
      searchLabel: isVietnamese ? 'Tìm kiếm' : 'Search',
      searchPlaceholder: isVietnamese ? 'Mã vận chuyển, tracking, hoặc đơn hàng...' : 'Shipment id, tracking, or order...',
      statusLabel: isVietnamese ? 'Trạng thái' : 'Status',
      statusAll: isVietnamese ? 'Tất cả' : 'All',
      providersLabel: isVietnamese ? 'Nhà cung cấp' : 'Providers',
      metricsTotal: isVietnamese ? 'Tổng vận chuyển' : 'Total Shipments',
      metricsTransit: isVietnamese ? 'Đang vận chuyển (ước tính)' : 'In transit (heuristic)',
      metricsDelivered: isVietnamese ? 'Đã giao (ước tính)' : 'Delivered (heuristic)',
      metricsOther: isVietnamese ? 'Khác' : 'Other',
      showing: isVietnamese ? 'Hiển thị' : 'Showing',
      shipmentsLabel: isVietnamese ? 'vận chuyển' : 'shipments',
      tableShipment: isVietnamese ? 'Vận chuyển' : 'Shipment',
      tableOrder: isVietnamese ? 'Đơn hàng' : 'Order',
      tableProvider: isVietnamese ? 'Nhà cung cấp' : 'Provider',
      tableTracking: isVietnamese ? 'Tracking' : 'Tracking',
      tableStatus: isVietnamese ? 'Trạng thái' : 'Status',
      tableEta: isVietnamese ? 'Dự kiến' : 'ETA',
      loading: isVietnamese ? 'Đang tải…' : 'Loading…',
      empty: isVietnamese ? 'Không có vận chuyển.' : 'No shipments.',
      loadError: isVietnamese ? 'Không thể tải dữ liệu.' : 'Failed to load.',
      dash: '—',
      dateUnknown: isVietnamese ? 'Chưa xác định' : 'Unknown',
    }),
    [isVietnamese]
  )

  const { data: shipments = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.shipments(),
    queryFn: adminService.getAllShipments,
    staleTime: 60 * 1000,
  })

  const { data: providerPage } = useQuery({
    queryKey: [...queryKeys.admin.shipments(), 'providers'],
    queryFn: () => adminService.getShipmentProviders(1, 100),
    staleTime: 120 * 1000,
  })

  const providerName = React.useMemo(() => {
    const m = new Map<string, string>()
    for (const p of providerPage?.items ?? []) {
      m.set(p.providerId, p.providerName)
    }
    return m
  }, [providerPage])

  const metrics = React.useMemo(() => {
    const list = shipments
    const total = list.length
    const delivered = list.filter((s) => (s.status || '').toUpperCase().includes('DELIVER')).length
    const transit = list.filter((s) => (s.status || '').toUpperCase().includes('TRANSIT')).length
    const pending = total - delivered - transit
    return [
      { label: t.metricsTotal, value: String(total), iconBg: 'bg-blue-50' },
      { label: t.metricsTransit, value: String(transit), iconBg: 'bg-purple-50' },
      { label: t.metricsDelivered, value: String(delivered), iconBg: 'bg-green-50' },
      { label: t.metricsOther, value: String(Math.max(0, pending)), iconBg: 'bg-orange-50' },
    ]
  }, [shipments, t.metricsDelivered, t.metricsOther, t.metricsTotal, t.metricsTransit])

  const filtered = React.useMemo(() => {
    let list = [...shipments]
    if (statusFilter) {
      list = list.filter((s) => (s.status || '').toUpperCase() === statusFilter.toUpperCase())
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((s) => {
        const id = (s.shipmentId || s.id || '').toLowerCase()
        const tid = (s.trackingNumber || '').toLowerCase()
        const oid = (s.orderId || '').toLowerCase()
        return id.includes(q) || tid.includes(q) || oid.includes(q)
      })
    }
    return list
  }, [shipments, statusFilter, search])

  const uniqueStatuses = React.useMemo(() => {
    const set = new Set<string>()
    for (const s of shipments) {
      if (s.status) set.add(s.status)
    }
    return [...set].sort()
  }, [shipments])

  return (
    <div className='space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
        <p className='text-sm text-gray-500'>{t.subtitle}</p>
        {isError && (
          <p className='text-sm text-red-600'>{error instanceof Error ? error.message : t.loadError}</p>
        )}
      </header>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{isLoading ? '…' : metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconBg}`} />
            </div>
          </div>
        ))}
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='flex gap-4 items-start justify-between'>
          {/* Search - Left */}
          <div className='flex-[0.5] flex flex-col space-y-2'>
            <label className='text-xs font-medium text-gray-700'>{t.searchLabel}</label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='7' />
                  <path d='m16.5 16.5 4 4' strokeLinecap='round' />
                </svg>
              </span>
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className='h-10 w-full appearance-none rounded-xl border border-gray-200 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          {/* Filters - Right */}
          <div className='flex gap-3 items-start'>
            <div className='w-[120px] rounded-xl border border-gray-200 bg-white p-3'>
              <label className='mb-1 block text-xs font-medium text-gray-600'>{t.statusLabel}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              >
                <option value=''>{t.statusAll}</option>
                {uniqueStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className='w-[120px] rounded-xl border border-gray-200 bg-white p-3'>
              <label className='mb-1 block text-xs font-medium text-gray-600'>{t.providersLabel}</label>
              <div className='h-9 rounded-lg border border-transparent px-3 text-sm font-semibold text-gray-900 flex items-center'>
                {providerPage?.items.length ?? 0}
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        {t.showing} <span className='font-semibold text-gray-900'>{filtered.length}</span> {t.shipmentsLabel}
      </p>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>{t.tableShipment}</th>
                <th className='px-6 py-3 text-left'>{t.tableOrder}</th>
                <th className='px-6 py-3 text-left'>{t.tableProvider}</th>
                <th className='px-6 py-3 text-left'>{t.tableTracking}</th>
                <th className='px-6 py-3 text-left'>{t.tableStatus}</th>
                <th className='px-6 py-3 text-left'>{t.tableEta}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-900'>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center'>
                    {t.loading}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    {t.empty}
                  </td>
                </tr>
              ) : (
                filtered.map((s: AdminShipmentDto) => {
                  const sid = s.shipmentId || s.id || t.dash
                  const pid = s.providerId
                  return (
                    <tr key={sid}>
                      <td className='whitespace-nowrap px-6 py-4 font-mono text-xs'>{sid}</td>
                      <td className='px-6 py-4'>{s.orderId ?? t.dash}</td>
                      <td className='px-6 py-4'>{pid ? providerName.get(pid) ?? pid : t.dash}</td>
                      <td className='px-6 py-4 font-mono text-xs'>{s.trackingNumber ?? t.dash}</td>
                      <td className='px-6 py-4'>
                        <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${styleFor(s.status)}`}>
                          {s.status ?? t.dash}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-gray-600'>
                        {formatDate(s.estimatedDelivery, isVietnamese ? 'vi-VN' : 'en-US', t.dateUnknown)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
