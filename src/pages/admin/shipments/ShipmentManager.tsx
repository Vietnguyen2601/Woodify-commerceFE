import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService, queryKeys } from '@/services'
import type { ShipmentDto } from '@/types'

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

export default function ShipmentManager() {
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')

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
      { label: 'Total Shipments', value: String(total), iconBg: 'bg-blue-50' },
      { label: 'In transit (heuristic)', value: String(transit), iconBg: 'bg-purple-50' },
      { label: 'Delivered (heuristic)', value: String(delivered), iconBg: 'bg-green-50' },
      { label: 'Other', value: String(Math.max(0, pending)), iconBg: 'bg-orange-50' },
    ]
  }, [shipments])

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
        <h1 className='text-2xl font-bold text-gray-900'>Shipment Management</h1>
        <p className='text-sm text-gray-500'>GET /shipments/GetAllShipments + /shipment/providers (ADMIN_API_SPEC)</p>
        {isError && (
          <p className='text-sm text-red-600'>{error instanceof Error ? error.message : 'Failed to load'}</p>
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
        <div className='grid gap-4 lg:grid-cols-[2fr_repeat(3,minmax(0,1fr))]'>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Search</label>
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Shipment id, tracking, or order id'
              className='h-10 w-full rounded-xl border border-gray-200 pl-4 pr-4 text-sm'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm'
            >
              <option value=''>All</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Providers loaded</label>
            <p className='text-sm text-gray-700 pt-2'>{providerPage?.items.length ?? 0} providers</p>
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        Showing <span className='font-semibold text-gray-900'>{filtered.length}</span> shipments
      </p>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>Shipment</th>
                <th className='px-6 py-3 text-left'>Order</th>
                <th className='px-6 py-3 text-left'>Provider</th>
                <th className='px-6 py-3 text-left'>Tracking</th>
                <th className='px-6 py-3 text-left'>Status</th>
                <th className='px-6 py-3 text-left'>ETA</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-900'>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center'>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    No shipments.
                  </td>
                </tr>
              ) : (
                filtered.map((s: ShipmentDto) => {
                  const sid = s.shipmentId || s.id || '—'
                  const pid = s.providerId
                  return (
                    <tr key={sid}>
                      <td className='whitespace-nowrap px-6 py-4 font-mono text-xs'>{sid}</td>
                      <td className='px-6 py-4'>{s.orderId ?? '—'}</td>
                      <td className='px-6 py-4'>{pid ? providerName.get(pid) ?? pid : '—'}</td>
                      <td className='px-6 py-4 font-mono text-xs'>{s.trackingNumber ?? '—'}</td>
                      <td className='px-6 py-4'>
                        <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${styleFor(s.status)}`}>
                          {s.status ?? '—'}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-gray-600'>
                        {s.estimatedDelivery
                          ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(s.estimatedDelivery))
                          : '—'}
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
