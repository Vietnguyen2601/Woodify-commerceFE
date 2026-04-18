import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FinanceTopBar from './components/FinanceTopBar'
import { queryKeys, shopService } from '@/services'
import { useShopStore } from '@/store/shopStore'
import type { ShopBankAccount } from '@/types'

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'S'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function BankAccount() {
  const queryClient = useQueryClient()
  const shop = useShopStore((s) => s.shop)
  const shopId = shop?.shopId ?? ''

  const [bankName, setBankName] = React.useState('')
  const [bankAccountNumber, setBankAccountNumber] = React.useState('')
  const [bankAccountName, setBankAccountName] = React.useState('')
  const [banner, setBanner] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.seller.bankAccount(shopId),
    queryFn: () => shopService.getBankAccount(shopId),
    enabled: !!shopId,
  })

  React.useEffect(() => {
    if (!data) {
      setBankName('')
      setBankAccountNumber('')
      setBankAccountName('')
      return
    }
    setBankName(data.bankName ?? '')
    setBankAccountNumber(data.bankAccountNumber ?? '')
    setBankAccountName(data.bankAccountName ?? '')
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (payload: ShopBankAccount) => shopService.updateBankAccount(shopId, payload),
    onSuccess: () => {
      setBanner({ type: 'ok', text: 'Đã cập nhật tài khoản ngân hàng.' })
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.bankAccount(shopId) })
    },
    onError: (e: unknown) => {
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message: string }).message)
          : 'Không thể cập nhật. Vui lòng thử lại.'
      setBanner({ type: 'err', text: msg })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBanner(null)
    const trimmed: ShopBankAccount = {
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountName: bankAccountName.trim(),
    }
    if (!trimmed.bankName || !trimmed.bankAccountNumber || !trimmed.bankAccountName) {
      setBanner({ type: 'err', text: 'Vui lòng điền đủ tên ngân hàng, số tài khoản và tên chủ tài khoản.' })
      return
    }
    updateMutation.mutate(trimmed)
  }

  const errMessage =
    isError && error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Không tải được thông tin tài khoản ngân hàng.'

  if (!shopId) {
    return (
      <div className='rounded-2xl border border-amber-900/20 bg-white p-6 text-sm text-stone-600'>
        Không tìm thấy shop. Vui lòng đăng nhập lại hoặc hoàn tất đăng ký shop.
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <FinanceTopBar
        statusLabel={shop?.status ?? 'ACTIVE'}
        storeName={shop?.name}
        initials={shop?.name ? initialsFromName(shop.name) : 'WC'}
      />

      <div>
        <h1 className='text-xl font-bold text-stone-900'>Tài khoản ngân hàng</h1>
        <p className='text-xs text-stone-600'>Thông tin nhận thanh toán cho shop của bạn</p>
      </div>

      {banner && (
        <div
          role='status'
          className={`rounded-2xl border px-4 py-3 text-sm ${
            banner.type === 'ok'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {banner.text}
        </div>
      )}

      <section className='rounded-3xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900'>
        <p className='font-semibold'>Lưu ý về tài khoản ngân hàng</p>
        <ul className='mt-2 list-disc pl-4 text-[11px] text-blue-800'>
          <li>Tài khoản ngân hàng phải đứng tên chủ shop hoặc người được ủy quyền.</li>
          <li>Thông tin tài khoản sẽ được bảo mật và chỉ dùng cho mục đích thanh toán.</li>
        </ul>
      </section>

      {isLoading ? (
        <div className='rounded-3xl border border-stone-200 bg-white p-8 text-sm text-stone-500'>Đang tải…</div>
      ) : isError ? (
        <div className='space-y-3 rounded-3xl border border-rose-200 bg-white p-6'>
          <p className='text-sm text-rose-800'>{errMessage}</p>
          <button
            type='button'
            onClick={() => refetch()}
            className='rounded-2xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-800'
          >
            Thử lại
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='space-y-6 rounded-3xl border border-amber-900/20 bg-white p-6 shadow-sm'
        >
          {!data && (
            <p className='text-sm text-stone-600'>
              Chưa có tài khoản ngân hàng. Điền form bên dưới và lưu để tạo/cập nhật thông tin.
            </p>
          )}

          <label className='block space-y-1.5'>
            <span className='text-xs font-semibold uppercase tracking-wide text-stone-500'>Tên ngân hàng</span>
            <input
              type='text'
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              autoComplete='off'
              placeholder='VD: TPBANK, Vietcombank…'
              className='w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-800'
            />
          </label>

          <label className='block space-y-1.5'>
            <span className='text-xs font-semibold uppercase tracking-wide text-stone-500'>Số tài khoản</span>
            <input
              type='text'
              inputMode='numeric'
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              autoComplete='off'
              className='w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 font-mono text-sm outline-none focus:border-amber-800'
            />
          </label>

          <label className='block space-y-1.5'>
            <span className='text-xs font-semibold uppercase tracking-wide text-stone-500'>Tên chủ tài khoản</span>
            <input
              type='text'
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              autoComplete='name'
              className='w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-800'
            />
          </label>

          <div className='flex flex-wrap gap-3 pt-2'>
            <button
              type='submit'
              disabled={updateMutation.isPending}
              className='rounded-2xl bg-amber-900 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-60'
            >
              {updateMutation.isPending ? 'Đang lưu…' : 'Lưu cập nhật'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
