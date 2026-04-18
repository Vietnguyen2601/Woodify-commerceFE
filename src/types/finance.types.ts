/** Seller shop wallet → admin-reviewed payout requests (gateway paths in ADMIN_API.WITHDRAWALS). */
export type WithdrawalTicketStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | string

export interface SellerWithdrawalTicket {
  id: string
  shopId: string
  shopName?: string
  walletId?: string
  amountVnd: number
  status: WithdrawalTicketStatus
  requestedAt?: string
  sellerNote?: string
  adminNote?: string
}
