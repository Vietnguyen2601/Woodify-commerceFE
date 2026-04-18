import React from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FinanceTopBar from './components/FinanceTopBar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useShopStore } from '@/store/shopStore'
import { APP_CONFIG } from '@/constants'
import { queryKeys, shopService, walletService } from '@/services'
import type { SellerWalletTxItem } from '@/services/wallet.service'

const MIN_WITHDRAW_VND = 50_000
const TX_PAGE_SIZE = 10

const REVENUE_ALERT = {
  title: 'Mẹo tăng doanh thu',
  message: 'Kích hoạt quảng cáo cho sản phẩm bán chạy nhất của bạn để tiếp cận thêm 50% khách hàng tiềm năng!',
}

const OVERVIEW_PAID = {
  weekly: '23.450.000 ₫',
  monthly: '89.230.000 ₫',
  total: '456.780.000 ₫',
}

const REPORTS = [
  {
    label: 'Tuần 4 - Tháng 01/2026',
    range: '20/01/2026 - 26/01/2026',
    amount: '23.450.000 ₫',
  },
  {
    label: 'Tuần 3 - Tháng 01/2026',
    range: '13/01/2026 - 19/01/2026',
    amount: '31.280.000 ₫',
  },
  {
    label: 'Tuần 2 - Tháng 01/2026',
    range: '06/01/2026 - 12/01/2026',
    amount: '28.900.000 ₫',
  },
]

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'S'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const fmtVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const fmtDt = (iso: string | undefined | null) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const refLabel = (t: SellerWalletTxItem) => {
  const r = (t.referenceType ?? '').trim()
  if (r) return r
  if (t.relatedOrderId) return 'Đơn hàng'
  return '—'
}

export default function Revenue() {
  const { user } = useAuth()
  const accountId = user?.accountId?.trim() ?? ''
  const shop = useShopStore((s) => s.shop)
  const shopId = shop?.shopId?.trim() ?? ''
  const queryClient = useQueryClient()

  const [txPage, setTxPage] = React.useState(1)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [withdrawAmount, setWithdrawAmount] = React.useState('')
  const [withdrawMsg, setWithdrawMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const {
    data: wallet,
    isLoading: walletLoading,
    isError: walletError,
    error: walletErrObj,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: queryKeys.seller.wallet(accountId),
    queryFn: () => walletService.getSellerWalletByAccountId(accountId),
    enabled: !!accountId,
  })

  const {
    data: txPageData,
    isLoading: txLoading,
    isError: txError,
    refetch: refetchTx,
  } = useQuery({
    queryKey: queryKeys.seller.walletTransactions(accountId, txPage, TX_PAGE_SIZE),
    queryFn: () =>
      walletService.getSellerWalletTransactions(accountId, { page: txPage, pageSize: TX_PAGE_SIZE }),
    enabled: !!accountId,
  })

  const { data: bankData } = useQuery({
    queryKey: queryKeys.seller.bankAccount(shopId),
    queryFn: () => shopService.getBankAccount(shopId),
    enabled: !!shopId,
  })

  const balance = wallet?.balance ?? 0
  const walletErrText =
    walletErrObj && typeof walletErrObj === 'object' && 'message' in walletErrObj
      ? String((walletErrObj as { message: string }).message)
      : 'Không tải được ví.'

  const withdrawMut = useMutation({
    mutationFn: walletService.createSellerWithdrawal,
    onSuccess: async () => {
      setWithdrawMsg({ type: 'ok', text: 'Đã gửi yêu cầu rút tiền. Vui lòng chờ admin duyệt.' })
      setWithdrawAmount('')
      setWithdrawOpen(false)
      await queryClient.invalidateQueries({ queryKey: [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD] })
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Không thể gửi yêu cầu.'
      setWithdrawMsg({ type: 'err', text: msg })
    },
  })

  const openWithdraw = () => {
    setWithdrawMsg(null)
    setWithdrawAmount('')
    setWithdrawOpen(true)
  }

  const submitWithdraw = () => {
    setWithdrawMsg(null)
    if (!accountId || !shopId) {
      setWithdrawMsg({ type: 'err', text: 'Thiếu thông tin tài khoản hoặc shop.' })
      return
    }
    const bankName = bankData?.bankName?.trim() ?? ''
    const bankAccountNumber = bankData?.bankAccountNumber?.trim() ?? ''
    const bankAccountHolder = bankData?.bankAccountName?.trim() ?? ''
    if (!bankName || !bankAccountNumber || !bankAccountHolder) {
      setWithdrawMsg({
        type: 'err',
        text: 'Vui lòng cập nhật tài khoản ngân hàng trước khi rút tiền.',
      })
      return
    }
    const raw = withdrawAmount.replace(/\D/g, '')
    const amountVnd = raw ? Number.parseInt(raw, 10) : 0
    if (!Number.isFinite(amountVnd) || amountVnd < MIN_WITHDRAW_VND) {
      setWithdrawMsg({ type: 'err', text: `Số tiền tối thiểu ${fmtVnd(MIN_WITHDRAW_VND)}.` })
      return
    }
    if (amountVnd > balance) {
      setWithdrawMsg({ type: 'err', text: 'Số tiền vượt quá số dư ví.' })
      return
    }
    withdrawMut.mutate({
      sellerAccountId: accountId,
      shopId,
      amountVnd,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
    })
  }

  const txItems = txPageData?.items ?? []
  const txTotalPages = Math.max(1, txPageData?.totalPages ?? 1)

  React.useEffect(() => {
    setTxPage(1)
  }, [accountId])

  return (
    <div className='space-y-6'>
      <FinanceTopBar
        statusLabel={shop?.status ?? 'ACTIVE'}
        storeName={shop?.name}
        initials={shop?.name ? initialsFromName(shop.name) : 'WC'}
      />

      <section className='space-y-2'>
        <h1 className='text-xl font-bold text-stone-900'>Doanh thu</h1>
        <p className='text-xs text-stone-500'>Theo dõi doanh thu và các khoản thanh toán của shop</p>
      </section>

      <section className='rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900'>
        <p className='font-semibold'>💡 {REVENUE_ALERT.title}:</p>
        <p>{REVENUE_ALERT.message}</p>
      </section>

      {!accountId ? (
        <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
          Không tìm thấy accountId. Vui lòng đăng nhập lại.
        </div>
      ) : null}

      {withdrawMsg && !withdrawOpen ? (
        <div
          role='status'
          className={`rounded-2xl border px-4 py-3 text-sm ${
            withdrawMsg.type === 'ok'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {withdrawMsg.text}
        </div>
      ) : null}

      <section className='space-y-5 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
        <div className='rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-900'>
          Số liệu chưa bao gồm các điều chỉnh phí, hoàn tiền và các khoản khấu trừ khác. Vui lòng xem chi tiết trong từng
          giao dịch.
        </div>
        <div className='grid gap-5 md:grid-cols-2'>
          <article className='flex flex-col rounded-2xl border border-orange-200 bg-orange-50/60 p-5'>
            <p className='text-sm font-semibold text-orange-900'>Ví của shop</p>
            {walletLoading ? (
              <p className='mt-3 text-2xl font-bold text-orange-600/50'>Đang tải…</p>
            ) : walletError ? (
              <p className='mt-3 text-sm text-red-700'>{walletErrText}</p>
            ) : (
              <p className='mt-3 text-2xl font-bold text-orange-600'>{fmtVnd(balance)}</p>
            )}
            <p className='mt-1 text-xs text-stone-500'>
              {wallet
                ? `${wallet.currency} · ${wallet.status}${wallet.updatedAt ? ` · Cập nhật ${fmtDt(wallet.updatedAt)}` : ''}`
                : 'Cùng ví dùng cho mua hàng và doanh thu shop'}
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <button
                type='button'
                disabled={!accountId || walletLoading || !!walletError}
                onClick={openWithdraw}
                className='inline-flex w-fit items-center justify-center rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Rút tiền
              </button>
              <button
                type='button'
                onClick={() => {
                  void refetchWallet()
                  void refetchTx()
                }}
                className='inline-flex w-fit items-center justify-center rounded-2xl border border-amber-900/30 bg-white px-4 py-2 text-xs font-semibold text-amber-900'
              >
                Làm mới ví
              </button>
              <Link
                to='/seller/finance/bank'
                className='inline-flex w-fit items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-800'
              >
                TK ngân hàng
              </Link>
            </div>
          </article>
          <article className='space-y-3 rounded-2xl border border-green-200 bg-green-50/60 p-5 text-sm text-stone-600'>
            <div>
              <p>Doanh thu tuần này</p>
              <p className='text-lg font-semibold text-green-700'>{OVERVIEW_PAID.weekly}</p>
            </div>
            <div>
              <p>Doanh thu tháng này</p>
              <p className='text-lg font-semibold text-green-700'>{OVERVIEW_PAID.monthly}</p>
            </div>
            <div className='border-t border-green-200 pt-3'>
              <p>Tổng doanh thu đã thanh toán</p>
              <p className='text-xl font-bold text-green-600'>{OVERVIEW_PAID.total}</p>
            </div>
          </article>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
        <div>
          <h3 className='text-base font-semibold text-stone-900'>Báo cáo doanh thu</h3>
          <p className='text-xs text-stone-500'>Tải xuống báo cáo chi tiết theo tuần/tháng</p>
        </div>
        <div className='space-y-3'>
          {REPORTS.map((report) => (
            <article key={report.label} className='flex flex-wrap items-center gap-4 rounded-2xl border border-amber-900/20 p-4'>
              <div>
                <p className='text-sm font-semibold text-stone-900'>{report.label}</p>
                <p className='text-xs text-stone-500'>{report.range}</p>
              </div>
              <div className='ml-auto flex items-center gap-3'>
                <span className='text-sm font-bold text-stone-900'>{report.amount}</span>
                <span className='rounded-full bg-amber-900 px-3 py-1 text-[11px] font-semibold text-white'>Có sẵn</span>
                <button
                  type='button'
                  className='rounded-xl border border-amber-900/20 bg-stone-100 px-4 py-1.5 text-xs font-medium text-stone-900'
                >
                  Tải xuống
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
        <div>
          <h3 className='text-base font-semibold text-stone-900'>Lịch sử ví</h3>
          <p className='text-xs text-stone-500'>Ghi có / ghi nợ theo đơn hàng và rút tiền</p>
        </div>
        {!accountId ? (
          <p className='text-sm text-stone-500'>Đăng nhập để xem giao dịch.</p>
        ) : txLoading ? (
          <p className='text-sm text-stone-600'>Đang tải giao dịch…</p>
        ) : txError ? (
          <p className='text-sm text-red-700'>Không tải được lịch sử ví.</p>
        ) : txItems.length === 0 ? (
          <p className='text-sm text-stone-500'>Chưa có giao dịch.</p>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='min-w-full text-left text-xs text-stone-600'>
                <thead>
                  <tr className='border-b border-amber-900/20 text-stone-900'>
                    <th className='pb-3 pr-4 font-semibold'>Thời gian</th>
                    <th className='pb-3 pr-4 font-semibold'>Loại</th>
                    <th className='pb-3 pr-4 font-semibold'>Tham chiếu</th>
                    <th className='pb-3 pr-4 font-semibold'>Chi tiết</th>
                    <th className='pb-3 pr-4 text-right font-semibold'>Số tiền</th>
                    <th className='pb-3 text-right font-semibold'>Số dư sau</th>
                  </tr>
                </thead>
                <tbody>
                  {txItems.map((tx) => {
                    const credit = String(tx.transactionType).toLowerCase() === 'credit'
                    return (
                      <tr key={tx.transactionId} className='border-b border-amber-900/10 last:border-0'>
                        <td className='py-3 pr-4 whitespace-nowrap'>{fmtDt(tx.createdAt)}</td>
                        <td className='py-3 pr-4'>
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                              credit ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className='py-3 pr-4 font-mono text-[11px]'>{refLabel(tx)}</td>
                        <td className='max-w-[12rem] truncate py-3 pr-4' title={tx.note ?? tx.relatedOrderId ?? ''}>
                          {tx.relatedOrderId ? tx.relatedOrderId.slice(0, 8) + '…' : ''}
                          {tx.note ? (tx.relatedOrderId ? ' · ' : '') + tx.note : !tx.relatedOrderId ? '—' : ''}
                        </td>
                        <td className={`py-3 pr-4 text-right font-bold ${credit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {credit ? '+' : '−'}
                          {fmtVnd(Math.abs(tx.amount))}
                        </td>
                        <td className='py-3 text-right font-medium text-stone-800'>{fmtVnd(tx.balanceAfter)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {txTotalPages > 1 ? (
              <div className='flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600'>
                <span>
                  Trang {txPage} / {txTotalPages} ({txPageData?.totalCount ?? 0} giao dịch)
                </span>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    disabled={txPage <= 1}
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    className='rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40'
                  >
                    Trước
                  </button>
                  <button
                    type='button'
                    disabled={txPage >= txTotalPages}
                    onClick={() => setTxPage((p) => p + 1)}
                    className='rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40'
                  >
                    Sau
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      {withdrawOpen ? (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='withdraw-title'
          onClick={() => !withdrawMut.isPending && setWithdrawOpen(false)}
        >
          <div
            className='w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id='withdraw-title' className='text-lg font-semibold text-stone-900'>
              Rút tiền về ngân hàng
            </h4>
            <p className='mt-1 text-xs text-stone-500'>
              Số dư khả dụng: <strong className='text-stone-800'>{fmtVnd(balance)}</strong>. Tối thiểu {fmtVnd(MIN_WITHDRAW_VND)}.
              Tiền sẽ chuyển theo{' '}
              <Link to='/seller/finance/bank' className='font-medium text-amber-800 underline'>
                TK đã lưu
              </Link>
              .
            </p>
            {withdrawMsg && withdrawOpen ? (
              <p
                className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
                  withdrawMsg.type === 'ok'
                    ? 'border-green-200 bg-green-50 text-green-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                {withdrawMsg.text}
              </p>
            ) : null}
            <label className='mt-4 block text-sm font-medium text-stone-700' htmlFor='withdraw-amt'>
              Số tiền (VND)
            </label>
            <input
              id='withdraw-amt'
              inputMode='numeric'
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder='VD: 500000'
              className='mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none ring-amber-200 focus:ring-2'
            />
            <div className='mt-6 flex justify-end gap-2'>
              <button
                type='button'
                className='rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-800'
                disabled={withdrawMut.isPending}
                onClick={() => {
                  setWithdrawOpen(false)
                  setWithdrawMsg(null)
                }}
              >
                Hủy
              </button>
              <button
                type='button'
                className='rounded-xl bg-amber-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50'
                disabled={withdrawMut.isPending}
                onClick={() => submitWithdraw()}
              >
                {withdrawMut.isPending ? 'Đang gửi…' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
