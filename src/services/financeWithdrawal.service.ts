import { api } from './api/client'
import { ADMIN_API } from '@/constants'
import type {
  AdminReviewWithdrawalRequestBody,
  SellerWithdrawalTicket,
  WithdrawalTicketListResult,
  WithdrawalTicketStatus,
} from '@/types'

function pickStr(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (v == null) continue
    const s = String(v).trim()
    if (s !== '') return s
  }
  return undefined
}

function pickNum(...vals: unknown[]): number {
  for (const v of vals) {
    if (v == null || v === '') continue
    const n = typeof v === 'number' ? v : Number(v)
    if (!Number.isNaN(n)) return n
  }
  return 0
}

function normalizeStatus(v: unknown): WithdrawalTicketStatus {
  const s = pickStr(v) ?? 'PENDING'
  return s.toUpperCase() as WithdrawalTicketStatus
}

function normalizeWithdrawalTicket(raw: unknown): SellerWithdrawalTicket | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = pickStr(r.ticketId, r.id, r.withdrawalRequestId, r.requestId, r.Id)
  const shopId = pickStr(r.shopId, r.ShopId, r.shopID)
  if (!id || !shopId) return null
  const amountVnd = pickNum(r.amountVnd, r.amount, r.requestedAmountVnd, r.AmountVnd, r.Amount, r.netAmountVnd, 0)
  return {
    id,
    shopId,
    shopName: pickStr(r.shopName, r.ShopName, r.shopTitle),
    sellerAccountId: pickStr(r.sellerAccountId, r.SellerAccountId),
    walletId: pickStr(r.walletId, r.WalletId),
    amountVnd,
    status: normalizeStatus(r.status ?? r.Status),
    requestedAt: pickStr(r.createdAt, r.requestedAt, r.CreatedAt, r.submittedAt),
    sellerNote: pickStr(r.sellerNote, r.SellerNote, r.message),
    adminNote: pickStr(r.adminNote, r.AdminNote, r.rejectionReason),
    bankName: pickStr(r.bankName, r.BankName),
    bankAccountNumber: pickStr(r.bankAccountNumber, r.BankAccountNumber),
    bankAccountHolder: pickStr(r.bankAccountHolder, r.BankAccountHolder),
    reviewedByAccountId: pickStr(r.reviewedByAccountId, r.ReviewedByAccountId) ?? null,
    reviewedAt: pickStr(r.reviewedAt, r.ReviewedAt) ?? null,
    paidAt: pickStr(r.paidAt, r.PaidAt) ?? null,
  }
}

function coerceListPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null
  return raw as Record<string, unknown>
}

function getErrorStatus(e: unknown): number | undefined {
  if (e && typeof e === 'object' && 'status' in e) {
    const s = (e as { status?: number }).status
    if (typeof s === 'number') return s
  }
  return undefined
}

export interface ListAdminWithdrawalsParams {
  /** API: Pending | Approved | Rejected | Paid — omit or empty for all */
  status?: string
  page?: number
  pageSize?: number
}

function buildListUrl(params: ListAdminWithdrawalsParams): string {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const q = new URLSearchParams()
  q.set('page', String(page))
  q.set('pageSize', String(pageSize))
  const st = params.status?.trim()
  if (st) q.set('status', st)
  return `${ADMIN_API.WITHDRAWALS.LIST}?${q.toString()}`
}

export const financeWithdrawalService = {
  listWithdrawals: async (params: ListAdminWithdrawalsParams = {}): Promise<WithdrawalTicketListResult> => {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const url = buildListUrl({ ...params, page, pageSize })
    try {
      const raw = await api.get<unknown>(url)
      const envelope = coerceListPayload(raw)
      const itemsRaw = envelope?.items
      const itemsIn = Array.isArray(itemsRaw) ? itemsRaw : []
      const items: SellerWithdrawalTicket[] = []
      for (const row of itemsIn) {
        const t = normalizeWithdrawalTicket(row)
        if (t) items.push(t)
      }
      const totalCount = pickNum(envelope?.totalCount, items.length)
      const pageOut = pickNum(envelope?.page, page) || page
      const pageSizeOut = pickNum(envelope?.pageSize, pageSize) || pageSize
      let totalPages = pickNum(envelope?.totalPages, 0)
      if (totalPages <= 0 && totalCount > 0 && pageSizeOut > 0) {
        totalPages = Math.ceil(totalCount / pageSizeOut)
      }
      return { items, totalCount, page: pageOut, pageSize: pageSizeOut, totalPages }
    } catch (e) {
      if (getErrorStatus(e) === 404) {
        return { items: [], totalCount: 0, page: 1, pageSize, totalPages: 0 }
      }
      throw e
    }
  },

  approveTicket: async (ticketId: string, body: AdminReviewWithdrawalRequestBody): Promise<void> => {
    await api.post<unknown>(ADMIN_API.WITHDRAWALS.APPROVE(ticketId), body)
  },

  rejectTicket: async (ticketId: string, body: AdminReviewWithdrawalRequestBody): Promise<void> => {
    await api.post<unknown>(ADMIN_API.WITHDRAWALS.REJECT(ticketId), body)
  },

  markPaidTicket: async (ticketId: string, body: AdminReviewWithdrawalRequestBody): Promise<void> => {
    await api.post<unknown>(ADMIN_API.WITHDRAWALS.MARK_PAID(ticketId), body)
  },
}
