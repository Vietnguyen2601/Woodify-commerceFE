import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { APP_CONFIG } from '@/constants'
import { adminService, financeWithdrawalService, queryKeys } from '@/services'
import type { SellerWithdrawalTicket } from '@/types'

const fmtVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string | undefined | null, locale: string) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const statusBadgeClass = (status: string) => {
  const u = status.toUpperCase()
  if (u === 'PENDING') return 'admin-chip warning border-amber-200 bg-amber-50 text-amber-900'
  if (u === 'APPROVED') return 'admin-chip success border-emerald-200 bg-emerald-50 text-emerald-900'
  if (u === 'REJECTED') return 'admin-chip danger border-rose-200 bg-rose-50 text-rose-900'
  if (u === 'PAID') return 'admin-chip info border-sky-200 bg-sky-50 text-sky-900'
  return 'admin-chip neutral border-stone-200 bg-stone-50 text-stone-700'
}

type StatusFilter = 'all' | 'Pending' | 'Approved' | 'Rejected' | 'Paid'

type ReviewModal =
  | { mode: 'approve'; ticket: SellerWithdrawalTicket }
  | { mode: 'reject'; ticket: SellerWithdrawalTicket }
  | { mode: 'mark-paid'; ticket: SellerWithdrawalTicket }
  | null

const PAGE_SIZE = 9

export default function AdminFinance() {
  const { isVietnamese } = useAppLanguage()
  const { user } = useAuth()
  const adminAccountId = user?.accountId?.trim() ?? ''
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [reviewModal, setReviewModal] = React.useState<ReviewModal>(null)
  const [reviewNote, setReviewNote] = React.useState('')
  const [actionError, setActionError] = React.useState<string | null>(null)

  const apiStatus = statusFilter === 'all' ? undefined : statusFilter

  const t = React.useMemo(
    () => ({
      eyebrow: isVietnamese ? 'Tài chính' : 'Finance',
      title: isVietnamese ? 'Duyệt rút tiền seller' : 'Seller withdrawal review',
      subtitle: isVietnamese
        ? 'Ticket rút tiền từ ví seller (sau khi đơn hoàn tất). Duyệt sẽ trừ ví ngay; “Đã CK” chỉ ghi nhận chuyển khoản thủ công.'
        : 'Withdrawal tickets from the seller wallet. Approve debits the wallet immediately; “Mark paid” records the bank transfer.',
      refresh: isVietnamese ? 'Làm mới' : 'Refresh',
      panelTitle: isVietnamese ? 'Phiếu rút tiền' : 'Withdrawal tickets',
      filterAll: isVietnamese ? 'Tất cả' : 'All',
      filterPending: isVietnamese ? 'Chờ duyệt' : 'Pending',
      filterApproved: isVietnamese ? 'Đã duyệt' : 'Approved',
      filterRejected: isVietnamese ? 'Từ chối' : 'Rejected',
      filterPaid: isVietnamese ? 'Đã CK' : 'Paid',
      searchPh: isVietnamese ? 'Lọc theo mã ticket, shop, chủ TK…' : 'Filter by ticket, shop, account holder…',
      searchHint: isVietnamese ? 'Áp dụng trên trang hiện tại.' : 'Applied to the current page only.',
      colAmount: isVietnamese ? 'Số tiền' : 'Amount',
      approve: isVietnamese ? 'Duyệt' : 'Approve',
      reject: isVietnamese ? 'Từ chối' : 'Reject',
      markPaid: isVietnamese ? 'Đánh dấu đã CK' : 'Mark paid',
      loading: isVietnamese ? 'Đang tải…' : 'Loading…',
      loadErr: isVietnamese ? 'Không tải được danh sách.' : 'Failed to load list.',
      empty: isVietnamese ? 'Không có ticket trong bộ lọc này.' : 'No tickets for this filter.',
      close: isVietnamese ? 'Đóng' : 'Close',
      submit: isVietnamese ? 'Xác nhận' : 'Confirm',
      noteLabel: isVietnamese ? 'Ghi chú admin (tùy chọn)' : 'Admin note (optional)',
      approveTitle: isVietnamese ? 'Duyệt rút tiền' : 'Approve withdrawal',
      rejectTitle: isVietnamese ? 'Từ chối yêu cầu' : 'Reject withdrawal',
      markPaidTitle: isVietnamese ? 'Đã chuyển khoản' : 'Mark as paid',
      markPaidHint: isVietnamese
        ? 'Chỉ ghi nhận đã chuyển tiền; ví đã trừ khi duyệt.'
        : 'Records the transfer only; the wallet was debited on approve.',
      needAdminId: isVietnamese
        ? 'Thiếu accountId admin trong phiên đăng nhập — không thể gọi API duyệt (cần adminAccountId).'
        : 'Missing admin accountId in session — approval API requires adminAccountId.',
      bank: isVietnamese ? 'Ngân hàng' : 'Bank',
      accountNo: isVietnamese ? 'Số TK' : 'Account no.',
      holder: isVietnamese ? 'Chủ TK' : 'Account holder',
      seller: isVietnamese ? 'Seller' : 'Seller',
      shop: isVietnamese ? 'Cửa hàng' : 'Shop',
      requested: isVietnamese ? 'Tạo lúc' : 'Created',
      reviewed: isVietnamese ? 'Duyệt lúc' : 'Reviewed',
      paidAt: isVietnamese ? 'CK lúc' : 'Paid at',
      adminNote: isVietnamese ? 'Ghi chú' : 'Note',
      page: isVietnamese ? 'Trang' : 'Page',
      prev: isVietnamese ? 'Trước' : 'Prev',
      next: isVietnamese ? 'Sau' : 'Next',
      ticketId: isVietnamese ? 'Mã phiếu' : 'Ticket',
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
    data: listResult,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.admin.withdrawalTickets({ status: apiStatus, page, pageSize: PAGE_SIZE }),
    queryFn: () => financeWithdrawalService.listWithdrawals({ status: apiStatus, page, pageSize: PAGE_SIZE }),
    staleTime: 30 * 1000,
  })

  const merged = React.useMemo(() => {
    const items = listResult?.items ?? []
    return items.map((row) => ({
      ...row,
      shopName: row.shopName?.trim() || shopName(row.shopId),
    }))
  }, [listResult?.items, shopName])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return merged
    return merged.filter((x) => {
      const blob = [
        x.id,
        x.shopId,
        x.shopName,
        x.sellerAccountId,
        x.bankAccountHolder,
        x.bankAccountNumber,
        x.adminNote,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [merged, search])

  React.useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const approveMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      financeWithdrawalService.approveTicket(id, { adminAccountId, note: note || null }),
    onSuccess: async () => {
      setActionError(null)
      setReviewModal(null)
      setReviewNote('')
      await queryClient.invalidateQueries({ queryKey: [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'withdrawal-tickets'] })
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? String(e)
      setActionError(msg)
    },
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      financeWithdrawalService.rejectTicket(id, { adminAccountId, note: note || null }),
    onSuccess: async () => {
      setActionError(null)
      setReviewModal(null)
      setReviewNote('')
      await queryClient.invalidateQueries({ queryKey: [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'withdrawal-tickets'] })
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? String(e)
      setActionError(msg)
    },
  })

  const markPaidMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      financeWithdrawalService.markPaidTicket(id, { adminAccountId, note: note || null }),
    onSuccess: async () => {
      setActionError(null)
      setReviewModal(null)
      setReviewNote('')
      await queryClient.invalidateQueries({ queryKey: [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'withdrawal-tickets'] })
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? String(e)
      setActionError(msg)
    },
  })

  const mutating = approveMut.isPending || rejectMut.isPending || markPaidMut.isPending

  const locale = isVietnamese ? 'vi-VN' : 'en-US'
  const totalCount = listResult?.totalCount ?? 0
  const computedPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1
  const totalPages = Math.max(1, listResult?.totalPages ?? computedPages)

  const openReview = (mode: 'approve' | 'reject' | 'mark-paid', ticket: SellerWithdrawalTicket) => {
    setActionError(null)
    setReviewNote('')
    setReviewModal({ mode, ticket })
  }

  const submitReview = () => {
    if (!reviewModal || !adminAccountId) return
    const note = reviewNote.trim()
    const id = reviewModal.ticket.id
    if (reviewModal.mode === 'approve') approveMut.mutate({ id, note })
    else if (reviewModal.mode === 'reject') rejectMut.mutate({ id, note })
    else markPaidMut.mutate({ id, note })
  }

  const sessionWarning = !adminAccountId ? t.needAdminId : null
  const alertMessage = actionError ?? sessionWarning

  const filterBtn = (key: StatusFilter, label: string) => (
    <button
      type='button'
      key={key}
      className={[
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
        statusFilter === key ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200' : 'text-stone-600 hover:text-stone-900',
      ].join(' ')}
      onClick={() => setStatusFilter(key)}
    >
      {label}
    </button>
  )

  return (
    <div className='admin-view min-w-0 max-w-full'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <span>{t.subtitle}</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn primary' onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? t.loading : t.refresh}
          </button>
        </div>
      </header>

      <section className='admin-panel min-w-0 max-w-full'>
        <header className='admin-panel__header'>
          <div>
            <h3>{t.panelTitle}</h3>
            <p className='text-sm text-stone-500'>{t.panelHint}</p>
          </div>
        </header>

        {alertMessage ? (
          <p
            className={
              actionError
                ? 'mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'
                : 'mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'
            }
            role={actionError ? 'alert' : 'status'}
          >
            {alertMessage}
          </p>
        ) : null}

        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
          <div className='inline-flex max-w-full flex-wrap gap-1 rounded-full border border-stone-200 bg-stone-50 p-1'>
            {filterBtn('all', t.filterAll)}
            {filterBtn('Pending', t.filterPending)}
            {filterBtn('Approved', t.filterApproved)}
            {filterBtn('Rejected', t.filterRejected)}
            {filterBtn('Paid', t.filterPaid)}
          </div>
          <div className='flex min-w-[200px] flex-1 flex-col gap-1 sm:max-w-md'>
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPh}
              className='w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-800 outline-none ring-amber-200 focus:ring-2'
            />
            <span className='text-xs text-stone-400'>{t.searchHint}</span>
          </div>
        </div>

        {isLoading ? (
          <p className='text-sm text-stone-600'>{t.loading}</p>
        ) : isError ? (
          <p className='text-sm text-red-700'>{t.loadErr}</p>
        ) : filtered.length === 0 ? (
          <p className='text-sm text-stone-600'>{t.empty}</p>
        ) : (
          <>
            <div className='grid w-full min-w-0 grid-cols-1 gap-4'>
              {filtered.map((row) => {
                const st = String(row.status).toUpperCase()
                const pending = st === 'PENDING'
                const approved = st === 'APPROVED'
                return (
                  <article
                    key={row.id}
                    className='group relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white via-white to-amber-50/40 shadow-[0_20px_40px_-28px_rgba(17,24,39,0.4)] ring-1 ring-amber-900/[0.04] lg:flex-row lg:items-stretch'
                  >
                    <div
                      className='pointer-events-none absolute inset-x-0 top-0 h-2 opacity-[0.35] lg:hidden'
                      style={{
                        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(180, 83, 9, 0.12) 6px, rgba(180, 83, 9, 0.12) 8px)`,
                      }}
                    />
                    <div className='hidden w-1.5 shrink-0 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-800 lg:block' aria-hidden />

                    <div className='relative flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:gap-6'>
                      {/* Cột chính: mã + meta — chiếm phần ngang lớn, ít dòng */}
                      <div className='flex min-w-0 flex-1 flex-col gap-3'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <div className='min-w-0 flex-1'>
                            <p className='text-[10px] font-semibold uppercase tracking-wider text-amber-800/80'>{t.ticketId}</p>
                            <p className='break-all font-mono text-[11px] leading-snug text-stone-600 sm:text-xs'>{row.id}</p>
                          </div>
                          <div className='flex shrink-0 flex-wrap items-center gap-2 sm:gap-3'>
                            <div>
                              <p className='text-xl font-bold leading-none tracking-tight text-stone-900 sm:text-2xl'>
                                {fmtVnd(row.amountVnd)}
                              </p>
                              <p className='mt-0.5 text-[10px] text-stone-500 sm:text-xs'>{t.colAmount}</p>
                            </div>
                            <span className={statusBadgeClass(st)}>{String(row.status)}</span>
                          </div>
                        </div>

                        <dl className='grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-stone-600 sm:grid-cols-2 lg:grid-cols-3'>
                          <div className='flex min-w-0 flex-col gap-0.5'>
                            <dt className='text-stone-500'>{t.shop}</dt>
                            <dd className='break-all font-medium text-stone-800'>{row.shopName}</dd>
                          </div>
                          <div className='flex min-w-0 flex-col gap-0.5'>
                            <dt className='text-stone-500'>{t.seller}</dt>
                            <dd className='break-all font-mono text-stone-700'>{row.sellerAccountId || '—'}</dd>
                          </div>
                          <div className='flex min-w-0 flex-col gap-0.5'>
                            <dt className='text-stone-500'>{t.requested}</dt>
                            <dd>{fmtDate(row.requestedAt, locale)}</dd>
                          </div>
                          {row.reviewedAt ? (
                            <div className='flex min-w-0 flex-col gap-0.5'>
                              <dt className='text-stone-500'>{t.reviewed}</dt>
                              <dd>{fmtDate(row.reviewedAt, locale)}</dd>
                            </div>
                          ) : null}
                          {row.paidAt ? (
                            <div className='flex min-w-0 flex-col gap-0.5'>
                              <dt className='text-stone-500'>{t.paidAt}</dt>
                              <dd>{fmtDate(row.paidAt, locale)}</dd>
                            </div>
                          ) : null}
                          {row.adminNote ? (
                            <div className='min-w-0 border-t border-stone-100 pt-2 sm:col-span-2 lg:col-span-3'>
                              <dt className='text-stone-500'>{t.adminNote}</dt>
                              <dd className='mt-0.5 text-stone-800'>{row.adminNote}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>

                      {/* Ngân hàng: cố định min-width để dùng chiều ngang, không bóp cột */}
                      <div className='w-full shrink-0 lg:w-[min(100%,22rem)] xl:w-[min(100%,26rem)]'>
                        <div className='grid h-full grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-xl border border-dashed border-amber-200/80 bg-white/70 px-3 py-2.5 text-sm'>
                          <span className='text-stone-500'>{t.bank}</span>
                          <span className='min-w-0 font-medium text-stone-900'>{row.bankName?.trim() || '—'}</span>
                          <span className='text-stone-500'>{t.accountNo}</span>
                          <span className='min-w-0 break-all font-mono text-stone-800'>{row.bankAccountNumber?.trim() || '—'}</span>
                          <span className='text-stone-500'>{t.holder}</span>
                          <span className='min-w-0 font-medium leading-snug text-stone-900'>{row.bankAccountHolder?.trim() || '—'}</span>
                        </div>
                      </div>

                      {/* Thao tác: cột hẹp bên phải */}
                      <div className='flex shrink-0 flex-row flex-wrap gap-2 border-t border-stone-100 pt-3 lg:w-44 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0'>
                        {pending ? (
                          <>
                            <button
                              type='button'
                              className='admin-btn primary w-full min-w-[7rem] px-3 py-1.5 text-sm lg:w-full'
                              disabled={mutating}
                              onClick={() => {
                                if (!adminAccountId) return
                                openReview('approve', row)
                              }}
                            >
                              {t.approve}
                            </button>
                            <button
                              type='button'
                              className='admin-btn outline w-full min-w-[7rem] px-3 py-1.5 text-sm lg:w-full'
                              disabled={mutating}
                              onClick={() => {
                                if (!adminAccountId) return
                                openReview('reject', row)
                              }}
                            >
                              {t.reject}
                            </button>
                          </>
                        ) : null}
                        {approved ? (
                          <button
                            type='button'
                            className='admin-btn primary w-full px-3 py-1.5 text-sm lg:w-full'
                            disabled={mutating}
                            onClick={() => {
                              if (!adminAccountId) return
                              openReview('mark-paid', row)
                            }}
                          >
                            {t.markPaid}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {totalCount > PAGE_SIZE || totalPages > 1 ? (
              <div className='mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-6 text-sm text-stone-600'>
                <span>
                  {t.page} {page} / {totalPages}
                  <span className='text-stone-400'> · {totalCount}</span>
                </span>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    className='admin-btn outline px-3 py-1.5 text-sm'
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t.prev}
                  </button>
                  <button
                    type='button'
                    className='admin-btn outline px-3 py-1.5 text-sm'
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      {reviewModal ? (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='finance-review-title'
          onClick={() => {
            if (!mutating) {
              setReviewModal(null)
              setReviewNote('')
            }
          }}
        >
          <div
            className='w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id='finance-review-title' className='text-lg font-semibold text-stone-900'>
              {reviewModal.mode === 'approve'
                ? t.approveTitle
                : reviewModal.mode === 'reject'
                  ? t.rejectTitle
                  : t.markPaidTitle}
            </h4>
            <p className='mt-1 font-mono text-xs text-stone-500'>{reviewModal.ticket.id}</p>
            {reviewModal.mode === 'mark-paid' ? (
              <p className='mt-3 text-sm text-stone-600'>{t.markPaidHint}</p>
            ) : null}
            <label className='mt-4 block text-sm font-medium text-stone-700' htmlFor='finance-review-note'>
              {t.noteLabel}
            </label>
            <textarea
              id='finance-review-note'
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
              className='mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none ring-amber-200 focus:ring-2'
            />
            <div className='mt-6 flex justify-end gap-2'>
              <button
                type='button'
                className='admin-btn ghost'
                disabled={mutating}
                onClick={() => {
                  setReviewModal(null)
                  setReviewNote('')
                }}
              >
                {t.close}
              </button>
              <button
                type='button'
                className={
                  reviewModal.mode === 'reject' ? 'admin-btn outline' : 'admin-btn primary'
                }
                disabled={mutating || !adminAccountId}
                onClick={() => submitReview()}
              >
                {mutating ? t.loading : t.submit}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
