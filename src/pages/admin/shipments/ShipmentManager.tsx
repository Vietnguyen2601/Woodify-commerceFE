import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminService, queryClient, queryKeys, shipmentService } from '@/services'
import type { AdminShipmentDto } from '@/types'
import type { ShipmentDto } from '@/types/shipmentEntity.types'
import type { ShipmentService as ProviderService, ShippingProvider } from '@/types/shipping.types'

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
  const [tab, setTab] = React.useState<'shipments' | 'providers' | 'services'>('shipments')
  const [selectedShipmentId, setSelectedShipmentId] = React.useState<string | null>(null)
  const [selectedProviderId, setSelectedProviderId] = React.useState<string | null>(null)
  const [providerDraft, setProviderDraft] = React.useState<Partial<ShippingProvider> | null>(null)
  const [statusNext, setStatusNext] = React.useState<string>('')
  const [reason, setReason] = React.useState<string>('')

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
      tabShipments: isVietnamese ? 'Vận đơn' : 'Shipments',
      tabProviders: isVietnamese ? 'Nhà vận chuyển' : 'Providers',
      tabServices: isVietnamese ? 'Gói dịch vụ' : 'Services',
      providerCreate: isVietnamese ? 'Tạo nhà vận chuyển' : 'Create provider',
      providerEdit: isVietnamese ? 'Sửa' : 'Edit',
      providerDelete: isVietnamese ? 'Xóa' : 'Delete',
      providerConfirmDelete: isVietnamese ? 'Xóa nhà vận chuyển này?' : 'Delete this provider?',
      providerName: isVietnamese ? 'Tên' : 'Name',
      providerPhone: isVietnamese ? 'SĐT hỗ trợ' : 'Support phone',
      providerEmail: isVietnamese ? 'Email hỗ trợ' : 'Support email',
      providerActive: isVietnamese ? 'Kích hoạt' : 'Active',
      save: isVietnamese ? 'Lưu' : 'Save',
      cancel: isVietnamese ? 'Hủy' : 'Cancel',
      serviceHint: isVietnamese
        ? 'Lưu ý: API tạo gói dịch vụ hiện backend thiếu ProviderId (theo doc), nên admin FE chỉ hỗ trợ xem/sửa/xóa.'
        : 'Note: Service create API is not usable (missing ProviderId per docs). FE supports list/update/delete only.',
      shipmentDetail: isVietnamese ? 'Chi tiết vận đơn' : 'Shipment detail',
      updateStatus: isVietnamese ? 'Cập nhật trạng thái' : 'Update status',
      statusNext: isVietnamese ? 'Trạng thái tiếp theo' : 'Next status',
      reasonLabel: isVietnamese ? 'Lý do (khi FAILED/CANCELLED)' : 'Reason (for FAILED/CANCELLED)',
      close: isVietnamese ? 'Đóng' : 'Close',
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
    queryFn: () => adminService.getShippingProviders(1, 100),
    staleTime: 120 * 1000,
  })

  const { data: allServices = [] } = useQuery({
    queryKey: [...queryKeys.admin.shipments(), 'services'],
    queryFn: adminService.listProviderServices,
    staleTime: 120 * 1000,
  })

  const { data: shipmentDetail } = useQuery({
    queryKey: [...queryKeys.admin.shipments(), 'detail', selectedShipmentId],
    queryFn: () => selectedShipmentId ? shipmentService.getShipmentById(selectedShipmentId) : Promise.resolve(null as any),
    enabled: Boolean(selectedShipmentId),
    staleTime: 0,
  })

  const providerMutation = useMutation({
    mutationFn: async (draft: Partial<ShippingProvider>) => {
      if (!draft.providerId) return adminService.createShippingProvider(draft)
      return adminService.updateShippingProvider(draft.providerId, draft)
    },
    onSuccess: async () => {
      setProviderDraft(null)
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.shipments(), 'providers'] })
    },
  })

  const providerDeleteMutation = useMutation({
    mutationFn: async (providerId: string) => adminService.deleteShippingProvider(providerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.shipments(), 'providers'] })
    },
  })

  const serviceUpdateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ProviderService> }) =>
      adminService.updateProviderService(id, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.shipments(), 'services'] })
    },
  })

  const serviceDeleteMutation = useMutation({
    mutationFn: async (serviceId: string) => adminService.deleteProviderService(serviceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.shipments(), 'services'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ shipmentId, nextStatus, reasonText }: { shipmentId: string; nextStatus: string; reasonText: string }) => {
      const payload: any = { status: nextStatus }
      const up = nextStatus.toUpperCase()
      if (up === 'DELIVERY_FAILED') payload.failureReason = reasonText || undefined
      if (up === 'CANCELLED') payload.cancelReason = reasonText || undefined
      return shipmentService.updateShipmentStatus(shipmentId, payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.shipments() })
      if (selectedShipmentId) {
        await queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.shipments(), 'detail', selectedShipmentId] })
      }
      setStatusNext('')
      setReason('')
    },
  })

  const allowedNextStatuses = React.useMemo(() => {
    const cur = (shipmentDetail?.status || '').toUpperCase()
    const map: Record<string, string[]> = {
      DRAFT: ['PENDING', 'CANCELLED'],
      PENDING: ['PICKUP_SCHEDULED', 'PICKED_UP', 'CANCELLED'],
      PICKUP_SCHEDULED: ['PENDING', 'PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'CANCELLED'],
      IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNING'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED', 'RETURNING'],
      DELIVERY_FAILED: ['RETURNING', 'CANCELLED'],
      RETURNING: ['RETURNED', 'DELIVERY_FAILED'],
      DELIVERED: [],
      RETURNED: [],
      CANCELLED: [],
    }
    return map[cur] ?? []
  }, [shipmentDetail?.status])

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

  const tabBtnClass = (active: boolean) =>
    [
      'inline-flex items-center justify-center',
      'rounded-xl border px-4 py-2 text-sm font-semibold',
      'transition-colors',
      active
        ? 'border-[#BE9C73] bg-[#BE9C73] text-white shadow-sm'
        : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
      'focus:outline-none focus:ring-2 focus:ring-[#BE9C73]/40 focus:ring-offset-2',
    ].join(' ')

  return (
    <div className='space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
        <p className='text-sm text-gray-500'>{t.subtitle}</p>
        {isError && (
          <p className='text-sm text-red-600'>{error instanceof Error ? error.message : t.loadError}</p>
        )}
      </header>

      <div className='flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm'>
        <button
          type='button'
          className={tabBtnClass(tab === 'shipments')}
          onClick={() => setTab('shipments')}
        >
          {t.tabShipments}
        </button>
        <button
          type='button'
          className={tabBtnClass(tab === 'providers')}
          onClick={() => setTab('providers')}
        >
          {t.tabProviders}
        </button>
        <button
          type='button'
          className={tabBtnClass(tab === 'services')}
          onClick={() => setTab('services')}
        >
          {t.tabServices}
        </button>
      </div>

      {tab === 'shipments' && (
        <>
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
                    <tr key={sid} className='cursor-pointer hover:bg-gray-50' onClick={() => setSelectedShipmentId(sid)}>
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
        </>
      )}

      {tab === 'providers' && (
        <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-bold text-gray-900'>{t.tabProviders}</h3>
              <p className='text-sm text-gray-500'>{t.providersLabel}: {providerPage?.items.length ?? 0}</p>
            </div>
            <button
              type='button'
              className='admin-btn primary'
              onClick={() => setProviderDraft({ isActive: true } as Partial<ShippingProvider>)}
            >
              {t.providerCreate}
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-100 text-sm'>
              <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                <tr>
                  <th className='px-6 py-3 text-left'>{t.providerName}</th>
                  <th className='px-6 py-3 text-left'>{t.providerPhone}</th>
                  <th className='px-6 py-3 text-left'>{t.providerEmail}</th>
                  <th className='px-6 py-3 text-left'>{t.providerActive}</th>
                  <th className='px-6 py-3 text-left'>{t.actions}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 text-gray-900'>
                {(providerPage?.items ?? []).map((p) => (
                  <tr key={p.providerId}>
                    <td className='px-6 py-4 font-medium'>{p.providerName}</td>
                    <td className='px-6 py-4'>{p.contactPhone ?? t.dash}</td>
                    <td className='px-6 py-4'>{p.contactEmail ?? t.dash}</td>
                    <td className='px-6 py-4'>{String(p.isActive ?? true)}</td>
                    <td className='px-6 py-4 flex gap-2'>
                      <button
                        type='button'
                        className='admin-btn outline'
                        onClick={() =>
                          setProviderDraft({
                            providerId: p.providerId,
                            name: p.providerName,
                            supportPhone: p.contactPhone ?? '',
                            supportEmail: p.contactEmail ?? '',
                            isActive: p.isActive ?? true,
                          })
                        }
                      >
                        {t.providerEdit}
                      </button>
                      <button
                        type='button'
                        className='admin-btn outline'
                        onClick={() => {
                          if (!window.confirm(t.providerConfirmDelete)) return
                          providerDeleteMutation.mutate(p.providerId)
                        }}
                      >
                        {t.providerDelete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'services' && (
        <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4'>
          <div>
            <h3 className='text-lg font-bold text-gray-900'>{t.tabServices}</h3>
            <p className='text-sm text-gray-500'>{t.serviceHint}</p>
          </div>

          <div className='flex flex-wrap gap-2 items-center'>
            <label className='text-xs font-medium text-gray-700'>{t.providersLabel}</label>
            <select
              value={selectedProviderId ?? ''}
              onChange={(e) => setSelectedProviderId(e.target.value || null)}
              className='h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
            >
              <option value=''>{t.statusAll}</option>
              {(providerPage?.items ?? []).map((p) => (
                <option key={p.providerId} value={p.providerId}>
                  {p.providerName}
                </option>
              ))}
            </select>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-100 text-sm'>
              <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                <tr>
                  <th className='px-6 py-3 text-left'>Code</th>
                  <th className='px-6 py-3 text-left'>{t.providerName}</th>
                  <th className='px-6 py-3 text-left'>ETA</th>
                  <th className='px-6 py-3 text-left'>{t.providerActive}</th>
                  <th className='px-6 py-3 text-left'>{t.actions}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 text-gray-900'>
                {(selectedProviderId ? allServices.filter((s) => s.providerId === selectedProviderId) : allServices).map((s) => (
                  <tr key={s.serviceId}>
                    <td className='px-6 py-4 font-mono text-xs'>{s.code}</td>
                    <td className='px-6 py-4'>{s.name}</td>
                    <td className='px-6 py-4'>
                      {s.estimatedDaysMin}-{s.estimatedDaysMax}
                    </td>
                    <td className='px-6 py-4'>{String(s.isActive)}</td>
                    <td className='px-6 py-4 flex gap-2'>
                      <button
                        type='button'
                        className='admin-btn outline'
                        onClick={() => serviceUpdateMutation.mutate({ id: s.serviceId, patch: { isActive: !s.isActive } })}
                      >
                        {s.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type='button'
                        className='admin-btn outline'
                        onClick={() => {
                          if (!window.confirm('Delete this service?')) return
                          serviceDeleteMutation.mutate(s.serviceId)
                        }}
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedShipmentId && shipmentDetail && (
        <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h3 className='text-lg font-bold text-gray-900'>{t.shipmentDetail}</h3>
              <p className='text-sm text-gray-500 font-mono'>{selectedShipmentId}</p>
            </div>
            <button type='button' className='admin-btn outline' onClick={() => setSelectedShipmentId(null)}>
              {t.close}
            </button>
          </div>

          <div className='grid gap-3 md:grid-cols-2'>
            <div className='rounded-xl border border-gray-100 p-4'>
              <p className='text-xs text-gray-500'>{t.tableOrder}</p>
              <p className='text-sm font-medium text-gray-900'>{shipmentDetail.orderId ?? t.dash}</p>
            </div>
            <div className='rounded-xl border border-gray-100 p-4'>
              <p className='text-xs text-gray-500'>{t.tableStatus}</p>
              <p className='text-sm font-medium text-gray-900'>{shipmentDetail.status ?? t.dash}</p>
            </div>
            <div className='rounded-xl border border-gray-100 p-4'>
              <p className='text-xs text-gray-500'>{t.tableTracking}</p>
              <p className='text-sm font-medium text-gray-900 font-mono'>{shipmentDetail.trackingNumber ?? t.dash}</p>
            </div>
            <div className='rounded-xl border border-gray-100 p-4'>
              <p className='text-xs text-gray-500'>{t.tableProvider}</p>
              <p className='text-sm font-medium text-gray-900'>{shipmentDetail.shippingProviderName ?? shipmentDetail.providerId ?? t.dash}</p>
            </div>
          </div>

          <div className='rounded-2xl border border-gray-100 p-4 space-y-3'>
            <p className='text-sm font-semibold text-gray-900'>{t.updateStatus}</p>
            <div className='grid gap-3 md:grid-cols-2'>
              <div>
                <label className='text-xs font-medium text-gray-700'>{t.statusNext}</label>
                <select
                  value={statusNext}
                  onChange={(e) => setStatusNext(e.target.value)}
                  className='mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
                >
                  <option value=''>{t.statusAll}</option>
                  {allowedNextStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-xs font-medium text-gray-700'>{t.reasonLabel}</label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className='mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
                  placeholder='...'
                />
              </div>
            </div>
            <div className='flex justify-end'>
              <button
                type='button'
                className='admin-btn primary'
                disabled={!statusNext || statusMutation.isPending}
                onClick={() => statusMutation.mutate({ shipmentId: selectedShipmentId, nextStatus: statusNext, reasonText: reason })}
              >
                {t.save}
              </button>
            </div>
          </div>
        </section>
      )}

      {providerDraft && (
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4'>
          <h3 className='text-lg font-bold text-gray-900'>{providerDraft.providerId ? t.providerEdit : t.providerCreate}</h3>
          <div className='grid gap-3 md:grid-cols-2'>
            <div>
              <label className='text-xs font-medium text-gray-700'>{t.providerName}</label>
              <input
                value={providerDraft.name ?? ''}
                onChange={(e) => setProviderDraft((prev) => ({ ...(prev ?? {}), name: e.target.value }))}
                className='mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-gray-700'>{t.providerPhone}</label>
              <input
                value={providerDraft.supportPhone ?? ''}
                onChange={(e) => setProviderDraft((prev) => ({ ...(prev ?? {}), supportPhone: e.target.value }))}
                className='mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-gray-700'>{t.providerEmail}</label>
              <input
                value={providerDraft.supportEmail ?? ''}
                onChange={(e) => setProviderDraft((prev) => ({ ...(prev ?? {}), supportEmail: e.target.value }))}
                className='mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              />
            </div>
            <div className='flex items-center gap-2 pt-6'>
              <input
                type='checkbox'
                checked={Boolean(providerDraft.isActive ?? true)}
                onChange={(e) => setProviderDraft((prev) => ({ ...(prev ?? {}), isActive: e.target.checked }))}
              />
              <span className='text-sm text-gray-800'>{t.providerActive}</span>
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <button type='button' className='admin-btn outline' onClick={() => setProviderDraft(null)}>
              {t.cancel}
            </button>
            <button
              type='button'
              className='admin-btn primary'
              disabled={providerMutation.isPending}
              onClick={() => providerDraft && providerMutation.mutate(providerDraft)}
            >
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
