/** Seller shop wallet → admin-reviewed payout requests (`ADMIN_API.WITHDRAWALS`). */
export type WithdrawalTicketStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'COMPLETED'
  | string

/** Normalized admin withdrawal ticket (maps API `ticketId` → `id`). */
export interface SellerWithdrawalTicket {
  id: string
  shopId: string
  shopName?: string
  sellerAccountId?: string
  walletId?: string
  amountVnd: number
  status: WithdrawalTicketStatus
  requestedAt?: string
  sellerNote?: string
  adminNote?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  reviewedByAccountId?: string | null
  reviewedAt?: string | null
  paidAt?: string | null
}

export interface WithdrawalTicketListResult {
  items: SellerWithdrawalTicket[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminReviewWithdrawalRequestBody {
  adminAccountId: string
  note?: string | null
}
