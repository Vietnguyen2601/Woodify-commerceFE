import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminService, financeWithdrawalService, queryKeys } from '@/services'
import type { SellerWithdrawalTicket } from '@/types'

const fmtVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string | undefined, locale: string) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const statusChip = (status: string) => {
  const u = status.toUpperCase()
  if (u === 'PENDING') return 'admin-chip warning'
  if (u === 'APPROVED' || u === 'COMPLETED') return 'admin-chip success'
  if (u === 'REJECTED') return 'admin-chip danger'
  return 'admin-chip neutral'
}

export default function AdminFinance() {
  const { isVietnamese } = useAppLanguage()
  const queryClient = useQueryClient()
  const [tab, setTab] = React.useState<'pending' | 'all'>('pending')
  const [search, setSearch] = React.useState('')
  const [rejectFor, setRejectFor] = React.useState<SellerWithdrawalTicket | null>(null)
  const [rejectNote, setRejectNote] = React.useState('')
  const [actionError, setActionError] = React.useState<string | null>(null)

  const t = React.useMemo(
    () => ({
      eyebrow: isVietnamese ? 'Tài chính' : 'Finance',
      title: isVietnamese ? 'Rút tiền seller & đối soát' : 'Seller payouts & reconciliation',
      subtitle: isVietnamese
        ? 'Tiền net vào ví shop sau khi đơn được thanh toán và trừ hoa hồng hệ thống. Seller gửi ticket rút tiền; bạn duyệt tại đây.'
        : 'Net shop balance after paid orders minus platform commission. Sellers submit withdrawal tickets; you approve or reject them here.',
      refresh: isVietnamese ? 'Làm mới' : 'Refresh',
      export: isVietnamese ? 'Xuất báo cáo' : 'Export report',
      panelTitle: isVietnamese ? 'Hàng chờ rút tiền' : 'Withdrawal requests',
      panelHint: isVietnamese
        ? 'Danh sách lấy từ API withdrawal (xem ADMIN_API.WITHDRAWALS trong mã nguồn). Nếu backend chưa bật route, bảng sẽ trống.'
        : 'List is loaded from the withdrawal API (see ADMIN_API.WITHDRAWALS). If the gateway route is not live yet, the table stays empty.',
      tabPending: isVietnamese ? 'Chờ duyệt' : 'Pending',
      tabAll: isVietnamese ? 'Tất cả' : 'All',
      searchPh: isVietnamese ? 'Mã ticket, shop, ghi chú…' : 'Ticket id, shop, notes…',
      colTicket: isVietnamese ? 'Ticket' : 'Ticket',
      colShop: isVietnamese ? 'Cửa hàng' : 'Shop',
      colAmount: isVietnamese ? 'Số tiền' : 'Amount',
      colStatus: isVietnamese ? 'Trạng thái' : 'Status',
      colRequested: isVietnamese ? 'Gửi lúc' : 'Requested',
      colNote: isVietnamese ? 'Ghi chú seller' : 'Seller note',
      colActions: isVietnamese ? 'Thao tác' : 'Actions',
      approve: isVietnamese ? 'Duyệt' : 'Approve',
      reject: isVietnamese ? 'Từ chối' : 'Reject',
      loading: isVietnamese ? 'Đang tải…' : 'Loading…',
      loadErr: isVietnamese ? 'Không tải được danh sách.' : 'Failed to load list.',
      emptyPending: isVietnamese ? 'Không có ticket chờ duyệt.' : 'No pending withdrawal tickets.',
      emptyAll: isVietnamese ? 'Chưa có ticket nào.' : 'No withdrawal tickets yet.',
      close: isVietnamese ? 'Đóng' : 'Close',
      rejectTitle: isVietnamese ? 'Từ chối yêu cầu' : 'Reject request',
      rejectHint: isVietnamese ? 'Lý do (tùy chọn, hiển thị cho vận hành / seller).' : 'Reason (optional, for ops / seller trail).',
      rejectSubmit: isVietnamese ? 'Xác nhận từ chối' : 'Confirm reject',
      rejectCancel: isVietnamese ? 'Hủy' : 'Cancel',
    }),
    [isVietnamese]
  )

  const { data: shops = [] } = useQuery({
    queryKey: queryKeys.admin.shops(),
    queryFn: adminService.getAdminShops,
    staleTime: 120 * 1000,
  })

  const shopName = React.useCallback(
    (shopId: string) => shops.find((s) => s.shopId === shopId)?.name?.trim() || shopId,
    [shops]
  )

  const {
    data: tickets = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.admin.withdrawalTickets(),
    queryFn: financeWithdrawalService.listTickets,
    staleTime: 30 * 1000,
  })

  const merged = React.useMemo(
    () =>
      tickets.map((row) => ({
        ...row,
        shopName: row.shopName?.trim() || shopName(row.shopId),
      })),
    [tickets, shopName]
  )

  const filtered = React.useMemo(() => {
    let list =
      tab === 'pending' ? merged.filter((x) => String(x.status).toUpperCase() === 'PENDING') : [...merged]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((x) => {
        const blob = [x.id, x.shopId, x.shopName, x.sellerNote, x.status].filter(Boolean).join(' ').toLowerCase()
        return blob.includes(q)
      })
    }
    list.sort((a, b) => {
      const ta = Date.parse(a.requestedAt || '') || 0
      const tb = Date.parse(b.requestedAt || '') || 0
      return tb - ta
    })
    return list
  }, [merged, tab, search])

  const approveMut = useMutation({
    mutationFn: (id: string) => financeWithdrawalService.approveTicket(id),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.withdrawalTickets() })
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? String(e)
      setActionError(msg)
    },
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => financeWithdrawalService.rejectTicket(id, note),
    onSuccess: async () => {
      setActionError(null)
      setRejectFor(null)
      setRejectNote('')
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.withdrawalTickets() })
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? String(e)
      setActionError(msg)
    },
  })

  const mutating = approveMut.isPending || rejectMut.isPending

  const locale = isVietnamese ? 'vi-VN' : 'en-US'

  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <span>{t.subtitle}</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn ghost' disabled>
            {t.export}
          </button>
          <button
            type='button'
            className='admin-btn primary'
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? t.loading : t.refresh}
          </button>
        </div>
      </header>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <div>
            <h3>{t.panelTitle}</h3>
            <p className='text-sm text-stone-500'>{t.panelHint}</p>
          </div>
        </header>

        {actionError ? (
          <p className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800' role='alert'>
            {actionError}
          </p>
        ) : null}

        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <div className='inline-flex rounded-full border border-stone-200 bg-stone-50 p-1'>
            <button
              type='button'
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                tab === 'pending' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900',
              ].join(' ')}
              onClick={() => setTab('pending')}
            >
              {t.tabPending}
              <span className='ml-1 text-stone-400'>
                ({merged.filter((x) => String(x.status).toUpperCase() === 'PENDING').length})
              </span>
            </button>
            <button
              type='button'
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                tab === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900',
              ].join(' ')}
              onClick={() => setTab('all')}
            >
              {t.tabAll}
            </button>
          </div>
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPh}
            className='min-w-[200px] flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-800 outline-none ring-amber-200 focus:ring-2'
          />
        </div>

        {isLoading ? (
          <p className='text-sm text-stone-600'>{t.loading}</p>
        ) : isError ? (
          <p className='text-sm text-red-700'>{t.loadErr}</p>
        ) : filtered.length === 0 ? (
          <p className='text-sm text-stone-600'>{tab === 'pending' ? t.emptyPending : t.emptyAll}</p>
        ) : (
          <div className='admin-table is-striped'>
            <div className='admin-table__row border-b border-stone-200 pb-2 font-medium text-stone-600'>
              <div className='admin-table__meta flex-1 flex-wrap gap-4'>
                <span className='min-w-[7rem]'>{t.colTicket}</span>
                <span className='min-w-[8rem]'>{t.colShop}</span>
                <span className='min-w-[6rem]'>{t.colAmount}</span>
                <span className='min-w-[5rem]'>{t.colStatus}</span>
                <span className='min-w-[8rem]'>{t.colRequested}</span>
                <span className='min-w-[10rem] flex-1'>{t.colNote}</span>
              </div>
              <span className='shrink-0 text-right text-stone-600'>{t.colActions}</span>
            </div>
            {filtered.map((row) => {
              const pending = String(row.status).toUpperCase() === 'PENDING'
              const approvingThis = approveMut.isPending && approveMut.variables === row.id
              return (
                <div key={row.id} className='admin-table__row items-start'>
                  <div className='admin-table__meta min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'>
                    <strong className='min-w-[7rem] font-mono text-sm text-stone-900'>{row.id}</strong>
                    <span className='min-w-[8rem] text-sm text-stone-800'>{row.shopName}</span>
                    <span className='min-w-[6rem] text-sm font-semibold text-stone-900'>{fmtVnd(row.amountVnd)}</span>
                    <span className={statusChip(String(row.status))}>{String(row.status)}</span>
                    <span className='min-w-[8rem] text-sm text-stone-600'>{fmtDate(row.requestedAt, locale)}</span>
                    <p className='min-w-0 max-w-md flex-1 text-sm text-stone-600'>{row.sellerNote?.trim() || '—'}</p>
                  </div>
                  <div className='flex shrink-0 flex-col gap-2 sm:flex-row'>
                    {pending ? (
                      <>
                        <button
                          type='button'
                          className='admin-btn primary whitespace-nowrap px-3 py-1.5 text-sm'
                          disabled={mutating}
                          onClick={() => approveMut.mutate(row.id)}
                        >
                          {approvingThis ? t.loading : t.approve}
                        </button>
                        <button
                          type='button'
                          className='admin-btn outline whitespace-nowrap px-3 py-1.5 text-sm'
                          disabled={mutating}
                          onClick={() => {
                            setRejectFor(row)
                            setRejectNote('')
                          }}
                        >
                          {t.reject}
                        </button>
                      </>
                    ) : (
                      <span className='text-xs text-stone-400'>—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {rejectFor ? (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='finance-reject-title'
          onClick={() => {
            if (!rejectMut.isPending) {
              setRejectFor(null)
              setRejectNote('')
            }
          }}
        >
          <div
            className='w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id='finance-reject-title' className='text-lg font-semibold text-stone-900'>
              {t.rejectTitle}
            </h4>
            <p className='mt-1 font-mono text-sm text-stone-600'>{rejectFor.id}</p>
            <p className='mt-4 text-sm text-stone-600'>{t.rejectHint}</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className='mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none ring-amber-200 focus:ring-2'
            />
            <div className='mt-6 flex justify-end gap-2'>
              <button
                type='button'
                className='admin-btn ghost'
                onClick={() => {
                  setRejectFor(null)
                  setRejectNote('')
                }}
              >
                {t.rejectCancel}
              </button>
              <button
                type='button'
                className='admin-btn primary'
                disabled={rejectMut.isPending}
                onClick={() => rejectMut.mutate({ id: rejectFor.id, note: rejectNote.trim() || undefined })}
              >
                {rejectMut.isPending ? t.loading : t.rejectSubmit}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
