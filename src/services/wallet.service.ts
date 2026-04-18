import { walletApi } from './api/walletClient'
import { API_ENDPOINTS } from '@/constants/api.endpoints'

export interface WalletData {
  walletId: string
  accountId: string
  /** Wallet balance (VND) */
  balanceVnd?: number
  /** @deprecated Prefer balanceVnd; kept if API still returns `balance` */
  balance?: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string
}

/** Backend expects PascalCase method names, e.g. PayOs */
export type WalletTopUpMethod = 'Momo' | 'PayOs' | 'VNPay'

export interface WalletTopUpRequest {
  walletId: string
  /** Top-up amount (VND) */
  amount: number
  method: WalletTopUpMethod
}

export interface WalletTopUpResult {
  paymentId: string
  orderCode: number
  paymentUrl: string
  qrCodeUrl?: string
  amount: number
  status: string
  fee: number
  createdAt: string
  message?: string
}

/** Raw item from GET /wallets/{id}/transactions — shape may vary by backend */
export type WalletTransactionItem = {
  id?: string
  paymentId?: string
  transactionId?: string
  type?: string
  transactionType?: string
  description?: string
  note?: string
  title?: string
  /** Amount in VND */
  amountVnd?: number
  amount?: number
  status?: string
  createdAt?: string
  balanceAfterVnd?: number
  balanceAfter?: number
  [key: string]: unknown
}

export interface WalletTransactionsPage {
  items: WalletTransactionItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

/** GET /wallets/seller/account/{accountId} */
export interface SellerWalletAccountResponse {
  walletId: string
  accountId: string
  walletKind: string
  balance: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string | null
}

/** GET /wallets/seller/account/{accountId}/transactions */
export interface SellerWalletTxItem {
  transactionId: string
  walletId: string
  transactionType: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  relatedOrderId?: string | null
  relatedPaymentId?: string | null
  relatedShopId?: string | null
  referenceType?: string | null
  status: string
  createdAt: string
  completedAt?: string | null
  note?: string | null
}

export interface SellerWalletTransactionListResponse {
  items: SellerWalletTxItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateSellerWithdrawalRequest {
  sellerAccountId: string
  shopId: string
  amountVnd: number
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
}

export interface SellerWithdrawalTicketResponse {
  ticketId: string
  sellerAccountId: string
  shopId: string
  amountVnd: number
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  status: string
  reviewedByAccountId?: string | null
  adminNote?: string | null
  createdAt: string
  reviewedAt?: string | null
  paidAt?: string | null
}

function pickNum(...vals: unknown[]): number {
  for (const v of vals) {
    if (v == null || v === '') continue
    const n = typeof v === 'number' ? v : Number(v)
    if (!Number.isNaN(n)) return n
  }
  return 0
}

function normalizeSellerTx(raw: unknown): SellerWalletTxItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const transactionId = String(r.transactionId ?? r.TransactionId ?? r.id ?? '').trim()
  const walletId = String(r.walletId ?? r.WalletId ?? '').trim()
  if (!transactionId || !walletId) return null
  return {
    transactionId,
    walletId,
    transactionType: String(r.transactionType ?? r.TransactionType ?? ''),
    amount: pickNum(r.amount, r.Amount),
    balanceBefore: pickNum(r.balanceBefore, r.BalanceBefore),
    balanceAfter: pickNum(r.balanceAfter, r.BalanceAfter),
    relatedOrderId: (r.relatedOrderId ?? r.RelatedOrderId) as string | null | undefined,
    relatedPaymentId: (r.relatedPaymentId ?? r.RelatedPaymentId) as string | null | undefined,
    relatedShopId: (r.relatedShopId ?? r.RelatedShopId) as string | null | undefined,
    referenceType: (r.referenceType ?? r.ReferenceType) as string | null | undefined,
    status: String(r.status ?? r.Status ?? ''),
    createdAt: String(r.createdAt ?? r.CreatedAt ?? ''),
    completedAt: (r.completedAt ?? r.CompletedAt) as string | null | undefined,
    note: (r.note ?? r.Note) as string | null | undefined,
  }
}

export const walletService = {
  /**
   * Get wallet details by account ID
   */
  getWalletByAccountId: async (accountId: string): Promise<WalletData> => {
    return walletApi.get<WalletData>(API_ENDPOINTS.WALLET.GET_BY_ACCOUNT_ID(accountId))
  },

  /**
   * Get wallet details by ID
   */
  getWalletById: async (walletId: string): Promise<WalletData> => {
    return walletApi.get<WalletData>(API_ENDPOINTS.WALLET.GET_BY_ID(walletId))
  },

  /**
   * Create top-up payment link (redirect user to paymentUrl)
   */
  topUp: async (body: WalletTopUpRequest): Promise<WalletTopUpResult> => {
    return walletApi.post<WalletTopUpResult>(API_ENDPOINTS.WALLET.TOPUP, body)
  },

  /**
   * Paginated wallet transaction history
   */
  getWalletTransactions: async (
    walletId: string,
    params: { page?: number; pageSize?: number } = {}
  ): Promise<WalletTransactionsPage> => {
    const { page = 1, pageSize = 20 } = params
    return walletApi.get<WalletTransactionsPage>(API_ENDPOINTS.WALLET.TRANSACTIONS(walletId), {
      params: { page, pageSize },
    })
  },

  /** Seller ví — GET /wallets/seller/account/{accountId} */
  getSellerWalletByAccountId: async (accountId: string): Promise<SellerWalletAccountResponse> => {
    return walletApi.get<SellerWalletAccountResponse>(API_ENDPOINTS.WALLET.SELLER_ACCOUNT(accountId))
  },

  /** Seller lịch sử ví — GET .../transactions */
  getSellerWalletTransactions: async (
    accountId: string,
    params: { page?: number; pageSize?: number } = {}
  ): Promise<SellerWalletTransactionListResponse> => {
    const { page = 1, pageSize = 20 } = params
    const raw = await walletApi.get<unknown>(API_ENDPOINTS.WALLET.SELLER_ACCOUNT_TRANSACTIONS(accountId), {
      params: { page, pageSize },
    })
    const envelope = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
    const itemsRaw = envelope.items
    const itemsIn = Array.isArray(itemsRaw) ? itemsRaw : []
    const items: SellerWalletTxItem[] = []
    for (const row of itemsIn) {
      const t = normalizeSellerTx(row)
      if (t) items.push(t)
    }
    const totalCount = pickNum(envelope.totalCount, items.length)
    const pageOut = pickNum(envelope.page, page) || page
    const pageSizeOut = pickNum(envelope.pageSize, pageSize) || pageSize
    let totalPages = pickNum(envelope.totalPages, 0)
    if (totalPages <= 0 && totalCount > 0 && pageSizeOut > 0) {
      totalPages = Math.ceil(totalCount / pageSizeOut)
    }
    return { items, totalCount, page: pageOut, pageSize: pageSizeOut, totalPages }
  },

  /** POST /wallets/seller/withdrawals */
  createSellerWithdrawal: async (body: CreateSellerWithdrawalRequest): Promise<SellerWithdrawalTicketResponse> => {
    return walletApi.post<SellerWithdrawalTicketResponse>(API_ENDPOINTS.WALLET.SELLER_WITHDRAWALS, body)
  },
}
