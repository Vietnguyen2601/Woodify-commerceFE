import { api } from './api/client'
import { ADMIN_API } from '@/constants'
import type { SellerWithdrawalTicket, WithdrawalTicketStatus } from '@/types'

function coerceItems(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown }).items)) {
    return (raw as { items: unknown[] }).items
  }
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data: unknown }).data
    return coerceItems(inner)
  }
  return []
}

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
  const id = pickStr(r.id, r.withdrawalRequestId, r.ticketId, r.requestId, r.Id)
  const shopId = pickStr(r.shopId, r.ShopId, r.shopID)
  if (!id || !shopId) return null
  const amountVnd = pickNum(
    r.amountVnd,
    r.amount,
    r.requestedAmountVnd,
    r.AmountVnd,
    r.Amount,
    r.netAmountVnd,
    0
  )
  return {
    id,
    shopId,
    shopName: pickStr(r.shopName, r.ShopName, r.shopTitle),
    walletId: pickStr(r.walletId, r.WalletId),
    amountVnd,
    status: normalizeStatus(r.status ?? r.Status),
    requestedAt: pickStr(r.requestedAt, r.createdAt, r.CreatedAt, r.submittedAt),
    sellerNote: pickStr(r.sellerNote, r.note, r.SellerNote, r.message),
    adminNote: pickStr(r.adminNote, r.AdminNote, r.rejectionReason),
  }
}

function getErrorStatus(e: unknown): number | undefined {
  if (e && typeof e === 'object' && 'status' in e) {
    const s = (e as { status?: number }).status
    if (typeof s === 'number') return s
  }
  return undefined
}

async function getFirstList(paths: readonly string[]): Promise<unknown[]> {
  let lastErr: unknown
  for (const url of paths) {
    try {
      const raw = await api.get<unknown>(url)
      return coerceItems(raw)
    } catch (e) {
      lastErr = e
      const st = getErrorStatus(e)
      if (st === 404 || st === 405 || (st != null && st >= 500)) continue
      throw e
    }
  }
  if (lastErr) {
    const st = getErrorStatus(lastErr)
    if (st === 404) return []
  }
  return []
}

async function postFirstOk(paths: readonly string[], body: unknown): Promise<void> {
  let lastErr: unknown
  for (const url of paths) {
    try {
      await api.post<unknown>(url, body)
      return
    } catch (e) {
      lastErr = e
      const st = getErrorStatus(e)
      if (st === 404 || st === 405 || (st != null && st >= 500)) continue
      throw e
    }
  }
  throw lastErr ?? new Error('Withdrawal API not available')
}

export const financeWithdrawalService = {
  /** Returns normalized tickets; empty array if no gateway route matches yet. */
  listTickets: async (): Promise<SellerWithdrawalTicket[]> => {
    const rows = await getFirstList(ADMIN_API.WITHDRAWALS.LIST)
    const out: SellerWithdrawalTicket[] = []
    for (const row of rows) {
      const t = normalizeWithdrawalTicket(row)
      if (t) out.push(t)
    }
    return out
  },

  approveTicket: async (ticketId: string): Promise<void> => {
    await postFirstOk(ADMIN_API.WITHDRAWALS.APPROVE(ticketId), {})
  },

  rejectTicket: async (ticketId: string, note?: string): Promise<void> => {
    await postFirstOk(ADMIN_API.WITHDRAWALS.REJECT(ticketId), { note: note ?? '', adminNote: note ?? '' })
  },
}
